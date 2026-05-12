// components/ui/primitives.tsx
"use client";

import { cn } from "@/lib/utils";
import { motion, type MotionProps } from "framer-motion";
import * as React from "react";

/* -------- Card -------- */
export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-200/60 dark:border-ink-800/80 bg-white dark:bg-ink-900/60 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 pt-6 pb-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-display text-lg font-semibold tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-ink-500 dark:text-ink-400 mt-1", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 pb-6 pt-2", className)} {...props}>
      {children}
    </div>
  );
}

/* -------- Button -------- */
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-ink-900";
  const variants = {
    primary:
      "bg-ink-900 text-white hover:bg-ink-800 dark:bg-accent-400 dark:text-ink-950 dark:hover:bg-accent-300 shadow-sm",
    secondary:
      "bg-ink-100 text-ink-900 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-100 dark:hover:bg-ink-700",
    ghost:
      "text-ink-700 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800",
    outline:
      "border border-ink-200 text-ink-900 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-100 dark:hover:bg-ink-800",
    danger:
      "bg-rose-500 text-white hover:bg-rose-600 shadow-sm",
  };
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

/* -------- Badge -------- */
type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "accent" | "success" | "warn" | "danger" | "violet";
};

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default:
      "bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-300",
    accent:
      "bg-accent-400/15 text-accent-700 dark:text-accent-300 ring-1 ring-inset ring-accent-400/30",
    success:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-500/30",
    warn: "bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-500/30",
    danger:
      "bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-1 ring-inset ring-rose-500/30",
    violet:
      "bg-violet-500/15 text-violet-700 dark:text-violet-300 ring-1 ring-inset ring-violet-500/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/* -------- Alert -------- */
export function Alert({
  variant = "info",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "info" | "warn" | "danger" | "success";
}) {
  const variants = {
    info: "bg-accent-400/10 text-accent-800 dark:text-accent-200 border-accent-400/30",
    warn: "bg-amber-500/10 text-amber-800 dark:text-amber-200 border-amber-500/30",
    danger:
      "bg-rose-500/10 text-rose-800 dark:text-rose-200 border-rose-500/30",
    success:
      "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border-emerald-500/30",
  };
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* -------- PageHeader -------- */
export function PageHeader({
  title,
  description,
  step,
  children,
}: {
  title: string;
  description?: string;
  step?: { current: number; total: number };
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          {step && (
            <Badge variant="accent" className="mb-2">
              Step {step.current} of {step.total}
            </Badge>
          )}
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-ink-500 dark:text-ink-400 mt-2 max-w-2xl text-sm md:text-base">
              {description}
            </p>
          )}
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </motion.div>
  );
}

/* -------- Stat -------- */
export function Stat({
  label,
  value,
  sublabel,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  sublabel?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        accent
          ? "border-accent-400/40 bg-accent-400/5"
          : "border-ink-200/60 dark:border-ink-800/80 bg-white dark:bg-ink-900/40"
      )}
    >
      <div className="text-xs uppercase tracking-wider text-ink-500 dark:text-ink-400">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-semibold">{value}</div>
      {sublabel && (
        <div className="text-xs text-ink-500 dark:text-ink-400 mt-1">
          {sublabel}
        </div>
      )}
    </div>
  );
}

/* -------- Animated section -------- */
export function FadeIn({
  delay = 0,
  children,
  className,
  ...rest
}: { delay?: number; children: React.ReactNode; className?: string } & MotionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
