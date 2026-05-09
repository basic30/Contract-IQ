"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, X, Loader2, Lightbulb, AlertTriangle, Info } from "lucide-react";
import type { Clause, SimulateResponse } from "@/types";
import { RiskBadge } from "./RiskBadge";

interface ClauseCardProps {
  clause: Clause;
  onSimulate: (clauseId: string, newText: string) => Promise<SimulateResponse>;
  onClauseUpdate: (updatedClause: Clause) => void;
  isHighlighted?: boolean;
}

export function ClauseCard({
  clause,
  onSimulate,
  onClauseUpdate,
  isHighlighted = false,
}: ClauseCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(clause.text);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Scroll into view and highlight when isHighlighted changes
  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isHighlighted]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditText(clause.text);
    setError(null);
  };

  const handleSimulate = async () => {
    if (editText.trim().length < 10) {
      setError("Clause text must be at least 10 characters.");
      return;
    }

    setIsSimulating(true);
    setError(null);

    try {
      const response = await onSimulate(clause.id, editText.trim());
      onClauseUpdate(response.updatedClause);
      setIsEditing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Simulation failed. Please try again."
      );
    } finally {
      setIsSimulating(false);
    }
  };

  // Highlight the risky phrase in the clause text
  const renderClauseText = () => {
    const { text, highlightedText, risk } = clause;

    if (!highlightedText || !text.includes(highlightedText)) {
      return <span>{text}</span>;
    }

    const index = text.indexOf(highlightedText);
    const before = text.slice(0, index);
    const after = text.slice(index + highlightedText.length);

    const highlightClass =
      risk === "high"
        ? "bg-risk-high/20 text-risk-high"
        : risk === "medium"
          ? "bg-risk-medium/20 text-risk-medium"
          : "bg-primary/20 text-primary";

    return (
      <>
        {before}
        <mark className={`rounded px-1 ${highlightClass}`}>{highlightedText}</mark>
        {after}
      </>
    );
  };

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow: isHighlighted
          ? "0 0 0 2px var(--primary), 0 0 20px var(--primary)"
          : "none",
      }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-xl border border-border bg-surface"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-surface-elevated px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-background text-xs font-medium text-text-secondary">
            {clause.index + 1}
          </span>
          <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            {clause.intent}
          </span>
          <RiskBadge risk={clause.risk} />
        </div>
        <button
          onClick={handleEditToggle}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-text-secondary transition-colors hover:bg-background hover:text-foreground"
        >
          {isEditing ? (
            <>
              <X className="h-3.5 w-3.5" />
              Cancel
            </>
          ) : (
            <>
              <Pencil className="h-3.5 w-3.5" />
              Edit Clause
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="min-h-32 w-full resize-none rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Edit the clause text..."
              />
              {error && (
                <p className="mt-2 text-sm text-risk-high">{error}</p>
              )}
              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Re-analyze"
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Clause text */}
              <p className="font-mono text-sm leading-relaxed text-foreground">
                {renderClauseText()}
              </p>

              {/* Info sections */}
              <div className="mt-4 space-y-3">
                {/* What this means */}
                <div className="rounded-lg bg-background p-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
                    <Info className="h-3.5 w-3.5" />
                    What this means
                  </div>
                  <p className="mt-1.5 text-sm text-foreground">
                    {clause.explanation}
                  </p>
                </div>

                {/* Why it's risky (for medium/high) */}
                {(clause.risk === "high" || clause.risk === "medium") && (
                  <div className="rounded-lg bg-background p-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Why it&apos;s {clause.risk === "high" ? "risky" : "notable"}
                    </div>
                    <p className="mt-1.5 text-sm text-foreground">
                      {clause.reasoning}
                    </p>
                  </div>
                )}

                {/* Suggestion */}
                {clause.suggestion && clause.suggestion !== "No changes needed." && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-primary">
                      <Lightbulb className="h-3.5 w-3.5" />
                      Suggestion
                    </div>
                    <p className="mt-1.5 text-sm text-foreground">
                      {clause.suggestion}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
