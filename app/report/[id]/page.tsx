"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import type {
  AnalysisReport,
  Clause,
  RiskDistribution,
  RiskLevel,
  SimulateResponse,
} from "@/types";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScoreGauge } from "@/components/ScoreGauge";
import { RiskDistributionBar } from "@/components/RiskDistributionBar";
import { TopIssuesList } from "@/components/TopIssuesList";
import { ClauseCard } from "@/components/ClauseCard";

type FilterType = "all" | "high" | "medium" | "low";

interface ScoreDelta {
  value: number;
  timestamp: number;
}

export default function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [score, setScore] = useState(0);
  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution>({
    high: 0,
    medium: 0,
    low: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [highlightedClauseId, setHighlightedClauseId] = useState<string | null>(
    null
  );
  const [scoreDelta, setScoreDelta] = useState<ScoreDelta | null>(null);

  // Fetch report on mount
  useEffect(() => {
    async function fetchReport() {
      try {
        const response = await fetch(`/api/report?id=${id}`);
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 404) {
            // Redirect to analyze with notification
            router.push("/analyze");
            return;
          }
          throw new Error(data.error || "Failed to load report.");
        }

        setReport(data);
        setClauses(data.clauses);
        setScore(data.score);
        setRiskDistribution(data.riskDistribution);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load report."
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchReport();
  }, [id, router]);

  // Clear highlight after delay
  useEffect(() => {
    if (highlightedClauseId) {
      const timeout = setTimeout(() => {
        setHighlightedClauseId(null);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [highlightedClauseId]);

  // Clear score delta after delay
  useEffect(() => {
    if (scoreDelta) {
      const timeout = setTimeout(() => {
        setScoreDelta(null);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [scoreDelta]);

  const handleIssueClick = useCallback((clauseId: string) => {
    setHighlightedClauseId(clauseId);
    // Find the clause and switch filter if needed
    const clause = clauses.find((c) => c.id === clauseId);
    if (clause && activeFilter !== "all" && clause.risk !== activeFilter) {
      setActiveFilter("all");
    }
  }, [clauses, activeFilter]);

  const handleSimulate = useCallback(
    async (clauseId: string, newText: string): Promise<SimulateResponse> => {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clauseId,
          newText,
          allClauses: clauses,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Simulation failed.");
      }

      return data;
    },
    [clauses]
  );

  const handleClauseUpdate = useCallback(
    (updatedClause: Clause) => {
      // Calculate score delta
      const oldScore = score;

      // Update clauses
      setClauses((prev) =>
        prev.map((c) => (c.id === updatedClause.id ? updatedClause : c))
      );

      // Recalculate score locally for immediate feedback
      const updatedClauses = clauses.map((c) =>
        c.id === updatedClause.id ? updatedClause : c
      );

      let newScore = 100;
      for (const clause of updatedClauses) {
        if (clause.risk === "high") newScore -= 20;
        else if (clause.risk === "medium") newScore -= 8;
      }
      newScore = Math.max(0, Math.min(100, newScore));

      const delta = newScore - oldScore;
      if (delta !== 0) {
        setScoreDelta({ value: delta, timestamp: Date.now() });
      }

      setScore(newScore);

      // Update risk distribution
      const newDistribution = { high: 0, medium: 0, low: 0 };
      for (const clause of updatedClauses) {
        newDistribution[clause.risk]++;
      }
      setRiskDistribution(newDistribution);
    },
    [clauses, score]
  );

  // Filter clauses
  const filteredClauses =
    activeFilter === "all"
      ? clauses
      : clauses.filter((c) => c.risk === activeFilter);

  // Sort clauses: HIGH first, then MEDIUM, then LOW
  const sortedClauses = [...filteredClauses].sort((a, b) => {
    const order: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2 };
    return order[a.risk] - order[b.risk];
  });

  const filters: { id: FilterType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "high", label: "High" },
    { id: "medium", label: "Medium" },
    { id: "low", label: "Low" },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4 pt-16">
          <ReportSkeleton />
        </main>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex flex-1 flex-col items-center justify-center px-4 pt-16">
          <AlertTriangle className="mb-4 h-12 w-12 text-risk-high" />
          <h1 className="text-xl font-semibold text-foreground">
            {error || "Report not found"}
          </h1>
          <p className="mt-2 text-text-secondary">
            The report may have expired or been deleted.
          </p>
          <button
            onClick={() => router.push("/analyze")}
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >
            Analyze New Contract
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 px-4 pb-20 pt-20 sm:px-6 lg:px-8">
        {/* Disclaimer Banner */}
        <div className="mx-auto mb-6 max-w-7xl">
          <div className="rounded-lg border border-risk-medium/30 bg-risk-medium/10 px-4 py-3 text-center text-sm text-risk-medium">
            AI-generated analysis for informational purposes only. Not legal
            advice. Consult a qualified attorney before making legal decisions.
          </div>
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* LEFT SIDEBAR - Score Dashboard */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full shrink-0 lg:sticky lg:top-24 lg:h-fit lg:w-80"
            >
              <div className="rounded-xl border border-border bg-surface p-6">
                {/* Score Gauge */}
                <div className="relative flex justify-center">
                  <ScoreGauge score={score} size={180} />

                  {/* Score Delta Indicator */}
                  <AnimatePresence>
                    {scoreDelta && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`absolute -right-2 top-4 rounded-full px-3 py-1 text-sm font-bold ${
                          scoreDelta.value > 0
                            ? "bg-risk-low/20 text-risk-low"
                            : "bg-risk-high/20 text-risk-high"
                        }`}
                      >
                        {scoreDelta.value > 0 ? "+" : ""}
                        {scoreDelta.value}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Meta info */}
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    <span>{report.totalClauses} clauses</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(report.analyzedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Risk Distribution */}
                <div className="mt-6">
                  <h3 className="mb-3 text-sm font-medium text-text-secondary">
                    Risk Distribution
                  </h3>
                  <RiskDistributionBar
                    distribution={riskDistribution}
                    totalClauses={clauses.length}
                  />
                </div>

                {/* Top Issues */}
                <div className="mt-6">
                  <h3 className="mb-3 text-sm font-medium text-text-secondary">
                    Top Issues
                  </h3>
                  <TopIssuesList
                    topIssues={report.topIssues}
                    onIssueClick={handleIssueClick}
                  />
                </div>
              </div>
            </motion.aside>

            {/* RIGHT MAIN PANEL - Clause Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1"
            >
              {/* Header */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  Clause Analysis
                  <span className="ml-2 rounded-md bg-surface-elevated px-2 py-1 text-sm font-normal text-text-secondary">
                    {sortedClauses.length} clauses
                  </span>
                </h2>

                {/* Filter Bar */}
                <div className="flex gap-1 rounded-lg bg-surface p-1">
                  {filters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`relative rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                        activeFilter === filter.id
                          ? "text-foreground"
                          : "text-text-secondary hover:text-foreground"
                      }`}
                    >
                      {activeFilter === filter.id && (
                        <motion.div
                          layoutId="activeFilter"
                          className="absolute inset-0 rounded-md bg-surface-elevated"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.5,
                          }}
                        />
                      )}
                      <span className="relative">{filter.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clause Cards */}
              <motion.div
                className="space-y-4"
                initial="initial"
                animate="animate"
                variants={{
                  animate: {
                    transition: {
                      staggerChildren: 0.05,
                    },
                  },
                }}
              >
                <AnimatePresence mode="popLayout">
                  {sortedClauses.map((clause) => (
                    <ClauseCard
                      key={clause.id}
                      clause={clause}
                      onSimulate={handleSimulate}
                      onClauseUpdate={handleClauseUpdate}
                      isHighlighted={highlightedClauseId === clause.id}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              {sortedClauses.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface py-16 text-center">
                  <p className="text-text-secondary">
                    No clauses match the selected filter.
                  </p>
                  <button
                    onClick={() => setActiveFilter("all")}
                    className="mt-4 text-sm text-primary hover:underline"
                  >
                    Show all clauses
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar skeleton */}
        <div className="w-full shrink-0 lg:w-80">
          <div className="animate-pulse rounded-xl border border-border bg-surface p-6">
            <div className="mx-auto h-44 w-44 rounded-full bg-surface-elevated" />
            <div className="mt-6 flex justify-center gap-4">
              <div className="h-4 w-20 rounded bg-surface-elevated" />
              <div className="h-4 w-24 rounded bg-surface-elevated" />
            </div>
            <div className="mt-6 h-3 w-full rounded-full bg-surface-elevated" />
            <div className="mt-6 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-surface-elevated" />
              ))}
            </div>
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <div className="h-6 w-40 animate-pulse rounded bg-surface-elevated" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-9 w-16 animate-pulse rounded-lg bg-surface-elevated"
                />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-border bg-surface p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-surface-elevated" />
                  <div className="h-6 w-24 rounded-md bg-surface-elevated" />
                  <div className="h-6 w-16 rounded-full bg-surface-elevated" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-4 w-full rounded bg-surface-elevated" />
                  <div className="h-4 w-3/4 rounded bg-surface-elevated" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg text-text-secondary">Loading your report...</p>
        </div>
      </div>
    </div>
  );
}
