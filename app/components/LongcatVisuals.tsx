import type { Metric } from "../data";

type LongcatMascotProps = {
  variant?: "hero" | "line" | "vertical";
  label?: string;
};

type MetricGridProps = {
  metrics: Metric[];
  className?: string;
};

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
        <span className="longcat-nose" />
      </span>
      <span className="longcat-arm longcat-arm--top" />
      <span className="longcat-arm longcat-arm--bottom" />
    </div>
  );
}

export function LongcatBackground() {
  return (
    <div className="longcat-background" aria-hidden="true">
      <div className="grid-glow" />
      <div className="ticker-rain">
        <span>LONG +0.00</span>
        <span>CASHCAT 0.00x</span>
        <span>FEES $0</span>
        <span>BURN 0</span>
      </div>
      <LongcatMascot variant="line" label="Decorative longcat silhouette" />
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
