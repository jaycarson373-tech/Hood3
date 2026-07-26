import Image from "next/image";
import type { Metric } from "../data";

type MetricGridProps = {
  metrics: Metric[];
  className?: string;
};

type BullBackdropProps = {
  variant?: "landing" | "dashboard" | "lore";
};

export function BullBackdrop({ variant = "landing" }: BullBackdropProps) {
  return (
    <div
      className={`bull-backdrop bull-backdrop--${variant}`}
      aria-hidden="true"
    >
      <div className="bull-backdrop__grid" />
      <div className="bull-backdrop__chart">
        <span />
        <span />
        <span />
      </div>
      <Image
        className="bull-backdrop__mark"
        src="/bbl-mark.png"
        alt=""
        width={820}
        height={820}
        sizes="(max-width: 768px) 90vw, 680px"
      />
    </div>
  );
}

export function BullSignalStack() {
  return (
    <div
      className="bull-signal-stack"
      aria-label="Black Bull Flywheel"
    >
      <div>
        <span>POSITION</span>
        <strong>ANSEM SPOT</strong>
      </div>
      <div>
        <span>QUALIFYING PROFIT</span>
        <strong>$BBL BUYBACK</strong>
      </div>
      <div>
        <span>FINAL STATE</span>
        <strong>PERMANENT BURN</strong>
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
