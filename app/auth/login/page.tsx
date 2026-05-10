"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, FileSearch, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn, resetPasswordForEmail } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Forgot Password states
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetMessage(null);
    setLoading(true);

    try {
      const result = await signIn(email, password);

      if (!result.success) {
        setError(result.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push("/analyze");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetMessage(null);
    
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    
    setLoading(true);

    try {
      const result = await resetPasswordForEmail(email);

      if (result.success) {
        setResetMessage({ type: "success", text: "Password reset link sent! Please check your inbox." });
      } else {
        setError(result.error || "Failed to send reset email");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-accent relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FileSearch className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold">ContractIQ</span>
          </Link>
          
          <h1 className="text-4xl font-bold mb-6">
            Welcome back
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            Sign in to access your contract analysis history, saved reports, and continue protecting your interests with AI-powered insights.
          </p>
          
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-sm font-semibold">1</span>
              </div>
              <span className="text-white/90">Access your analysis history</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-sm font-semibold">2</span>
              </div>
              <span className="text-white/90">Unlimited contract analyses</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-sm font-semibold">3</span>
              </div>
              <span className="text-white/90">Manage your preferences</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Login / Forgot Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <FileSearch className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">ContractIQ</span>
            </Link>
          </div>
          
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {isForgotPassword ? "Reset Password" : "Sign in"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {isForgotPassword 
              ? "Enter your email address and we'll send you a link to reset your password." 
              : "Enter your credentials to access your account"}
          </p>
          
          <form onSubmit={isForgotPassword ? handleResetPassword : handleLogin} className="space-y-5">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                >
                  {error}
                </motion.div>
              )}
              {resetMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 rounded-lg text-sm border ${resetMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
                >
                  {resetMessage.text}
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>
            
            {!isForgotPassword && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError(null);
                      setResetMessage(null);
                    }}
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12"
                    required={!isForgotPassword}
                  />
                </div>
              </motion.div>
            )}
            
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isForgotPassword ? (
                "Send Reset Link"
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            
            {isForgotPassword && (
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full h-12 text-base"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError(null);
                  setResetMessage(null);
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign in
              </Button>
            )}
          </form>
          
          {!isForgotPassword && (
            <>
              <div className="mt-8 text-center">
                <p className="text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/sign-up" className="text-primary font-semibold hover:underline">
                    Sign up for free
                  </Link>
                </p>
              </div>
              
              <div className="mt-6 text-center">
                <Link href="/analyze" className="text-sm text-muted-foreground hover:text-foreground">
                  Continue as guest (3 free analyses)
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}