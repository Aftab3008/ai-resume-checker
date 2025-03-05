import BackButton from "@/components/shared/BackButton";
import { CandidateForm } from "@/components/shared/CandidateForm";
import ContinueButton from "@/components/shared/ContinueButton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Candidate Evaluation Platform",
  description: "Submit your application and get AI-powered career matching",
  keywords: ["jobs", "career", "AI recruitment", "candidate evaluation"],
};

export default function Home() {
  return (
    <>
      <div className="flex justify-end items-center mb-8">
        <ContinueButton />
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Submit your application and get matched with the best opportunities
        using AI technology
      </p>
      <CandidateForm />
    </>
  );
}
