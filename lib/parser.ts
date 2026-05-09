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
    // Numbered sections: 1., 2., 1.1, 1.2.3, etc.
    /(?=\n\s*\d+(?:\.\d+)*\s*[.)]?\s+[A-Z])/g,
    // ALL-CAPS headings
    /(?=\n\s*[A-Z][A-Z\s]{3,}(?:\n|:))/g,
    // Legal markers
    /(?=\n\s*(?:WHEREAS|NOW,?\s*THEREFORE|IN WITNESS WHEREOF|ARTICLE|SECTION))/gi,
    // Double newlines (paragraph breaks)
    /\n\s*\n/g,
  ];

  // First, try splitting by numbered sections
  let clauses = splitByNumberedSections(normalizedText);

  // If we don't get enough clauses, try other patterns
  if (clauses.length < 3) {
    clauses = splitByParagraphs(normalizedText);
  }

  // Process and filter clauses
  clauses = clauses
    .map((clause) => cleanClause(clause))
    .filter((clause) => clause.length >= MIN_CLAUSE_LENGTH);

  // Sub-split long clauses
  clauses = clauses.flatMap((clause) => {
    if (clause.length > MAX_CLAUSE_LENGTH) {
      return splitLongClause(clause);
    }
    return [clause];
  });

  // Filter again after sub-splitting
  clauses = clauses.filter((clause) => clause.length >= MIN_CLAUSE_LENGTH);

  // Cap at max clauses
  return clauses.slice(0, MAX_CLAUSES);
}

/**
 * Split text by numbered section patterns
 */
function splitByNumberedSections(text: string): string[] {
  // Match sections starting with numbers like "1.", "1.1", "2.3.4"
  const sectionRegex = /(?:^|\n)(\d+(?:\.\d+)*\.?\s+)/;
  const parts = text.split(sectionRegex);

  const clauses: string[] = [];
  let currentClause = "";

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    // Check if this part is a section number
    if (/^\d+(?:\.\d+)*\.?\s*$/.test(part.trim())) {
      // Save previous clause if exists
      if (currentClause.trim()) {
        clauses.push(currentClause.trim());
      }
      currentClause = part;
    } else {
      currentClause += part;
    }
  }

  // Don't forget the last clause
  if (currentClause.trim()) {
    clauses.push(currentClause.trim());
  }

  // If numbered splitting didn't work well, return empty to try other methods
  if (clauses.length < 3) {
    return [];
  }

  return clauses;
}

/**
 * Split text by paragraph breaks and legal markers
 */
function splitByParagraphs(text: string): string[] {
  // Split by double newlines
  let paragraphs = text.split(/\n\s*\n/);

  // Also split by legal markers if found
  paragraphs = paragraphs.flatMap((para) => {
    const markers =
      /(?=(?:WHEREAS|NOW,?\s*THEREFORE|IN WITNESS WHEREOF|ARTICLE\s+\w+|SECTION\s+\w+))/gi;
    const subParts = para.split(markers);
    return subParts.length > 1 ? subParts : [para];
  });

  // Split by ALL-CAPS headings
  paragraphs = paragraphs.flatMap((para) => {
    const capsHeading = /(?=\n[A-Z][A-Z\s]{5,}(?:\n|$))/;
    const subParts = para.split(capsHeading);
    return subParts.length > 1 ? subParts : [para];
  });

  return paragraphs;
}

/**
 * Split a long clause into smaller parts at paragraph boundaries
 */
function splitLongClause(clause: string): string[] {
  // Try splitting at sentence boundaries first
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

/**
 * Clean up a clause string
 */
function cleanClause(clause: string): string {
  return clause
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/^\s*[-•*]\s*/, "") // Remove bullet points
    .trim();
}

/**
 * Extract text from a PDF buffer using pdf-parse
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  // Dynamic import to avoid bundling issues
  const pdfParseModule = await import("pdf-parse");
  
  // Safely handle both CommonJS and ES Module resolution
  const pdfParse = (pdfParseModule as any).default || pdfParseModule;

  const data = await pdfParse(buffer);
  return data.text;
}
