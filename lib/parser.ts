/**
 * Contract text parser that splits raw contract text into individual clauses
 */

const MAX_CLAUSES = 40;
const MIN_CLAUSE_LENGTH = 20;
const MAX_CLAUSE_LENGTH = 1500;

/**
 * Split raw contract text into an array of clause strings
 */
export function parseContractText(text: string): string[] {
  if (!text || typeof text !== "string") {
    return [];
  }

  // Normalize whitespace and line endings
  let normalizedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/ +/g, " ")
    .trim();

  // Split by various legal markers and section patterns
  const splitPatterns = [
    /(?=\n\s*\d+(?:\.\d+)*\s*[.)]?\s+[A-Z])/g,
    /(?=\n\s*[A-Z][A-Z\s]{3,}(?:\n|:))/g,
    /(?=\n\s*(?:WHEREAS|NOW,?\s*THEREFORE|IN WITNESS WHEREOF|ARTICLE|SECTION))/gi,
    /\n\s*\n/g,
  ];

  let clauses = splitByNumberedSections(normalizedText);

  if (clauses.length < 3) {
    clauses = splitByParagraphs(normalizedText);
  }

  clauses = clauses
    .map((clause) => cleanClause(clause))
    .filter((clause) => clause.length >= MIN_CLAUSE_LENGTH);

  clauses = clauses.flatMap((clause) => {
    if (clause.length > MAX_CLAUSE_LENGTH) {
      return splitLongClause(clause);
    }
    return [clause];
  });

  clauses = clauses.filter((clause) => clause.length >= MIN_CLAUSE_LENGTH);

  return clauses.slice(0, MAX_CLAUSES);
}

function splitByNumberedSections(text: string): string[] {
  const sectionRegex = /(?:^|\n)(\d+(?:\.\d+)*\.?\s+)/;
  const parts = text.split(sectionRegex);

  const clauses: string[] = [];
  let currentClause = "";

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    if (/^\d+(?:\.\d+)*\.?\s*$/.test(part.trim())) {
      if (currentClause.trim()) {
        clauses.push(currentClause.trim());
      }
      currentClause = part;
    } else {
      currentClause += part;
    }
  }

  if (currentClause.trim()) {
    clauses.push(currentClause.trim());
  }

  if (clauses.length < 3) {
    return [];
  }

  return clauses;
}

function splitByParagraphs(text: string): string[] {
  let paragraphs = text.split(/\n\s*\n/);

  paragraphs = paragraphs.flatMap((para) => {
    const markers =
      /(?=(?:WHEREAS|NOW,?\s*THEREFORE|IN WITNESS WHEREOF|ARTICLE\s+\w+|SECTION\s+\w+))/gi;
    const subParts = para.split(markers);
    return subParts.length > 1 ? subParts : [para];
  });

  paragraphs = paragraphs.flatMap((para) => {
    const capsHeading = /(?=\n[A-Z][A-Z\s]{5,}(?:\n|$))/;
    const subParts = para.split(capsHeading);
    return subParts.length > 1 ? subParts : [para];
  });

  return paragraphs;
}

function splitLongClause(clause: string): string[] {
  const sentences = clause.split(/(?<=[.!?])\s+/);

  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if (
      currentChunk.length + sentence.length > MAX_CLAUSE_LENGTH &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? " " : "") + sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

function cleanClause(clause: string): string {
  return clause
    .replace(/\s+/g, " ")
    .replace(/^\s*[-•*]\s*/, "")
    .trim();
}

/**
 * Extract text from a PDF buffer using pdf-parse
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  // Safe, localized require inside the function
  const pdfParse = require("pdf-parse");
  const data = await pdfParse(buffer);
  return data.text || "";
}