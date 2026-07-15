import Image from "next/image";
import type { Metric } from "../data";

type LongcatMascotProps = {
  variant?: "hero" | "line" | "vertical" | "crying";
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
  return (
    <div className="longcat-image-backdrop" aria-hidden="true">
      <Image className="longcat-wallpaper" src="/longcat-wallpaper-clean.png" alt="" width={877} height={1794} priority />
    </div>
  );
}

export function LongcatBackground() {
  return <LongcatSpine />;
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
