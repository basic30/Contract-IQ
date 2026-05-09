"use client";

import { Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  Search,
  BarChart3,
  FileText,
  Shield,
  Lightbulb,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Zap,
} from "lucide-react";

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    icon: Upload,
    title: "Upload Your Contract",
    description:
      "Upload a PDF file, paste contract text directly, or try our sample contract to see how it works.",
    details: [
      "Supports PDF files up to 10MB",
      "Paste text up to 50,000 characters",
      "Sample contract available for testing",
    ],
  },
  {
    icon: Search,
    title: "AI-Powered Analysis",
    description:
      "Our hybrid engine combines rule-based detection with AI to analyze every clause in your contract.",
    details: [
      "Identifies risk patterns automatically",
      "GPT-4o provides detailed explanations",
      "Falls back to rules engine if needed",
    ],
  },
  {
    icon: BarChart3,
    title: "Review Your Report",
    description:
      "Get a comprehensive risk score, clause-by-clause breakdown, and actionable recommendations.",
    details: [
      "0-100 safety score at a glance",
      "Risk distribution visualization",
      "Top issues highlighted first",
    ],
  },
  {
    icon: Lightbulb,
    title: "Simulate Improvements",
    description:
      "Edit any clause and watch your risk score update in real-time. See before/after comparisons.",
    details: [
      "Live score recalculation",
      "Side-by-side comparison view",
      "Export improved language",
    ],
  },
];

const useCases = [
  {
    icon: FileText,
    title: "Freelance Contracts",
    description: "Review client agreements before signing",
  },
  {
    icon: Shield,
    title: "Employment Agreements",
    description: "Understand non-compete and IP clauses",
  },
  {
    icon: HelpCircle,
    title: "Vendor Contracts",
    description: "Evaluate liability and indemnification terms",
  },
  {
    icon: Zap,
    title: "NDAs & Confidentiality",
    description: "Check scope and duration of obligations",
  },
];

const riskLevels = [
  {
    level: "Low Risk",
    color: "bg-emerald-500",
    textColor: "text-emerald-500",
    description: "Standard, balanced terms that protect both parties equally",
  },
  {
    level: "Medium Risk",
    color: "bg-amber-500",
    textColor: "text-amber-500",
    description: "Terms that warrant attention and may need clarification",
  },
  {
    level: "High Risk",
    color: "bg-red-500",
    textColor: "text-red-500",
    description: "One-sided terms that could significantly impact your rights",
  },
];

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 z-50 mx-auto my-auto max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl sm:inset-8"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-6 py-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    How ContractIQ Works
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Your guide to AI-powered contract analysis
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-surface-elevated hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 80px)" }}>
              {/* Steps */}
              <div className="mb-10">
                <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    1
                  </span>
                  Getting Started
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group rounded-xl border border-border bg-surface p-5 transition-all hover:border-primary/30 hover:shadow-lg"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                          <step.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-elevated text-xs font-bold text-text-secondary">
                          {index + 1}
                        </div>
                      </div>
                      <h4 className="mb-2 font-semibold text-foreground">
                        {step.title}
                      </h4>
                      <p className="mb-3 text-sm text-text-secondary">
                        {step.description}
                      </p>
                      <ul className="space-y-1.5">
                        {step.details.map((detail, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-xs text-text-muted"
                          >
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Risk Levels */}
              <div className="mb-10">
                <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    2
                  </span>
                  Understanding Risk Levels
                </h3>
                <div className="rounded-xl border border-border bg-surface p-5">
                  <div className="grid gap-4 sm:grid-cols-3">
                    {riskLevels.map((risk, index) => (
                      <motion.div
                        key={risk.level}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex flex-col items-center text-center"
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${risk.color}`} />
                          <span className={`font-semibold ${risk.textColor}`}>
                            {risk.level}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary">
                          {risk.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Use Cases */}
              <div className="mb-10">
                <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    3
                  </span>
                  What You Can Analyze
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {useCases.map((useCase, index) => (
                    <motion.div
                      key={useCase.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/30"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <useCase.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">
                          {useCase.title}
                        </h4>
                        <p className="text-sm text-text-secondary">
                          {useCase.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4"
              >
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div>
                  <p className="font-medium text-amber-500">Important Note</p>
                  <p className="mt-1 text-sm text-amber-500/80">
                    ContractIQ is an AI-powered tool for informational purposes
                    only. It does not constitute legal advice. Always consult a
                    qualified attorney before making legal decisions.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}
