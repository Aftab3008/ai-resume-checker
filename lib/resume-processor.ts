import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

interface ResumeKeywords {
  skills: string[];
  experience: string[];
  education: string[];
  totalExperience?: number;
}

export const extractResumeKeywords = async (
  text: string
): Promise<ResumeKeywords | null> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Extract from resume:
    - Skills (technical skills only as array)
    - Experience (array of company names and job titles)
    - Education (array of degrees and institutions)
    - Total experience in years
    Return JSON only. Resume: ${text.substring(0, 30000)}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    return JSON.parse(response.replace(/```json/g, "").replace(/```/g, ""));
  } catch (error) {
    console.error("Error processing resume:", error);
    return null;
  }
};

export const generateResumeSummary = async (text: string): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `Generate 75-word professional summary: ${text.substring(
    0,
    30000
  )}`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};
