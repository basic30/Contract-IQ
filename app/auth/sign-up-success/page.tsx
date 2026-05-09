"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowRight, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <Link href="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <FileSearch className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground">ContractIQ</span>
        </Link>
        
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
          <Mail className="w-10 h-10 text-accent" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Check your email
        </h1>
        
        <p className="text-muted-foreground mb-8">
          We&apos;ve sent a confirmation link to your email address. Click the link to activate your account and start analyzing contracts.
        </p>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/login">
              Go to Login
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <Link href="/auth/sign-up" className="text-primary hover:underline">
              try again
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
