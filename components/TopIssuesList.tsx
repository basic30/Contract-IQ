"use client";

import { motion } from "framer-motion";
import type { TopIssue } from "@/types";
import { RiskBadge } from "./RiskBadge";

interface TopIssuesListProps {
  topIssues: TopIssue[];
  onIssueClick?: (clauseId: string) => void;
  className?: string;
}

export function TopIssuesList({
  topIssues,
  onIssueClick,
  className,
}: TopIssuesListProps) {
  if (topIssues.length === 0) {
    return (
      <div className={className}>
        <p className="text-sm text-text-secondary">
          No significant issues detected.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-2">
        {topIssues.map((issue, index) => (
          <motion.button
            key={issue.clauseId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onIssueClick?.(issue.clauseId)}
            className="group w-full rounded-lg border border-border bg-surface p-3 text-left transition-all hover:border-primary/50 hover:bg-surface-elevated"
          >
            <div className="flex items-start gap-3">
              <RiskBadge risk={issue.risk} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                  {issue.title}
                </h4>
                <p className="mt-1 line-clamp-2 text-xs text-text-secondary">
                  {issue.description}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
