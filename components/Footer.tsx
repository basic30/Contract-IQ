import Link from "next/link";
import { Scale } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo and tagline */}
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">
              ContractIQ
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-text-secondary transition-colors hover:text-foreground"
            >
              Home
            </Link>
            <Link
              href="/analyze"
              className="text-sm text-text-secondary transition-colors hover:text-foreground"
            >
              Analyze
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-text-muted">
            {new Date().getFullYear()} ContractIQ. For informational purposes only.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 border-t border-border pt-8">
          <p className="text-center text-xs text-text-muted">
            ContractIQ is an AI-powered tool for informational purposes only. It
            does not constitute legal advice. Consult a qualified attorney before
            making any legal decisions based on this analysis.
          </p>
        </div>
      </div>
    </footer>
  );
}
