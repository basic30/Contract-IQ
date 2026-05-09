"use client";

import { motion } from "framer-motion";
import type { RiskDistribution } from "@/types";

interface RiskDistributionBarProps {
  distribution: RiskDistribution;
  totalClauses: number;
  className?: string;
}

export function RiskDistributionBar({
  distribution,
  totalClauses,
  className,
}: RiskDistributionBarProps) {
  const { high, medium, low } = distribution;

  // Calculate percentages
  const highPercent = totalClauses > 0 ? (high / totalClauses) * 100 : 0;
  const mediumPercent = totalClauses > 0 ? (medium / totalClauses) * 100 : 0;
  const lowPercent = totalClauses > 0 ? (low / totalClauses) * 100 : 0;

  return (
    <div className={className}>
      {/* Bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-elevated">
        {highPercent > 0 && (
          <motion.div
            className="h-full bg-risk-high"
            initial={{ width: 0 }}
            animate={{ width: `${highPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            title={`High Risk: ${high} clauses (${highPercent.toFixed(0)}%)`}
          />
        )}
        {mediumPercent > 0 && (
          <motion.div
            className="h-full bg-risk-medium"
            initial={{ width: 0 }}
            animate={{ width: `${mediumPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            title={`Medium Risk: ${medium} clauses (${mediumPercent.toFixed(0)}%)`}
          />
        )}
        {lowPercent > 0 && (
          <motion.div
            className="h-full bg-risk-low"
            initial={{ width: 0 }}
            animate={{ width: `${lowPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            title={`Low Risk: ${low} clauses (${lowPercent.toFixed(0)}%)`}
          />
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-risk-high" />
          <span className="text-text-secondary">
            High <span className="font-medium text-foreground">{high}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-risk-medium" />
          <span className="text-text-secondary">
            Medium <span className="font-medium text-foreground">{medium}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-risk-low" />
          <span className="text-text-secondary">
            Low <span className="font-medium text-foreground">{low}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
