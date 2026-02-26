import pdf from "pdf-parse";
import mammoth from "mammoth";

export async function extractTextFromBuffer(buffer, mimeType) {
  if (mimeType === "application/pdf") {
    const data = await pdf(buffer);
    return cleanText(data.text);
  }

  // DOCX
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return cleanText(result.value);
  }

  throw new Error("Unsupported file type. Use PDF or DOCX.");
}

function cleanText(t) {
  return (t || "")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}