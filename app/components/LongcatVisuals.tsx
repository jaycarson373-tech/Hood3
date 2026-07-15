"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { Metric } from "../data";

type LongcatMascotProps = {
  variant?: "hero" | "line" | "vertical" | "crying";
  label?: string;
};

type MetricGridProps = {
  metrics: Metric[];
  className?: string;
};

type LongcatVisualProps = {
  scale?: number;
  className?: string;
};

const lengthMilestones = [
  { size: 0, height: 240 },
  { size: 10_000, height: 280 },
  { size: 25_000, height: 330 },
  { size: 50_000, height: 390 },
  { size: 100_000, height: 470 },
  { size: 250_000, height: 590 },
  { size: 500_000, height: 720 },
  { size: 1_000_000, height: 900 },
];

export function calculateBodyHeight(positionSizeUsd: number) {
  const size = Math.max(0, positionSizeUsd);

  for (let index = 1; index < lengthMilestones.length; index += 1) {
    const previous = lengthMilestones[index - 1];
    const next = lengthMilestones[index];

    if (size <= next.size) {
      const progress = (size - previous.size) / (next.size - previous.size);
      return Math.round(previous.height + (next.height - previous.height) * progress);
    }
  }

  return lengthMilestones[lengthMilestones.length - 1].height;
}

export function LongcatMascot({ variant = "hero", label = "Longcat mascot" }: LongcatMascotProps) {
  return (
    <div className={`longcat-mascot longcat-mascot--${variant}`} aria-label={label} role="img">
      <span className="longcat-tail" />
      <span className="longcat-body">
        <span className="longcat-leg longcat-leg--front" />
        <span className="longcat-leg longcat-leg--back" />
      </span>
      <span className="longcat-neck" />
      <span className="longcat-head">
        <span className="longcat-ear longcat-ear--left" />
        <span className="longcat-ear longcat-ear--right" />
        <span className="longcat-eye longcat-eye--left" />
        <span className="longcat-eye longcat-eye--right" />
        <span className="longcat-tear longcat-tear--left" />
        <span className="longcat-tear longcat-tear--right" />
        <span className="longcat-nose" />
      </span>
      <span className="longcat-arm longcat-arm--top" />
      <span className="longcat-arm longcat-arm--bottom" />
    </div>
  );
}

export function LongcatSpine() {
  const [catScale, setCatScale] = useState(500_000);

  useEffect(() => {
    const root = document.documentElement;
    const updateLength = () => {
      const scrollable = Math.max(1, document.body.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / scrollable));
      root.style.setProperty("--cat-scroll", progress.toFixed(4));
      setCatScale(Math.round(500_000 + progress * 500_000));
    };

    updateLength();
    window.addEventListener("scroll", updateLength, { passive: true });
    window.addEventListener("resize", updateLength);

    return () => {
      window.removeEventListener("scroll", updateLength);
      window.removeEventListener("resize", updateLength);
    };
  }, []);

  return (
    <div className="longcat-image-backdrop" aria-hidden="true">
      <LongcatVisual scale={catScale} className="longcat--backdrop" />
    </div>
  );
}

export function LongcatBackground() {
  return <LongcatSpine />;
}

export function LongcatVisual({ scale = 0, className = "" }: LongcatVisualProps) {
  const bodyHeight = calculateBodyHeight(scale);
  const style = { "--longcat-body-height": `${bodyHeight}px` } as CSSProperties;

  return (
    <div className={`longcat ${className}`.trim()} style={style}>
      <img className="longcat-head" src="/longcat-head.jpg" alt="" />
      <div className="longcat-body" />
      <img className="longcat-bottom" src="/longcat-bottom.jpg" alt="" />
    </div>
  );
}

export function LengthMeter() {
  return (
    <div className="length-meter" aria-label="Longcat length meter">
      <span>Looooooooooooooooooooong</span>
      <strong />
    </div>
  );
}

export function LongChart() {
  return (
    <div className="long-chart" aria-hidden="true">
      <span className="long-candle long-candle--one" />
      <span className="long-candle long-candle--two" />
      <span className="long-candle long-candle--three" />
      <span className="long-candle long-candle--four" />
      <span className="long-candle long-candle--five" />
      <span className="long-candle long-candle--six" />
      <span className="long-arrow" />
    </div>
  );
}

export function SupplyShrink() {
  return (
    <div className="supply-shrink" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
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
