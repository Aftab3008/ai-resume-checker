export type Candidate = {
  id: string;
  name: string;
  email: string;
  linkedin: string;
  skills: string;
  resumeText: string;
  metadata: ResumeMetadata;
  score?: number;
  experience: string;
  missingSkills?: string[];
};

export type ResumeMetadata = {
  fileName: string;
  fileSize: number;
  fileType: string;
  skills: string;
  experience: string;
  education: string;
  summary: string;
  parsedSkills: string;
  totalExperience?: number;
};

export type EvaluationResult = {
  candidates: Candidate[];
  evaluation: {
    topCandidates: Array<{
      id: string;
      matchScore: number;
      strengths: string[];
      missingSkills: string[];
      recommendation: string;
    }>;
    summary: string;
  };
};

export interface CompanyTitle {
  company: string;
  title: string;
}

export interface CandidateMissingSkills {
  name: string;
  missingSkills: string[];
}
