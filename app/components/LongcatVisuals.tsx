"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
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
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    function updateProgress() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const nextProgress = scrollable > 0 ? window.scrollY / scrollable : 0;
        setProgress(Math.min(1, Math.max(0, nextProgress)));
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
      className={`longcat-scroll-backdrop longcat-scroll-backdrop--${variant}`}
      aria-hidden="true"
      style={
        {
          "--longcat-scroll": progress,
          "--longcat-extension": Math.min(1, Math.max(0, extension)),
        } as CSSProperties
      }
    />
  );
}

export function LongcatSignalField() {
  return (
    <div className="hood3-signal-field" aria-hidden="true">
      <div className="hood3-signal-grid" />
      <div className="hood3-signal-chart">
        <span />
        <span />
        <span />
      </div>
      <div className="hood3-signal-beam" />
    </div>
  );
}

export function SignalGraphicStack() {
  return (
    <div className="signal-graphic-stack" aria-label="Longcat Hyperliquid flywheel graphic">
      <div className="signal-card signal-card--position">
        <span>SOL LONG</span>
        <strong>Awaiting live integration.</strong>
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
