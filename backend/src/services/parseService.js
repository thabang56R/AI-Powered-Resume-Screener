import fs from "fs";
import pdf from "pdf-parse";

export const extractTextFromPDF = async (filePath) => {
  const buffer = fs.readFileSync(filePath);

  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (e) {
    return buffer.toString("utf8");
  }
};
