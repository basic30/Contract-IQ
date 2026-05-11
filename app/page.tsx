"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";
import {
  FileSearch,
  Shield,
  Pencil,
  Zap,
  Target,
  Brain,
  Lock,
  Upload,
  Search,
  BarChart3,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Play,
  Star,
  Quote,
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HowItWorksModal } from "@/components/HowItWorksModal";

// --- Background Animation Component ---
function CelestialBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let animationFrameId: number;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    window.addEventListener("mousemove", handleMouseMove);

    class Particle {
      x: number;
      y: number;
      radius: number;
      color: string;
      isOrbiter: boolean;
      orbitRadius: number;
      angle: number;
      speed: number;

      constructor(x: number, y: number, radius: number, color: string, isOrbiter = false) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.isOrbiter = isOrbiter;
        this.orbitRadius = Math.random() * 150 + 100;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.02 + 0.01;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      update(center: { x: number; y: number }) {
        if (this.isOrbiter) {
          this.angle += this.speed;
          this.x = center.x + Math.cos(this.angle) * this.orbitRadius;
          this.y = center.y + Math.sin(this.angle) * this.orbitRadius;
        }
        this.draw();
      }
    }

    const centerPoint = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      targetX: canvas.width / 2,
      targetY: canvas.height / 2,
    };

    const init = () => {
      particles = [];
      particles.push(
        new Particle(centerPoint.x, centerPoint.y, 20, "rgba(255, 255, 255, 0.9)")
      );
      for (let i = 0; i < 50; i++) {
        particles.push(
          new Particle(
            0,
            0,
            Math.random() * 3 + 1,
            `hsl(${Math.random() * 60 + 200}, 70%, 60%)`,
            true
          )
        );
      }
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!ctx || !canvas) return;

      // Dark trails to create the fluid motion effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      centerPoint.targetX = mouse.x;
      centerPoint.targetY = mouse.y;
      centerPoint.x += (centerPoint.targetX - centerPoint.x) * 0.05;
      centerPoint.y += (centerPoint.targetY - centerPoint.y) * 0.05;

      particles[0].x = centerPoint.x;
      particles[0].y = centerPoint.y;
      particles[0].draw();

      for (let i = 1; i < particles.length; i++) {
        particles[i].update(centerPoint);
      }
    };

    init();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-90"
    />
  );
}
// --- End Background Animation ---

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const fadeInScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const floatingAnimation = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

