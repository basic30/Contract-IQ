"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, FileText, FileCode, Loader2, AlertCircle, 
  Camera, FileType, X, LogIn, UserPlus, CheckCircle2, Circle
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CameraScanner } from "@/components/CameraScanner";
import { sampleContract } from "@/lib/sampleContract";
import { getCurrentUser } from "@/lib/auth";
import { createRecord } from "@/lib/localHistory";
import { Button } from "@/components/ui/button";

type InputTab = "upload" | "paste" | "sample";

const loadingMessages = [
  "Extracting and formatting text...",
  "Applying structural rules...",
  "Consulting Puter AI for risk analysis...",
  "Computing final liability score...",
  "Building comprehensive report...",
];

const GUEST_USAGE_LIMIT = 3;
const GUEST_FINGERPRINT_KEY = "contractiq_guest_fingerprint";

function generateFingerprint(): string {
  const nav = window.navigator;
  const screen = window.screen;
  const data = [
    nav.userAgent,
    nav.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
  ].join("|");
  
  // Simple hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function AnalyzePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<InputTab>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  
  // Auth and usage state
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [guestUsage, setGuestUsage] = useState<number>(0);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check auth status and guest usage on mount
  useEffect(() => {
    const checkAuthAndUsage = async () => {
      const user = await getCurrentUser();
      
      if (user) {
        setUser({ id: user.id, email: user.email });
      } else {
        // Check guest usage from localStorage
        let fingerprint = localStorage.getItem(GUEST_FINGERPRINT_KEY);
        if (!fingerprint) {
          fingerprint = generateFingerprint();
          localStorage.setItem(GUEST_FINGERPRINT_KEY, fingerprint);
        }
        
        // Get usage from localStorage
        const guestUsageData = localStorage.getItem(`guest_usage_${fingerprint}`);
        if (guestUsageData) {
          try {
            const usage = JSON.parse(guestUsageData);
            setGuestUsage(usage.count || 0);
          } catch (e) {
            setGuestUsage(0);
          }
        }
      }
      
      setIsCheckingAuth(false);
    };
    
    checkAuthAndUsage();
  }, []);

  // Check for demo flag on mount
  useEffect(() => {
    if (searchParams.get("demo") === "true") {
      setActiveTab("sample");
    }
  }, [searchParams]);

  // Cycle through loading messages
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        await processFile(selectedFile);
      }
    },
    []
  );

  const processFile = async (selectedFile: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];
    
    const fileName = selectedFile.name.toLowerCase();
    const isValidType = validTypes.includes(selectedFile.type) || 
      fileName.endsWith(".pdf") || 
      fileName.endsWith(".docx") || 
      fileName.endsWith(".doc") || 
      fileName.endsWith(".txt");
    
    if (!isValidType) {
      setError("Please upload a PDF, DOCX, DOC, or TXT file.");
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB.");
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    
    // If it's a text file, read directly
    if (fileName.endsWith(".txt")) {
      const text = await selectedFile.text();
      setPastedText(text);
      return;
    }
    
    // For PDF and DOCX, extract text
    setIsParsingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      const response = await fetch("/api/parse-file", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to parse file");
      }
      
      setPastedText(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file. Please try pasting the text directly.");
      setFile(null);
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      await processFile(droppedFile);
    }
  }, []);

  const handleCameraTextExtracted = useCallback((text: string) => {
    setPastedText(text);
    setActiveTab("paste");
    setShowCameraScanner(false);
  }, []);

  const incrementGuestUsage = () => {
    const fingerprint = localStorage.getItem(GUEST_FINGERPRINT_KEY) || generateFingerprint();
    const guestUsageData = localStorage.getItem(`guest_usage_${fingerprint}`);
    
    let count = 1;
    if (guestUsageData) {
      try {
        const data = JSON.parse(guestUsageData);
        count = (data.count || 0) + 1;
      } catch (e) {
        count = 1;
      }
    }
    
    localStorage.setItem(`guest_usage_${fingerprint}`, JSON.stringify({ 
      count, 
      lastUsed: new Date().toISOString() 
    }));
    
    setGuestUsage(count);
  };

  const handleSubmit = async () => {
    // Check if guest has reached limit
    if (!user && guestUsage >= GUEST_USAGE_LIMIT) {
      setShowAuthPrompt(true);
      return;
    }
    
    setError(null);
    setIsLoading(true);
    setLoadingMessageIndex(0);

    try {
      const formData = new FormData();

      if (activeTab === "upload" && file) {
        // Text was already extracted, use pastedText
        if (pastedText.trim()) {
          formData.append("text", pastedText);
          formData.append("fileName", file.name);
        } else {
          formData.append("file", file);
        }
      } else if (activeTab === "paste" && pastedText.trim()) {
        if (pastedText.trim().length < 50) {
          throw new Error("Contract is too short. Please provide at least 50 characters.");
        }
        if (pastedText.length > 50000) {
          throw new Error("Contract is too large. Please use a document under 50,000 characters.");
        }
        formData.append("text", pastedText);
      } else if (activeTab === "sample") {
        formData.append("useSample", "true");
      } else {
        throw new Error("Please provide a contract to analyze.");
      }

      // Add user ID if authenticated
      if (user) {
        formData.append("userId", user.id);
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed. Please try again.");
      }

      // Increment guest usage if not authenticated
      if (!user) {
        incrementGuestUsage();
      }

      // Navigate to report page
      router.push(`/report/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  const canSubmit =
    (activeTab === "upload" && file && (pastedText.trim().length > 0 || !isParsingFile)) ||
    (activeTab === "paste" && pastedText.trim().length >= 50) ||
    activeTab === "sample";

  const remainingUsage = GUEST_USAGE_LIMIT - guestUsage;

  if (isCheckingAuth) {
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
        <div className="mx-auto w-full max-w-3xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <h1 className="text-3xl font-bold text-foreground">
              Analyze Your Contract
            </h1>
            <p className="mt-2 text-muted-foreground">
              Upload a PDF/DOCX, paste text, scan with camera, or try our sample
            </p>
            
            {/* Usage indicator for guests */}
            {!user && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm">
                <span className="text-muted-foreground">
                  {remainingUsage > 0 ? (
                    <>
                      <span className="font-semibold text-primary">{remainingUsage}</span> free {remainingUsage === 1 ? "analysis" : "analyses"} remaining
                    </>
                  ) : (
                    <span className="text-destructive">Free limit reached</span>
                  )}
                </span>
                <Link href="/auth/sign-up" className="text-primary font-medium hover:underline">
                  Sign up for unlimited
                </Link>
              </div>
            )}
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 flex gap-2 rounded-xl bg-muted/50 p-1.5"
          >
            {[
              { id: "upload", label: "Upload File", icon: Upload },
              { id: "paste", label: "Paste Text", icon: FileText },
              { id: "sample", label: "Load Sample", icon: FileCode },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as InputTab)}
                disabled={isLoading}
                className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                  activeTab === id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeTab === id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg bg-background shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <Icon className="relative h-4 w-4" />
                <span className="relative">{label}</span>
              </button>
            ))}
          </motion.div>

          {/* Input Area / Loading Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6 min-h-[350px] flex flex-col justify-center"
          >
            {isLoading ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <div className="relative mb-8 flex h-20 w-20 items-center justify-center">
                  <Loader2 className="absolute inset-0 h-full w-full animate-spin text-primary/20" />
                  <div className="absolute inset-2 animate-spin rounded-full border-t-2 border-primary" style={{ animationDuration: '2s' }} />
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                
                <div className="w-full max-w-sm space-y-4">
                  {loadingMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center gap-4 transition-all duration-500 ${
                        idx === loadingMessageIndex 
                          ? 'opacity-100 translate-x-2' 
                          : idx < loadingMessageIndex 
                            ? 'opacity-50' 
                            : 'opacity-20'
                      }`}
                    >
                      {idx < loadingMessageIndex ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      ) : idx === loadingMessageIndex ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                      <span className={`text-sm ${idx === loadingMessageIndex ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                        {msg}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                {activeTab === "upload" && (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      className="flex min-h-48 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background p-8 transition-colors hover:border-primary/50"
                    >
                      {isParsingFile ? (
                        <div className="text-center">
                          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
                          <p className="font-medium text-foreground">Extracting text from document...</p>
                          <p className="mt-1 text-sm text-muted-foreground">This may take a moment</p>
                        </div>
                      ) : file ? (
                        <div className="text-center">
                          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                            <FileType className="h-6 w-6 text-primary" />
                          </div>
                          <p className="font-medium text-foreground">{file.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                            {pastedText && ` • ${pastedText.length.toLocaleString()} characters extracted`}
                          </p>
                          <button
                            onClick={() => {
                              setFile(null);
                              setPastedText("");
                            }}
                            className="mt-3 inline-flex items-center gap-1 text-sm text-destructive hover:underline"
                          >
                            <X className="h-3 w-3" />
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
                          <p className="text-center text-foreground">
                            Drag and drop your file here, or{" "}
                            <label className="cursor-pointer text-primary hover:underline">
                              browse
                              <input
                                type="file"
                                accept=".pdf,.docx,.doc,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                            </label>
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            PDF, DOCX, DOC, or TXT files up to 10MB
                          </p>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "paste" && (
                  <motion.div
                    key="paste"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Paste contract text or scan a document
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCameraScanner(true)}
                        className="gap-2"
                      >
                        <Camera className="h-4 w-4" />
                        Scan with Camera
                      </Button>
                    </div>
                    
                    <textarea
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Paste your contract text here..."
                      maxLength={50000}
                      className="min-h-72 w-full resize-none rounded-xl border border-border bg-background p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {pastedText.length < 50 && pastedText.length > 0 && (
                          <span className="text-amber-500">
                            Need at least 50 characters ({50 - pastedText.length} more)
                          </span>
                        )}
                      </span>
                      <span>{pastedText.length.toLocaleString()} / 50,000 characters</span>
                    </div>
                  </motion.div>
                )}

                {activeTab === "sample" && (
                  <motion.div
                    key="sample"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="rounded-xl border border-border bg-background p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <FileCode className="h-5 w-5 text-primary" />
                        <span className="font-medium text-foreground">
                          Sample Freelance Service Agreement
                        </span>
                      </div>
                      <p className="line-clamp-6 font-mono text-sm text-muted-foreground">
                        {sampleContract.slice(0, 500)}...
                      </p>
                      <p className="mt-3 text-sm text-muted-foreground">
                        This sample contract contains various risk scenarios for
                        demonstration purposes.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isLoading || isParsingFile}
              className="w-full h-14 text-base font-semibold"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span className="min-w-36">
                    {loadingMessages[loadingMessageIndex]}
                  </span>
                </>
              ) : (
                <>
                  Analyze Contract
                  <span className="ml-2">→</span>
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
      
      {/* Camera Scanner Modal */}
      <CameraScanner
        isOpen={showCameraScanner}
        onClose={() => setShowCameraScanner(false)}
        onTextExtracted={handleCameraTextExtracted}
      />
      
      {/* Auth Prompt Modal */}
      <AnimatePresence>
        {showAuthPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowAuthPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
            >
              <div className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserPlus className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Free Limit Reached
                </h3>
                <p className="text-muted-foreground mb-6">
                  You&apos;ve used all {GUEST_USAGE_LIMIT} free analyses. Create a free account to get unlimited access to ContractIQ.
                </p>
                
                <div className="space-y-3">
                  <Button asChild className="w-full" size="lg">
                    <Link href="/auth/sign-up">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Free Account
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full" size="lg">
                    <Link href="/auth/login">
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                </div>
                
                <button
                  onClick={() => setShowAuthPrompt(false)}
                  className="mt-4 text-sm text-muted-foreground hover:text-foreground"
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AnalyzePageContent />
    </Suspense>
  );
}
