import type { Metric } from "../data";

type MetricGridProps = {
  metrics: Metric[];
  className?: string;
};

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
