import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EvaluationResult } from "@/types";
import EvaluationResultCard from "./EvaluationResultCard";

export function EvaluationResults({ results }: { results: EvaluationResult }) {
  return (
    <div className="space-y-6 mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {/* <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
            {results.evaluation.summary}
          </p> */}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Ranked Candidates</h2>
        {results.candidates.map((candidate, index) => (
          <EvaluationResultCard
            key={candidate.id}
            candidate={candidate}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
