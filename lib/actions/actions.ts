"use server";

import {
  extractResumeKeywords,
  generateResumeSummary,
} from "@/lib/resume-processor";
import {
  CandidateMissingSkills,
  EvaluationResult,
  ResumeMetadata,
} from "@/types";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

const getTextEmbedding = async (text: string) => {
  const model = genAI.getGenerativeModel({ model: "embedding-001" });
  const result = await model.embedContent(text);
  return result.embedding.values;
};

export const createCandidate = async (formData: FormData) => {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const linkedin = formData.get("linkedin") as string;
    const skills = formData.get("skills") as string;
    const resumeFile = formData.get("resume") as File;
    const experience = formData.get("experience") as string;

    const parseFormData = new FormData();
    parseFormData.append("file", resumeFile);
    const parseRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/parse-pdf`,
      {
        method: "POST",
        body: parseFormData,
      }
    );
    if (!parseRes.ok) throw new Error("PDF parsing failed");
    const { text, metadata } = await parseRes.json();

    const [keywords, summary] = await Promise.all([
      extractResumeKeywords(text),
      generateResumeSummary(text),
    ]);
    if (!keywords) throw new Error("Failed to extract resume keywords");

    const resumeMetadata: ResumeMetadata = {
      fileName: resumeFile.name,
      fileSize: resumeFile.size,
      fileType: resumeFile.type,
      skills: JSON.stringify(keywords.skills) || skills,
      experience: JSON.stringify(keywords.experience) || experience,
      education: JSON.stringify(keywords.education),
      summary,
      parsedSkills: JSON.stringify([...keywords.skills, ...skills.split(",")]),
      totalExperience: keywords.totalExperience,
    };

    const embeddingContent = `
      Skills: ${keywords.skills.join(", ")}
      Experience: ${keywords.experience.join(", ")}
      Education: ${keywords.education.join(", ")}
      Summary: ${summary}
      Additional Skills: ${skills}
    `;
    const embedding = await getTextEmbedding(embeddingContent);

    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);
    await index.upsert([
      {
        id: crypto.randomUUID(),
        values: embedding,
        metadata: {
          name,
          email,
          linkedin,
          resumeText: text,
          ...resumeMetadata,
        },
      },
    ]);

    return { success: true };
  } catch (error) {
    console.error("Candidate creation error:", error);
    throw new Error("Failed to process application");
  }
};

export const evaluateCandidates = async (
  jobDescription: string
): Promise<EvaluationResult> => {
  try {
    const jdEmbedding = await getTextEmbedding(jobDescription);
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);
    const { matches } = await index.query({
      vector: jdEmbedding,
      topK: 10,
      includeMetadata: true,
    });

    const candidates = matches.map((m) => {
      if (!m.metadata) {
        throw new Error(`Metadata is missing for match with id: ${m.id}`);
      }
      return {
        id: m.id,
        score: m.score || 0,
        name: m.metadata.name as string,
        email: m.metadata.email as string,
        linkedin: m.metadata.linkedin as string,
        skills: m.metadata.skills as string,
        experience: m.metadata.experience as string,
        education: m.metadata.education as string,
        resumeText: m.metadata.resumeText as string,
        metadata: {
          fileName: m.metadata.fileName as string,
          fileSize: m.metadata.fileSize as number,
          fileType: m.metadata.fileType as string,
          skills: JSON.parse(m.metadata.skills as string),
          experience: JSON.parse(m.metadata.experience as string),
          education: JSON.parse(m.metadata.education as string),
          summary: m.metadata.summary as string,
          parsedSkills: JSON.parse(m.metadata.parsedSkills as string),
          totalExperience: m.metadata.totalExperience as number,
        },
      };
    });

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Evaluate candidates for: ${jobDescription}\n\nCandidates: ${JSON.stringify(
      candidates.map((c) => ({
        name: c.name,
        skills: c.metadata.skills,
        experience: c.metadata.experience,
        education: c.metadata.education,
      }))
    )}\n\nProvide: Top 3 candidates with scores, missing skills, and recommendations`;

    const evaluation = await model.generateContent(prompt);
    const evaluationText = evaluation.response.text();
    const parsedEvaluations = await extractMissingSkills(evaluationText);

    const updatedCandidates = candidates.map((candidate) => {
      const evaluation = parsedEvaluations.find(
        (e) => e.name === candidate.name
      );
      return evaluation
        ? {
            ...candidate,
            metadata: {
              ...candidate.metadata,
              missingSkills: evaluation.missingSkills,
            },
          }
        : candidate;
    });

    // const topCandidates = parsedEvaluations
    //   .sort((a, b) => b.score - a.score)
    //   .map((e) => ({
    //     ...updatedCandidates.find((c) => c.name === e.name),
    //     score: e.score,
    //     missingSkills: e.missingSkills,
    //     name: e.name,
    //   }));

    // console.log("Updated candidates:", updatedCandidates);

    return {
      candidates: updatedCandidates,
      evaluation: {
        topCandidates: [],
        summary: evaluationText,
      },
    };
  } catch (error) {
    console.error("Evaluation error:", error);
    throw new Error("Failed to evaluate candidates");
  }
};

export async function extractMissingSkills(
  apiOutput: string
): Promise<CandidateMissingSkills[]> {
  const candidateSections = apiOutput.split(/\*\*\d+\. /g);
  const results: CandidateMissingSkills[] = [];

  for (let i = 1; i < candidateSections.length; i++) {
    const section = candidateSections[i];
    const candidateMatch = section;
    if (!candidateMatch) continue;

    const name = candidateMatch[0].trim();
    const missingSkills: string[] = [];

    const missingSkillsStart = section.indexOf("**Missing Skills:**");
    if (missingSkillsStart === -1) continue;

    const remainingText = section.slice(missingSkillsStart);
    const skillMatches = remainingText.matchAll(
      /\*\s+\*\s+(.*?)(?=\n\s*\*|$)/g
    );

    for (const match of skillMatches) {
      missingSkills.push(match[1].trim().replace(/\.$/, ""));
    }

    results.push({
      name,
      missingSkills,
    });
  }

  return results;
}
