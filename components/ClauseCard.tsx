"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, ChevronUp, Edit3, MessageSquare, 
  AlertTriangle, CheckCircle2, FileText, ArrowRight, 
  Loader2, Languages, Target 
} from "lucide-react";
import type { Clause, SimulateResponse } from "@/types";
import { RiskBadge } from "./RiskBadge";
import { Button } from "@/components/ui/button";

interface ClauseCardProps {
  clause: Clause;
  onSimulate?: (clauseId: string, newText: string) => Promise<SimulateResponse>;
  onClauseUpdate?: (clause: Clause) => void;
  isHighlighted?: boolean;
}

export function ClauseCard({ 
  clause, 
  onSimulate, 
  onClauseUpdate,
  isHighlighted 
}: ClauseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(clause.text);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulateResponse | null>(null);

  // New Multi-Language Translation States
  const [language, setLanguage] = useState("English");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translation, setTranslation] = useState<{ explanation?: string; reasoning?: string; suggestion?: string } | null>(null);

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
      risk: simulationResult.newRisk,
      intent: clause.intent,
      explanation: simulationResult.explanation,
      reasoning: simulationResult.reasoning,
      suggestion: "Clause has been safely negotiated.",
      confidenceScore: clause.confidenceScore 
    });
    
    setIsEditing(false);
    setSimulationResult(null);
    setTranslation(null); 
    setLanguage("English");
  };

  // Secure Backend Translation Handler
  const handleTranslate = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    setLanguage(lang);
    
    if (lang === "English") {
      setTranslation(null);
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetLanguage: lang,
          textObj: {
            explanation: clause.explanation,
            reasoning: clause.reasoning,
            suggestion: clause.suggestion
          }
        })
      });
      const data = await res.json();
      if (data.translated) {
        setTranslation(data.translated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
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
          
          {/* Confidence Score Badge */}
          {clause.confidenceScore !== undefined && (
            <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              <Target className="h-3 w-3" />
              {clause.confidenceScore}% Confidence
            </div>
          )}

          {/* Language Switcher */}
          <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-2 py-1">
            {isTranslating ? (
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
            ) : (
              <Languages className="h-3 w-3 text-muted-foreground" />
            )}
            <select 
              value={language} 
              onChange={handleTranslate}
              disabled={isTranslating}
              className="bg-transparent text-xs text-muted-foreground focus:outline-none cursor-pointer"
            >
              <option value="English">English</option>
              <option value="Hindi">हिंदी</option>
              <option value="Bengali">বাংলা</option>
            </select>
          </div>

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
              
              {/* Original Text vs Edit Mode */}
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

              {/* Simulation Result */}
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
                        <RiskBadge risk={simulationResult.newRisk} />
                      </div>
                      <Button size="sm" onClick={handleApplyChanges} className="gap-2 bg-primary text-primary-foreground">
                        <CheckCircle2 className="w-4 h-4" />
                        Apply to Contract
                      </Button>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">Updated Explanation</span>
                        <p className="text-sm text-foreground">{simulationResult.explanation}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">Updated Reasoning</span>
                        <p className="text-sm text-foreground">{simulationResult.reasoning}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI Analysis Sections (Hidden during simulation) */}
              {!simulationResult && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <h4 className="text-sm font-medium text-emerald-600 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      What it means
                    </h4>
                    <p className="text-sm text-foreground leading-relaxed">
                      {/* Uses translated text if available, defaults to English */}
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

              {/* Suggestion Section */}
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