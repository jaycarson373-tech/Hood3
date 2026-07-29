import type { LucideIcon } from "lucide-react";
import {
  ArrowDownUp,
  BriefcaseBusiness,
  Flame,
  Landmark,
  Scale,
  ShieldCheck,
} from "lucide-react";

export type Metric = {
  label: string;
  value: string;
  detail: string;
};

export type MandatePoint = {
  label: string;
  value: string;
  text: string;
  icon: LucideIcon;
};

export const mandatePoints: MandatePoint[] = [
  {
    label: "Capital formation",
    value: "01",
    text: "Creator fees form the capital base for a transparent perpetual strategy.",
    icon: Landmark,
  },
  {
    label: "Risk-managed execution",
    value: "02",
    text: "Position sizing, leverage, and receipts remain visible whenever verified data exists.",
    icon: Scale,
  },
  {
    label: "Token alignment",
    value: "03",
    text: "Qualifying realized profit may purchase and permanently burn $HEDGE.",
    icon: Flame,
  },
];

export const strategySteps = [
  {
    number: "01",
    title: "Fees fund the mandate",
    text: "Creator fees are checked on a fixed cadence and routed into managed strategy capital.",
    icon: BriefcaseBusiness,
  },
  {
    number: "02",
    title: "Treasury opens the hedge",
    text: "The execution account maintains a public perpetual position within configured limits.",
    icon: ShieldCheck,
  },
  {
    number: "03",
    title: "Profit buys scarcity",
    text: "Qualifying realized profit returns to Solana, buys $HEDGE, and permanently burns it.",
    icon: ArrowDownUp,
  },
];

export const automationSteps = [
  {
    label: "01",
    title: "Collect",
    text: "Check creator fees and preserve the configured transaction buffer.",
  },
  {
    label: "02",
    title: "Bridge",
    text: "Route deployable capital to the public execution account.",
  },
  {
    label: "03",
    title: "Hedge",
    text: "Maintain the perpetual position within bounded execution parameters.",
  },
  {
    label: "04",
    title: "Return",
    text: "Route qualifying realized profit toward buybacks and permanent burns.",
  },
];

export const roadmap = [
  ["Phase I", "Build Treasury", "Establish transparent fee routing and public receipts."],
  ["Phase II", "Scale Hedge", "Grow strategy capital inside explicit risk limits."],
  ["Phase III", "Buybacks", "Convert qualifying realized profit into permanent supply reduction."],
  ["Phase IV", "Institutional Domination", "Make the best-dressed hedge fund on Solana impossible to ignore."],
];

export const risks = [
  "Perpetual positions can lose money or be liquidated.",
  "Bridges, exchanges, wallets, and automation can fail or experience delays.",
  "Buybacks and burns require qualifying realized profit and are never guaranteed.",
  "$HEDGE is a highly speculative community token and can lose most or all of its value.",
];
