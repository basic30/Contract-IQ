"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, FileText, Trash2, Clock, TrendingUp, 
  AlertTriangle, ChevronRight, Settings, Loader2,
  Calendar, ToggleLeft, ToggleRight, Shield, X
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getCurrentUser, updateHistoryPreference } from "@/lib/auth";
import { getUserHistory, deleteRecord as deleteHistoryRecord, clearOldRecords, disableHistoryForUser } from "@/lib/localHistory";

interface AnalysisRecord {
  id: string;
  contract_name: string;
  overall_score: number;
  risk_summary: {
    high: number;
    medium: number;
    low: number;
  };
  created_at: string;
}

function getScoreColor(score: number) {
  if (score >= 70) return "text-emerald-500";
  if (score >= 40) return "text-amber-500";
  return "text-red-500";
}

function getScoreBg(score: number) {
  if (score >= 70) return "bg-emerald-500/10";
  if (score >= 40) return "bg-amber-500/10";
  return "bg-red-500/10";
}

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [historyEnabled, setHistoryEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const checkAuthAndLoadHistory = async () => {
      const user = await getCurrentUser();
      
      if (!user) {
        router.push("/auth/login?redirect=/history");
        return;
      }
      
      setUser({ id: user.id, email: user.email });
      setHistoryEnabled(user.historyEnabled);
      
      // Load history
      const historyData = await getUserHistory(user.id);
      setHistory(historyData.map(record => ({
        id: record.id,
        contract_name: record.contractName,
        overall_score: record.overallScore,
        risk_summary: record.riskSummary as any,
        created_at: record.createdAt,
      })));
      
      setIsLoading(false);
    };
    
    checkAuthAndLoadHistory();
  }, [router]);

  const toggleHistoryEnabled = async () => {
    if (!user) return;
    
    const newValue = !historyEnabled;
    setHistoryEnabled(newValue);
    
    await updateHistoryPreference(user.id, newValue);
    
    if (!newValue) {
      // If disabling history, clear all records
      await disableHistoryForUser(user.id);
      setHistory([]);
    }
  };

  const deleteRecordItem = async (id: string) => {
    if (!user) return;
    
    setIsDeleting(true);
    await deleteHistoryRecord(id);
    
    setHistory(prev => prev.filter(item => item.id !== id));
    setShowDeleteConfirm(null);
    setIsDeleting(false);
  };

  const clearOldHistory = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    
    // Delete records older than 3 months
    await clearOldRecords(user.id, 3);
    
    // Reload history
    const historyData = await getUserHistory(user.id);
    setHistory(historyData.map(record => ({
      id: record.id,
      contract_name: record.contractName,
      overall_score: record.overallScore,
      risk_summary: record.riskSummary as any,
      created_at: record.createdAt,
    })));
    
    setShowClearConfirm(false);
    setIsDeleting(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex flex-1 flex-col px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <History className="w-8 h-8 text-primary" />
                Analysis History
              </h1>
              <p className="mt-2 text-muted-foreground">
                View and manage your past contract analyses
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSettings(true)}
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              <Button asChild>
                <Link href="/analyze">
                  New Analysis
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          {history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="text-2xl font-bold text-foreground">{history.length}</div>
                <div className="text-sm text-muted-foreground">Total Analyses</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="text-2xl font-bold text-emerald-500">
                  {history.filter(h => h.overall_score >= 70).length}
                </div>
                <div className="text-sm text-muted-foreground">Safe Contracts</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="text-2xl font-bold text-amber-500">
                  {history.filter(h => h.overall_score >= 40 && h.overall_score < 70).length}
                </div>
                <div className="text-sm text-muted-foreground">Review Needed</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="text-2xl font-bold text-red-500">
                  {history.filter(h => h.overall_score < 40).length}
                </div>
                <div className="text-sm text-muted-foreground">High Risk</div>
              </div>
            </motion.div>
          )}

          {/* History List */}
          {history.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center py-16"
            >
              <div className="mx-auto w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No analyses yet
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Your contract analysis history will appear here. Start by analyzing your first contract.
              </p>
              <Button asChild size="lg">
                <Link href="/analyze">
                  Analyze Your First Contract
                </Link>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              {history.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="group relative rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-colors"
                >
                  <Link href={`/report/${record.id}`} className="absolute inset-0 z-10" />
                  
                  <div className="flex items-center gap-4">
                    {/* Score */}
                    <div className={`w-14 h-14 rounded-xl ${getScoreBg(record.overall_score)} flex items-center justify-center shrink-0`}>
                      <span className={`text-xl font-bold ${getScoreColor(record.overall_score)}`}>
                        {record.overall_score}
                      </span>
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {record.contract_name}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(record.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                          {record.risk_summary.high} high risk
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                          {record.risk_summary.medium} medium
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative z-20 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowDeleteConfirm(record.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      <Footer />

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">History Settings</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* History Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Save History</p>
                      <p className="text-sm text-muted-foreground">
                        Store your analysis results
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleHistoryEnabled}
                    className="text-primary"
                  >
                    {historyEnabled ? (
                      <ToggleRight className="w-10 h-10" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-muted-foreground" />
                    )}
                  </button>
                </div>
                
                {/* Clear Old History */}
                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Clear Old History</p>
                      <p className="text-sm text-muted-foreground">
                        Remove analyses older than 3 months
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setShowSettings(false);
                      setShowClearConfirm(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Old Records
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl text-center"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Delete Analysis?
              </h3>
              <p className="text-muted-foreground mb-6">
                This action cannot be undone. The analysis record will be permanently removed.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => deleteRecordItem(showDeleteConfirm)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Old History Confirmation */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl text-center"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Clear Old History?
              </h3>
              <p className="text-muted-foreground mb-6">
                This will permanently delete all analyses older than 3 months. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowClearConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={clearOldHistory}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Clear Old Records"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
