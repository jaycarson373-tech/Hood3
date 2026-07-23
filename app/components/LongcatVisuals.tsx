"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import type { Metric } from "../data";

type MetricGridProps = {
  metrics: Metric[];
  className?: string;
};

type LongcatScrollBackdropProps = {
  variant?: "landing" | "dashboard";
  extension?: number;
};

export function LongcatScrollBackdrop({ variant = "landing", extension = 0 }: LongcatScrollBackdropProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    function updateProgress() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const nextProgress = scrollable > 0 ? window.scrollY / scrollable : 0;
        backdropRef.current?.style.setProperty("--longcat-scroll", String(Math.min(1, Math.max(0, nextProgress))));
      });
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div
      ref={backdropRef}
      className={`longcat-scroll-backdrop longcat-scroll-backdrop--${variant}`}
      aria-hidden="true"
      style={
        {
          "--longcat-scroll": 0,
          "--longcat-extension": Math.min(1, Math.max(0, extension)),
        } as CSSProperties
      }
    />
  );
}

export function LongcatSignalField() {
  return (
    <div className="launch-signal-field" aria-hidden="true">
      <div className="launch-signal-grid" />
      <div className="launch-signal-chart">
        <span />
        <span />
        <span />
      </div>
      <div className="launch-signal-beam" />
    </div>
  );
}

export function SignalGraphicStack() {
  return (
    <div className="signal-graphic-stack" aria-label="Longcat Hyperliquid flywheel graphic">
      <div className="signal-card signal-card--position">
        <span>SOL LONG</span>
        <strong>PUBLIC SOL EXPOSURE</strong>
      </div>
      <div className="signal-card signal-card--flow">
        <span>FEES</span>
        <strong>FEES - HYPERLIQUID - SOL</strong>
      </div>
      <div className="signal-card signal-card--burn">
        <span>BURN</span>
        <strong>PROFIT - $LONGCAT</strong>
      </div>
    </div>
  );
}

export function MetricGrid({ metrics, className = "" }: MetricGridProps) {
  return (
    <div className={`metric-grid ${className}`.trim()}>
      {metrics.map((metric) => (
        <div className="metric-cell" key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          <small>{metric.detail}</small>
        </div>
      ))}
    </div>
  );
}