export default function LandingPage() {
  const router = useRouter();
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  const featuresRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);

  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const howItWorksInView = useInView(howItWorksRef, { once: true, margin: "-100px" });

  const handleDemo = () => {
    router.push("/analyze?demo=true");
  };

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar onHowItWorksClick={() => setIsHowItWorksOpen(true)} />

      <main className="flex-1">
        {/* Hero Section (Updated with Celestial Background and Dark Mode styling) */}
        <section className="relative overflow-hidden bg-black px-4 pb-24 pt-32 sm:px-6 lg:px-8">
          
          <CelestialBackground />

          <motion.div
            className="relative z-10 mx-auto max-w-5xl text-center"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="mb-6 inline-flex">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md">
                <Sparkles className="h-4 w-4" />
                AI-Powered Contract Intelligence
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Understand{" "}
              <span className="relative">
                <span className="relative z-10 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                  Every Clause
                </span>
                <motion.span
                  className="absolute -inset-1 -z-10 block rounded-lg bg-primary/20 backdrop-blur-sm"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                />
              </span>
              <br className="hidden sm:block" />
              <span className="mt-2 block">Before You Sign</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mx-auto mt-8 max-w-2xl text-pretty text-lg text-slate-300 sm:text-xl"
            >
              ContractIQ transforms dense legal contracts into clear,
              clause-by-clause explanations with AI-powered risk analysis. Know
              exactly what you&apos;re agreeing to.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/analyze"
                className="group relative inline-flex h-14 items-center gap-2 overflow-hidden rounded-2xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:shadow-2xl hover:shadow-primary/30"
              >
                <span className="relative z-10">Analyze Your Contract</span>
                <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary-hover to-primary"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
              <button
                onClick={handleDemo}
                className="group inline-flex h-14 items-center gap-2 rounded-2xl border-2 border-slate-700 bg-slate-900/50 px-8 text-base font-semibold text-white backdrop-blur-md transition-all hover:border-primary/50 hover:bg-slate-800"
              >
                <Play className="h-4 w-4 text-primary" />
                See a Demo
              </button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={fadeInUp}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                No sign-up required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Free to use
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Data never stored
              </div>
            </motion.div>
          </motion.div>

          {/* Floating preview card */}
          <motion.div
            className="relative z-10 mx-auto mt-16 max-w-3xl"
            variants={fadeInScale}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.4 }}
          >
            <motion.div
              className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-md"
              {...floatingAnimation}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-risk-high" />
                <div className="h-3 w-3 rounded-full bg-risk-medium" />
                <div className="h-3 w-3 rounded-full bg-risk-low" />
                <span className="ml-2 text-sm text-slate-400">Sample Analysis Preview</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-slate-900/50 p-4 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-risk-high/20">
                      <Shield className="h-5 w-5 text-risk-high" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">Unlimited Liability</p>
                      <p className="text-sm text-slate-400">Section 8.2</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-risk-high/20 px-3 py-1 text-xs font-medium text-risk-high">
                    High Risk
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-900/50 p-4 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-risk-low/20">
                      <FileSearch className="h-5 w-5 text-risk-low" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">Standard Payment Terms</p>
                      <p className="text-sm text-slate-400">Section 3.1</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-risk-low/20 px-3 py-1 text-xs font-medium text-risk-low">
                    Low Risk
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Feature Cards */}
        <section ref={featuresRef} className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.div
              className="mb-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                Features
              </span>
              <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
                Three Powerful Tools in One
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
                Everything you need to understand, evaluate, and improve your contracts
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Understand Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="group relative overflow-hidden rounded-3xl border border-border bg-surface p-8 transition-all duration-500 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative">
                  <motion.div
                    className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <FileSearch className="h-7 w-7 text-primary" />
                  </motion.div>
                  <h3 className="mb-3 text-2xl font-bold text-foreground">
                    Understand
                  </h3>
                  <p className="text-text-secondary">
                    Get clause-by-clause plain-English explanations. No legal
                    jargon, just clear answers about what each section means for
                    you.
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
                    Learn more
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.div>

              {/* Evaluate Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="group relative overflow-hidden rounded-3xl border border-border bg-surface p-8 transition-all duration-500 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative">
                  <motion.div
                    className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Shield className="h-7 w-7 text-primary" />
                  </motion.div>
                  <h3 className="mb-3 text-2xl font-bold text-foreground">
                    Evaluate
                  </h3>
                  <p className="text-text-secondary">
                    See risk levels for every clause - HIGH, MEDIUM, or LOW.
                    Understand exactly why each classification was made with
                    transparent reasoning.
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
                    Learn more
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.div>

              {/* Simulate Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="group relative overflow-hidden rounded-3xl border border-border bg-surface p-8 transition-all duration-500 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative">
                  <motion.div
                    className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Pencil className="h-7 w-7 text-primary" />
                  </motion.div>
                  <h3 className="mb-3 text-2xl font-bold text-foreground">
                    Simulate
                  </h3>
                  <p className="text-text-secondary">
                    Edit any clause and watch the risk score update in real
                    time. See before/after comparisons to negotiate smarter.
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
                    Learn more
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-y border-border bg-gradient-to-r from-surface via-surface-elevated to-surface px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.div
              className="grid grid-cols-2 gap-8 md:grid-cols-4"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                { icon: Zap, value: "< 5 sec", label: "Analysis time" },
                { icon: Target, value: "Clause-level", label: "Precision" },
                { icon: Brain, value: "AI + Rules", label: "Hybrid engine" },
                { icon: Lock, value: "No data", label: "Retained" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={fadeInUp}
                  className="group text-center"
                >
                  <div className="mb-3 flex items-center justify-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <span className="block text-2xl font-bold text-foreground">
                    {stat.value}
                  </span>
                  <p className="mt-1 text-sm text-text-secondary">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section ref={howItWorksRef} className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <motion.div
              className="mb-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                Simple Process
              </span>
              <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
                How It Works
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
                Three simple steps to understand any contract
              </p>
            </motion.div>

            <div className="relative">
              {/* Connection line */}
              <div className="absolute left-8 top-0 hidden h-full w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20 md:left-1/2 md:block md:-translate-x-1/2" />

              <div className="space-y-12 md:space-y-0">
                {/* Step 1 */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={howItWorksInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="relative flex flex-col gap-6 md:flex-row md:items-center"
                >
                  <div className="flex items-start gap-6 md:w-1/2 md:justify-end md:pr-16 md:text-right">
                    <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg md:max-w-md">
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-foreground">
                        Upload or paste your contract
                      </h3>
                      <p className="text-text-secondary">
                        Upload a PDF or paste the contract text directly. We support
                        any contract format up to 50,000 characters.
                      </p>
                    </div>
                  </div>
                  <div className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-4 border-background bg-primary text-sm font-bold text-primary-foreground md:left-1/2 md:-translate-x-1/2">
                    1
                  </div>
                  <div className="md:w-1/2" />
                </motion.div>

                {/* Step 2 */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={howItWorksInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="relative flex flex-col gap-6 md:flex-row md:items-center md:pt-16"
                >
                  <div className="md:w-1/2" />
                  <div className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-4 border-background bg-primary text-sm font-bold text-primary-foreground md:left-1/2 md:top-[calc(50%+2rem)] md:-translate-x-1/2">
                    2
                  </div>
                  <div className="flex items-start gap-6 md:w-1/2 md:pl-16">
                    <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg md:max-w-md">
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Search className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-foreground">
                        AI analyzes every clause
                      </h3>
                      <p className="text-text-secondary">
                        Our hybrid AI engine scans each clause, identifies risks,
                        and generates plain-English explanations with reasoning.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Step 3 */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={howItWorksInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="relative flex flex-col gap-6 md:flex-row md:items-center md:pt-16"
                >
                  <div className="flex items-start gap-6 md:w-1/2 md:justify-end md:pr-16 md:text-right">
                    <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg md:max-w-md">
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <BarChart3 className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-foreground">
                        Review, edit, and improve
                      </h3>
                      <p className="text-text-secondary">
                        See your risk score, read explanations, and simulate
                        improvements. Watch your score change as you edit clauses.
                      </p>
                    </div>
                  </div>
                  <div className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-4 border-background bg-primary text-sm font-bold text-primary-foreground md:left-1/2 md:top-[calc(50%+2rem)] md:-translate-x-1/2">
                    3
                  </div>
                  <div className="md:w-1/2" />
                </motion.div>
              </div>
            </div>

            <motion.div
              className="mt-16 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
              initial={{ opacity: 0 }}
              animate={howItWorksInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 }}
            >
              <Link
                href="/analyze"
                className="group inline-flex h-14 items-center gap-2 rounded-2xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:shadow-2xl hover:shadow-primary/30"
              >
                Start Analyzing
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <button
                onClick={() => setIsHowItWorksOpen(true)}
                className="inline-flex h-14 items-center gap-2 rounded-2xl border-2 border-border px-8 text-base font-semibold text-foreground transition-all hover:border-primary/50 hover:bg-surface"
              >
                View Full Guide
              </button>
            </motion.div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="border-y border-border bg-surface px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <motion.div
              className="relative rounded-3xl border border-border bg-background p-8 md:p-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Quote className="absolute left-6 top-6 h-8 w-8 text-primary/20 md:left-10 md:top-10 md:h-12 md:w-12" />
              <div className="relative">
                <div className="mb-6 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <blockquote className="text-xl text-foreground md:text-2xl">
                  &ldquo;ContractIQ helped me spot a liability clause that would have
                  made me personally responsible for unlimited damages. The AI
                  explanation made it crystal clear what I was about to sign.&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    SJ
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Sarah Johnson</p>
                    <p className="text-sm text-text-secondary">Freelance Designer</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Ready to understand your next contract?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-text-secondary">
              Join thousands of professionals who analyze their contracts before
              signing. Free, fast, and secure.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/analyze"
                className="group inline-flex h-14 items-center gap-2 rounded-2xl bg-primary px-10 text-lg font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:shadow-2xl hover:shadow-primary/30"
              >
                Analyze Now - Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Disclaimer */}
        <section className="border-t border-border bg-surface px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm text-text-muted">
              ContractIQ is an AI-powered tool for informational purposes only.
              It does not constitute legal advice. Consult a qualified attorney
              before making any legal decisions based on this analysis.
            </p>
          </div>
        </section>
      </main>

      <Footer />
      <HowItWorksModal isOpen={isHowItWorksOpen} onClose={() => setIsHowItWorksOpen(false)} />
    </div>
  );
}