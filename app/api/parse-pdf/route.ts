import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import PDFParser from "pdf2json";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileName = `${Date.now()}-${file.name}`;
    const tempFilePath = path.join(process.cwd(), "tmp", fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(tempFilePath, buffer);

    const pdfParser = new PDFParser(null, true);
    let parsedText = "";

    const parsePromise = new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (err) => reject(err));
      pdfParser.on("pdfParser_dataReady", () => {
        parsedText = (pdfParser as any).getRawTextContent();
        resolve(parsedText);
      });
    });

    pdfParser.loadPDF(tempFilePath);
    await parsePromise;

    await fs.unlink(tempFilePath);

    return NextResponse.json({
      text: parsedText,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      },
    });
  } catch (error) {
    console.error("PDF parsing error:", error);
    return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
  }
}
