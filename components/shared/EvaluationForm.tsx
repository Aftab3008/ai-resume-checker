"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EvaluationResult } from "@/types";
import { EvaluationResults } from "@/components/shared/EvaluationResults";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function EvaluationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [results, setResults] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const jd = searchParams.get("jd");
    if (jd) {
      fetchResults(jd);
    }
  }, [searchParams]);

  const fetchResults = async (jd: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/recruit?jd=${encodeURIComponent(jd)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch results");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const jd = formData.get("jd") as string;

    router.push(`/recruit?jd=${encodeURIComponent(jd)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Job Description
        </label>
        <Textarea
          name="jd"
          placeholder="Enter job description..."
          className="min-h-[200px]"
          required
          disabled={isLoading}
          defaultValue={decodeURIComponent(searchParams.get("jd") || "")}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Evaluating..." : "Evaluate Candidates"}
      </Button>

      {isLoading && <div className="text-center">Loading...</div>}
      {error && <div className="text-red-500 text-center">{error}</div>}
      {results && <EvaluationResults results={results} />}
    </form>
  );
}
