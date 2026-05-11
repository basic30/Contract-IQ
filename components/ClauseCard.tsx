"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, ChevronUp, Edit3, MessageSquare, 
  AlertTriangle, CheckCircle2, FileText, ArrowRight, 
  Loader2, Target 
} from "lucide-react";
import type { Clause, SimulateResponse } from "@/types";
import { RiskBadge } from "./RiskBadge";
import { Button } from "@/components/ui/button";

interface ClauseCardProps {
  clause: Clause;
  onSimulate?: (clauseId: string, newText: string) => Promise<SimulateResponse>;
  onClauseUpdate?: (clause: Clause) => void;
  isHighlighted?: boolean;
  // NEW: Accept global translations from the parent
  translation?: { explanation?: string; reasoning?: string; suggestion?: string };
}

export function ClauseCard({ 
  clause, 
  onSimulate, 
  onClauseUpdate,
  isHighlighted,
  translation
}: ClauseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(clause.text);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulateResponse | null>(null);

  const handleSimulate = async () => {
    if (!onSimulate) return;
    
    setIsSimulating(true);
    try {
      const result = await onSimulate(clause.id, editedText);
      setSimulationResult(result);
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleApplyChanges = () => {
    if (!simulationResult || !onClauseUpdate) return;
    
    onClauseUpdate({
      ...clause,
      text: editedText,
      risk: simulationResult.updatedClause.risk,
      intent: simulationResult.updatedClause.intent,
      explanation: simulationResult.updatedClause.explanation,
      reasoning: simulationResult.updatedClause.reasoning,
      suggestion: simulationResult.updatedClause.suggestion,
      confidenceScore: simulationResult.updatedClause.confidenceScore || clause.confidenceScore 
    });
    
    setIsEditing(false);
    setSimulationResult(null);
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === highlight.toLowerCase() 
        ? <mark key={i} className={`bg-${clause.risk === 'high' ? 'red' : clause.risk === 'medium' ? 'amber' : 'emerald'}-500/20 text-foreground rounded-sm px-1`}>{part}</mark>
        : part
    );
  };

  return (
    <motion.div
      layout
      className={`rounded-xl border bg-card overflow-hidden transition-colors ${
        isHighlighted 
          ? `border-${clause.risk === 'high' ? 'red' : clause.risk === 'medium' ? 'amber' : 'emerald'}-500 shadow-lg shadow-${clause.risk === 'high' ? 'red' : clause.risk === 'medium' ? 'amber' : 'emerald'}-500/10` 
          : "border-border hover:border-primary/30"
      }`}
    >
      <div 
        className="p-4 cursor-pointer flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        onClick={() => !isEditing && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <RiskBadge risk={clause.risk} />
          <h3 className="font-semibold text-foreground">{clause.intent}</h3>
        </div>
        
        <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
          {clause.confidenceScore !== undefined && (
            <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              <Target className="h-3 w-3" />
              {clause.confidenceScore}% Confidence
            </div>
          )}

          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-full hover:bg-muted text-muted-foreground"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border"
          >
            <div className="p-4 space-y-6">
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Clause Text
                  </h4>
                  {onSimulate && !isEditing && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-8 gap-1.5">
                      <Edit3 className="w-3.5 h-3.5" />
                      Negotiate
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="w-full min-h-[100px] p-3 text-sm rounded-lg border border-primary/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => {
                        setIsEditing(false);
                        setEditedText(clause.text);
                        setSimulationResult(null);
                      }}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSimulate} disabled={isSimulating || editedText === clause.text}>
                        {isSimulating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                        Simulate Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-muted/30 rounded-lg text-sm text-foreground leading-relaxed border border-border">
                    {highlightText(clause.text, clause.highlightedText)}
                  </div>
                )}
              </div>

              <AnimatePresence>
                {simulationResult && isEditing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-surface border border-primary/20 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">New Risk Assessment:</span>
                        <RiskBadge risk={simulationResult.updatedClause.risk} />
                      </div>
                      <Button size="sm" onClick={handleApplyChanges} className="gap-2 bg-primary text-primary-foreground">
                        <CheckCircle2 className="w-4 h-4" />
                        Apply to Contract
                      </Button>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">Updated Explanation</span>
                        <p className="text-sm text-foreground">{simulationResult.updatedClause.explanation}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">Updated Reasoning</span>
                        <p className="text-sm text-foreground">{simulationResult.updatedClause.reasoning}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!simulationResult && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <h4 className="text-sm font-medium text-emerald-600 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      What it means
                    </h4>
                    <p className="text-sm text-foreground leading-relaxed">
                      {translation?.explanation || clause.explanation}
                    </p>
                  </div>
                  
                  <div className="space-y-2 p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <h4 className="text-sm font-medium text-amber-600 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Why it matters
                    </h4>
                    <p className="text-sm text-foreground leading-relaxed">
                      {translation?.reasoning || clause.reasoning}
                    </p>
                  </div>
                </div>
              )}

              {!simulationResult && clause.suggestion && clause.suggestion !== "Review with legal counsel." && clause.suggestion !== "No changes needed" && (
                <div className="space-y-2 p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <h4 className="text-sm font-medium text-primary flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    Recommended Change
                  </h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    {translation?.suggestion || clause.suggestion}
                  </p>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}