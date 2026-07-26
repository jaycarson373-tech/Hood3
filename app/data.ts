import {
  BadgeDollarSign,
  Flame,
  Radar,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Metric = {
  label: string;
  value: string;
  detail: string;
};

export type ThesisPoint = {
  label: string;
  value: string;
  text: string;
  icon: LucideIcon;
};

export type AutomationStep = {
  label: string;
  title: string;
  text: string;
};

export const bullThesisPoints: ThesisPoint[] = [
  {
    label: "Public conviction",
    value: "01",
    text: "Ansem built his reputation by expressing directional Solana trades in public. The Black Bull is the market's shorthand for that posture.",
    icon: Radar,
  },
  {
    label: "The meme becomes an asset",
    value: "02",
    text: "A community-launched ANSEM token turned the Black Bull identity into a liquid, onchain market with visible ownership and price discovery.",
    icon: BadgeDollarSign,
  },
  {
    label: "The flywheel",
    value: "03",
    text: "BBL converts creator-fee flow into an accumulating ANSEMUSDT 5x long on Aster, then routes qualifying realized profit toward buybacks and burns.",
    icon: Flame,
  },
];

export const howItWorks = [
  {
    title: "Creator fees are checked",
    text: "The worker checks the protocol fee wallet on a fixed 15-minute cadence.",
  },
  {
    title: "Collateral reaches Aster",
    text: "Routeable creator fees are moved into the dedicated Aster execution account.",
  },
  {
    title: "The ANSEM position grows",
    text: "Managed collateral builds the ANSEMUSDT long at 5x within configured size and risk limits.",
  },
  {
    title: "Profit can buy and burn",
    text: "Only qualifying realized profit may buy $BBL and permanently burn the purchased tokens.",
  },
];

export const automationSteps: AutomationStep[] = [
  {
    label: "01",
    title: "Collect",
    text: "Check creator fees and preserve the configured Solana transaction buffer.",
  },
  {
    label: "02",
    title: "Route",
    text: "Route deployable creator fees to the public Aster execution account.",
  },
  {
    label: "03",
    title: "Build",
    text: "Build the ANSEMUSDT 5x long with bounded execution.",
  },
  {
    label: "04",
    title: "Reduce",
    text: "Route qualifying realized profit into $BBL market buys and permanent burns.",
  },
];

export const risks = [
  "ANSEM and $BBL can lose most or all of their value.",
  "A 5x leveraged position can be liquidated and carries severe market, liquidity, custody, funding, and execution risk.",
  "Buybacks and burns only occur when qualifying realized profits exist; they are never guaranteed.",
  "The system depends on Solana, Aster, token liquidity, wallet controls, and unaudited automation.",
];

export const thesisRisks = [
  {
    label: "Market risk",
    text: "The ANSEM position can move sharply against the flywheel.",
  },
  {
    label: "Concentration risk",
    text: "Influencer-linked assets can be unusually sensitive to a small number of wallets and narratives.",
  },
  {
    label: "Execution risk",
    text: "Deposits, leveraged orders, profit realization, buybacks, and burns can fail or incur slippage.",
  },
  {
    label: "Narrative risk",
    text: "Attention is not permanent. The Black Bull thesis can lose cultural relevance.",
  },
];
