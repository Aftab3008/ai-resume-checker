import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { parseCompanyTitle, ParseResponse } from "@/lib/utils";
import { Candidate } from "@/types";
import Link from "next/link";

export default function EvaluationResultCard({
  candidate,
  index,
}: {
  candidate: Candidate;
  index: number;
}) {
  const skills = ParseResponse(candidate.skills);
  const experience = parseCompanyTitle(candidate.experience);
  return (
    <Card key={candidate.id}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>
            <span className="mr-2">{index + 1}.</span>
            {candidate.name.charAt(0).toUpperCase() + candidate.name.slice(1)}
          </div>
          <Badge variant="outline" className="ml-2">
            Score: {Math.round(candidate.score! * 100)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">
          <strong>Email:</strong> {candidate.email}
        </p>
        <p className="text-sm">
          <strong>LinkedIn:</strong>{" "}
          <Link
            href={candidate.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            {candidate.linkedin}
          </Link>
        </p>
        <div className="text-sm">
          <strong>Skills:</strong> <br />
          {skills.map((skill) => (
            <Badge key={skill} className="mr-2 my-1">
              {skill.toLowerCase()}
            </Badge>
          ))}
        </div>
        <div>
          <strong>Experience:</strong>
          {experience.length > 0 ? (
            <ul className="list-disc pl-4">
              {experience.map((exp) => (
                <li key={exp.company}>
                  {exp.title} at {exp.company}
                </li>
              ))}
            </ul>
          ) : (
            <span>Not specified</span>
          )}
        </div>
        {candidate.missingSkills && candidate.missingSkills?.length > 0 && (
          <div className="text-sm">
            <strong>Missing Skills for your job description</strong> <br />
            {candidate.missingSkills.map((skill) => (
              <Badge key={skill} className="mr-2 my-1">
                {skill.toLowerCase()}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
