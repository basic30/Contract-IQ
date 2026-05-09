import type { RiskLevel } from "@/types";
import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  risk: RiskLevel;
  className?: string;
}

const riskConfig = {
  high: {
    label: "HIGH",
    bgClass: "bg-risk-high/10",
    textClass: "text-risk-high",
    dotClass: "bg-risk-high",
  },
  medium: {
    label: "MEDIUM",
    bgClass: "bg-risk-medium/10",
    textClass: "text-risk-medium",
    dotClass: "bg-risk-medium",
  },
  low: {
    label: "LOW",
    bgClass: "bg-risk-low/10",
    textClass: "text-risk-low",
    dotClass: "bg-risk-low",
  },
};

export function RiskBadge({ risk, className }: RiskBadgeProps) {
  const config = riskConfig[risk];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.bgClass,
        config.textClass,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotClass)} />
      {config.label}
    </span>
  );
}
