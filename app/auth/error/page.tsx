"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 text-center shadow-sm">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-3">
          Authentication Error
        </h1>
        <p className="text-muted-foreground mb-8">
          There was a problem signing you in or verifying your email. The link may have expired or is invalid.
        </p>
        
        <Button asChild className="w-full h-12">
          <Link href="/auth/login">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </Button>
      </div>
    </div>
  );
}