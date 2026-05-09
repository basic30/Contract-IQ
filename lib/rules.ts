import type { RiskLevel, RuleMatch } from "@/types";

interface RulePattern {
  pattern: RegExp;
  risk: RiskLevel;
  reason: string;
}

// HIGH risk patterns - serious red flags
const highRiskPatterns: RulePattern[] = [
  {
    pattern: /unlimited\s+liability/gi,
    risk: "high",
    reason: "Unlimited liability exposes you to potentially catastrophic financial risk",
  },
  {
    pattern: /indemnif(?:y|ication)[\s\S]{0,100}(?:any|all)\s+(?:loss|damage|claim|cost)/gi,
    risk: "high",
    reason: "Broad indemnification clause requires you to cover any/all losses",
  },
  {
    pattern: /irrevocabl(?:y|e)\s+(?:assign|transfer|grant|waive)/gi,
    risk: "high",
    reason: "Irrevocable terms cannot be undone and permanently bind you",
  },
  {
    pattern: /perpetual(?:\s+and\s+irrevocable)?\s+(?:license|right|assignment)/gi,
    risk: "high",
    reason: "Perpetual license grants last forever with no way to reclaim rights",
  },
  {
    pattern: /(?:sole|absolute|unfettered)\s+discretion/gi,
    risk: "high",
    reason: "Sole discretion clauses give the other party unchecked power over decisions",
  },
  {
    pattern: /(?:may\s+not|cannot|shall\s+not)\s+terminat(?:e|ion)/gi,
    risk: "high",
    reason: "Restrictions on termination trap you in the agreement",
  },
  {
    pattern: /auto(?:matic(?:ally)?)?[\s-]*renew(?:al|s|ing)?/gi,
    risk: "high",
    reason: "Auto-renewal can lock you into extended commitments without explicit consent",
  },
  {
    pattern: /waive(?:s|r)?\s+(?:any|all)\s+(?:right|claim|defense)/gi,
    risk: "high",
    reason: "Broad rights waivers strip you of legal protections",
  },
  {
    pattern: /(?:assumes?|bear)\s+(?:all|unlimited|full)\s+(?:risk|liability)/gi,
    risk: "high",
    reason: "Assuming all risk/liability leaves you fully exposed",
  },
  {
    pattern: /without\s+(?:Client's|other\s+party's)\s+(?:prior\s+)?(?:written\s+)?consent/gi,
    risk: "high",
    reason: "Restrictions requiring consent give the other party veto power over your actions",
  },
  {
    pattern: /(?:no|without)\s+(?:right\s+to|ability\s+to)\s+(?:terminate|cancel|withdraw)/gi,
    risk: "high",
    reason: "Elimination of termination rights removes your ability to exit",
  },
];

// MEDIUM risk patterns - worth attention
const mediumRiskPatterns: RulePattern[] = [
  {
    pattern: /reasonable\s+(?:efforts?|endeavou?rs?|best\s+efforts?)/gi,
    risk: "medium",
    reason: "Vague 'reasonable efforts' standard lacks clear definition and metrics",
  },
  {
    pattern: /(?:at\s+(?:its|their|our)\s+)?(?:option|discretion)/gi,
    risk: "medium",
    reason: "Discretionary terms allow subjective decision-making by the other party",
  },
  {
    pattern: /(?:net|payment\s+terms?)\s*(?:of\s+)?(?:30|45|60|90)\s*(?:days?)?/gi,
    risk: "medium",
    reason: "Extended payment terms can strain cash flow for service providers",
  },
  {
    pattern: /confidential(?:ity)?\s+(?:obligations?|agreement|information)/gi,
    risk: "medium",
    reason: "Confidentiality obligations restrict what you can share and with whom",
  },
  {
    pattern: /non[\s-]?compete/gi,
    risk: "medium",
    reason: "Non-compete clauses can limit your future business opportunities",
  },
  {
    pattern: /govern(?:ing|ed\s+by)\s+(?:the\s+)?law(?:s)?\s+of/gi,
    risk: "medium",
    reason: "Governing law clause determines which jurisdiction's laws apply",
  },
  {
    pattern: /force\s+majeure/gi,
    risk: "medium",
    reason: "Force majeure terms define when obligations are excused due to extraordinary events",
  },
  {
    pattern: /(?:intellectual\s+property|IP)\s+(?:rights?|ownership|assignment)/gi,
    risk: "medium",
    reason: "IP ownership terms determine who owns work product and creations",
  },
  {
    pattern: /exclusive(?:\s+rights?|\s+license)?/gi,
    risk: "medium",
    reason: "Exclusive terms may prevent you from similar work with others",
  },
  {
    pattern: /arbitration/gi,
    risk: "medium",
    reason: "Mandatory arbitration limits your access to court remedies",
  },
  {
    pattern: /(?:twenty[\s-]?four|24|thirty[\s-]?six|36)\s*(?:months?|years?)/gi,
    risk: "medium",
    reason: "Extended time periods in restrictions can significantly limit your options",
  },
  {
    pattern: /non[\s-]?solicitation/gi,
    risk: "medium",
    reason: "Non-solicitation clauses restrict your ability to work with certain contacts",
  },
  {
    pattern: /(?:survive|surviving)\s+(?:termination|expiration)/gi,
    risk: "medium",
    reason: "Survival clauses extend certain obligations beyond the agreement's end",
  },
  {
    pattern: /work\s+(?:for\s+hire|made\s+for\s+hire|product)/gi,
    risk: "medium",
    reason: "Work for hire terms automatically assign IP rights to the hiring party",
  },
];

/**
 * Scan clause text against rule patterns and return matches
 */
export function scanClauseWithRules(clauseText: string): RuleMatch[] {
  const matches: RuleMatch[] = [];

  // Check high risk patterns first
  for (const rule of highRiskPatterns) {
    const match = clauseText.match(rule.pattern);
    if (match) {
      matches.push({
        risk: rule.risk,
        matchedText: match[0],
        reason: rule.reason,
      });
    }
  }

  // Then check medium risk patterns
  for (const rule of mediumRiskPatterns) {
    const match = clauseText.match(rule.pattern);
    if (match) {
      // Avoid duplicate matches for same text
      const alreadyMatched = matches.some(
        (m) => m.matchedText.toLowerCase() === match[0].toLowerCase()
      );
      if (!alreadyMatched) {
        matches.push({
          risk: rule.risk,
          matchedText: match[0],
          reason: rule.reason,
        });
      }
    }
  }

  return matches;
}

/**
 * Get the highest risk level from a set of matches
 */
export function getHighestRisk(matches: RuleMatch[]): RiskLevel {
  if (matches.some((m) => m.risk === "high")) return "high";
  if (matches.some((m) => m.risk === "medium")) return "medium";
  return "low";
}

/**
 * Format rule matches into a hint for the AI
 */
export function formatRuleHint(matches: RuleMatch[]): string {
  if (matches.length === 0) {
    return "No specific risk patterns detected by rule engine.";
  }

  const hints = matches.map(
    (m) => `- ${m.risk.toUpperCase()} risk: "${m.matchedText}" - ${m.reason}`
  );

  return `Rule-based pre-scan detected:\n${hints.join("\n")}`;
}
