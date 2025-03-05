import { NextResponse } from "next/server";
import { evaluateCandidates } from "@/lib/actions/actions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jd = searchParams.get("jd");

  if (!jd) {
    return NextResponse.json(
      { error: "Missing job description parameter" },
      { status: 400 }
    );
  }

  try {
    const results = await evaluateCandidates(jd);
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: "Evaluation failed" }, { status: 500 });
  }
}
