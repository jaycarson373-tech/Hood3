"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CircleDollarSign,
  Database,
  ExternalLink,
  Gauge,
  Link2,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  WalletCards,
} from "lucide-react";

type LoadState = "idle" | "loading" | "linked" | "error";

type HyperliquidPosition = {
  position?: {
    coin?: string;
    szi?: string;
    positionValue?: string;
    unrealizedPnl?: string;
    entryPx?: string;
    leverage?: {
      type?: string;
      value?: number;
    };
  };
};

type HyperliquidAccount = {
  marginSummary?: {
    accountValue?: string;
    totalNtlPos?: string;
    totalMarginUsed?: string;
  };
  crossMarginSummary?: {
    accountValue?: string;
    totalNtlPos?: string;
    totalMarginUsed?: string;
  };
  assetPositions?: HyperliquidPosition[];
};

type NormalizedPosition = {
  coin: string;
  size: number;
  notional: number;
  pnl: number;
  entry: number;
  leverage: string;
};

const thesisPoints = [
  {
    label: "Deposit engine",
    value: "$377B",
    text: "Robinhood reported 27.7M funded customers, $377B in Total Platform Assets, and 27% LTM net deposit growth as of May 31, 2026.",
  },
  {
    label: "Trading intensity",
    value: "$315B",
    text: "May equity notional volumes were $315B, up 75% year over year; options contracts were up 29%, and event contracts reached 3.9B.",
  },
  {
    label: "Interest flywheel",
    value: "$19.5B",
    text: "Margin balances were $19.5B in May, up 117% year over year, while cash and deposits rose 54%.",
  },
  {
    label: "Monetization",
    value: "$1.07B",
    text: "Q1 2026 revenue grew 15% year over year, adjusted EBITDA grew 14%, and Gold subscribers reached 4.3M.",
  },
  {
    label: "Product velocity",
    value: "100M+",
    text: "Robinhood said its public Robinhood Chain testnet processed over 100M transactions while it pushes tokenization, global brokerage, and active-trader products.",
  },
];

const risks = [
  "Revenue can swing with markets, crypto activity, rates, and retail trading appetite.",
  "Tokenized equities, prediction markets, perps, and event contracts remain regulatory hot zones.",
  "Growth spending, acquisitions, and convertible-note financing can pressure margins or dilution.",
  "The NLT design needs audits, risk limits, liquidation handling, and user disclosures before production.",
];

const sourceLinks = [
  {
    label: "Robinhood IR overview, May 31 2026 metrics",
    href: "https://investors.robinhood.com/",
  },
  {
    label: "Robinhood May 2026 operating data",
    href: "https://investors.robinhood.com/news-releases/news-release-details/robinhood-markets-inc-reports-may-2026-operating-data",
  },
  {
    label: "Robinhood Q1 2026 results",
    href: "https://investors.robinhood.com/news-releases/news-release-details/robinhood-reports-first-quarter-2026-results",
  },
  {
    label: "Hyperliquid clearinghouseState docs",
    href: "https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals",
  },
];

const demoAccount: HyperliquidAccount = {
  marginSummary: {
    accountValue: "418200.41",
    totalNtlPos: "1254600.00",
    totalMarginUsed: "139400.00",
  },
  crossMarginSummary: {
    accountValue: "418200.41",
    totalNtlPos: "1254600.00",
    totalMarginUsed: "139400.00",
  },
  assetPositions: [
    {
      position: {
        coin: "HOOD",
        szi: "9450",
        positionValue: "1063125",
        unrealizedPnl: "68440",
        entryPx: "104.76",
        leverage: { type: "cross", value: 3 },
      },
    },
  ],
};

const addressPattern = /^0x[a-fA-F0-9]{40}$/;

function safeNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function money(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits,
  }).format(value);
}

function compact(value: number, prefix = "") {
  return `${prefix}${new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)}`;
}

function percent(value: number) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

function shortAddress(address: string) {
  if (!address) return "No account linked";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function normalizePositions(account: HyperliquidAccount | null): NormalizedPosition[] {
  return (account?.assetPositions ?? [])
    .map((item) => item.position)
    .filter(Boolean)
    .map((position) => {
      const size = safeNumber(position?.szi);
      const notional = Math.abs(safeNumber(position?.positionValue));
      const leverageValue = position?.leverage?.value;

      return {
        coin: position?.coin ?? "UNKNOWN",
        size,
        notional,
        pnl: safeNumber(position?.unrealizedPnl),
        entry: safeNumber(position?.entryPx),
        leverage: leverageValue ? `${leverageValue}x ${position?.leverage?.type ?? ""}` : "n/a",
      };
    });
}

export default function Home() {
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<LoadState>("idle");
  const [message, setMessage] = useState("Paste a Hyperliquid master or sub-account address to read public perps state.");
  const [account, setAccount] = useState<HyperliquidAccount | null>(null);
  const [monthlyVolume, setMonthlyVolume] = useState(7_500_000);
  const [feeBps, setFeeBps] = useState(35);
  const [allocation, setAllocation] = useState(70);
  const [targetLeverage, setTargetLeverage] = useState(3);
  const [hoodMark, setHoodMark] = useState(112.5);
  const [nltSupply, setNltSupply] = useState(1_000_000);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const savedAddress = window.localStorage.getItem("hood3-hyperliquid-address");
      const savedAccount = window.localStorage.getItem("hood3-demo-account");

      if (savedAddress) {
        setAddress(savedAddress);
      }

      if (savedAccount === "true") {
        setAccount(demoAccount);
        setStatus("linked");
        setMessage("Demo account loaded. Replace it with a real Hyperliquid address whenever you want.");
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const positions = useMemo(() => normalizePositions(account), [account]);
  const hoodPositions = positions.filter((position) => position.coin.toUpperCase().includes("HOOD"));
  const liveHoodLong = hoodPositions
    .filter((position) => position.size > 0)
    .reduce((sum, position) => sum + position.notional, 0);
  const liveHoodPnl = hoodPositions.reduce((sum, position) => sum + position.pnl, 0);
  const accountValue = safeNumber(account?.marginSummary?.accountValue ?? account?.crossMarginSummary?.accountValue);
  const accountNotional = safeNumber(account?.marginSummary?.totalNtlPos ?? account?.crossMarginSummary?.totalNtlPos);
  const marginUsed = safeNumber(account?.marginSummary?.totalMarginUsed ?? account?.crossMarginSummary?.totalMarginUsed);

  const monthlyFees = monthlyVolume * (feeBps / 10_000);
  const monthlyAllocation = monthlyFees * (allocation / 100);
  const projectedLongNotional = monthlyAllocation * targetLeverage;
  const displayedLongNotional = liveHoodLong > 0 ? liveHoodLong : projectedLongNotional;
  const projectedShares = hoodMark > 0 ? projectedLongNotional / hoodMark : 0;
  const backingPerNlt = displayedLongNotional / Math.max(nltSupply, 1);
  const refillRate = displayedLongNotional > 0 ? (monthlyAllocation / displayedLongNotional) * 100 : 0;
  const liquidationBuffer = targetLeverage > 0 ? 100 / targetLeverage : 0;

  async function linkAccount() {
    const cleanAddress = address.trim();

    if (!addressPattern.test(cleanAddress)) {
      setStatus("error");
      setMessage("Enter a 42-character 0x Hyperliquid account address.");
      return;
    }

    setStatus("loading");
    setMessage("Reading public clearinghouse state from Hyperliquid.");

    try {
      const response = await fetch("https://api.hyperliquid.xyz/info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "clearinghouseState",
          user: cleanAddress,
        }),
      });

      if (!response.ok) {
        throw new Error(`Hyperliquid returned ${response.status}`);
      }

      const data = (await response.json()) as HyperliquidAccount;
      setAccount(data);
      setStatus("linked");
      setMessage("Account linked in read-only mode. HOOD exposure appears in the flywheel when a matching position exists.");
      window.localStorage.setItem("hood3-hyperliquid-address", cleanAddress);
      window.localStorage.removeItem("hood3-demo-account");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not read the account. Try again or use the demo state.");
    }
  }

  function loadDemo() {
    setAddress("0x0000000000000000000000000000000000000000");
    setAccount(demoAccount);
    setStatus("linked");
    setMessage("Demo account loaded. It shows the intended Hood3 readout before production plumbing.");
    window.localStorage.setItem("hood3-demo-account", "true");
  }

  function clearAccount() {
    setAddress("");
    setAccount(null);
    setStatus("idle");
    setMessage("Paste a Hyperliquid master or sub-account address to read public perps state.");
    window.localStorage.removeItem("hood3-hyperliquid-address");
    window.localStorage.removeItem("hood3-demo-account");
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Hood3 home">
          <span className="brand-mark">H3</span>
          <span>
            <strong>Hood3</strong>
            <small>NLT desk</small>
          </span>
        </a>
        <nav className="nav">
          <a href="#flywheel">Flywheel</a>
          <a href="#account">Account</a>
          <a href="#thesis">Thesis</a>
          <a href="#sources">Sources</a>
        </nav>
      </header>

      <section id="top" className="hero-band">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={15} aria-hidden="true" />
            Fees to HOOD long, displayed as NLT backing
          </div>
          <h1>Hood3 NLT flywheel</h1>
          <p>
            A simple product screen for routing protocol fees into a HOOD long on Hyperliquid, linking a public account,
            and showing the live or simulated long amount inside the Native Leverage Token flywheel.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#account">
              <Link2 size={17} aria-hidden="true" />
              Link account
            </a>
            <button className="button ghost" type="button" onClick={loadDemo}>
              <Database size={17} aria-hidden="true" />
              Demo state
            </button>
          </div>
        </div>

        <div className="live-tape" aria-label="Hood3 flywheel metrics">
          <div>
            <span>Fee run-rate</span>
            <strong>{money(monthlyFees)}</strong>
            <small>{feeBps} bps on {compact(monthlyVolume, "$")} monthly flow</small>
          </div>
          <div>
            <span>HOOD long shown</span>
            <strong>{money(displayedLongNotional)}</strong>
            <small>{liveHoodLong > 0 ? "from linked account" : `${targetLeverage}x projected exposure`}</small>
          </div>
          <div>
            <span>NLT backing</span>
            <strong>{money(backingPerNlt, 4)}</strong>
            <small>per token at {compact(nltSupply)} supply</small>
          </div>
        </div>
      </section>

      <section id="flywheel" className="section-grid flywheel-layout">
        <div className="panel flywheel-panel">
          <div className="section-heading">
            <span className="icon-chip">
              <RefreshCcw size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="kicker">Native Leverage Token</p>
              <h2>NLT fee flywheel</h2>
            </div>
          </div>

          <div className="flywheel-visual" aria-label="Fee to HOOD long flywheel">
            <div className="flywheel-ring">
              <div className="flywheel-core">
                <span>HOOD Long</span>
                <strong>{money(displayedLongNotional)}</strong>
                <small>{liveHoodLong > 0 ? "linked" : "simulated"}</small>
              </div>
            </div>
            <div className="flywheel-legend">
              <span>Fees</span>
              <ArrowRight size={15} aria-hidden="true" />
              <span>Margin</span>
              <ArrowRight size={15} aria-hidden="true" />
              <span>Long</span>
              <ArrowRight size={15} aria-hidden="true" />
              <span>NLT</span>
            </div>
          </div>

          <div className="flywheel-steps">
            <div>
              <span>1. Capture</span>
              <strong>{money(monthlyFees)}</strong>
              <small>monthly fees</small>
            </div>
            <div>
              <span>2. Allocate</span>
              <strong>{money(monthlyAllocation)}</strong>
              <small>{percent(allocation)} to HOOD collateral</small>
            </div>
            <div>
              <span>3. Lever</span>
              <strong>{money(projectedLongNotional)}</strong>
              <small>{targetLeverage}x target notional</small>
            </div>
            <div>
              <span>4. Publish</span>
              <strong>{money(backingPerNlt, 4)}</strong>
              <small>HOOD backing per NLT</small>
            </div>
          </div>
        </div>

        <div className="panel controls-panel">
          <div className="section-heading compact-heading">
            <span className="icon-chip">
              <Gauge size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="kicker">Desk controls</p>
              <h2>Fee routing model</h2>
            </div>
          </div>

          <label className="control">
            <span>Monthly feeable flow</span>
            <input
              type="number"
              min="10000"
              step="10000"
              value={monthlyVolume}
              onChange={(event) => setMonthlyVolume(safeNumber(event.target.value, monthlyVolume))}
            />
          </label>

          <label className="range-control">
            <span>
              Protocol fee <strong>{feeBps} bps</strong>
            </span>
            <input
              type="range"
              min="5"
              max="100"
              value={feeBps}
              onChange={(event) => setFeeBps(safeNumber(event.target.value, feeBps))}
            />
          </label>

          <label className="range-control">
            <span>
              Allocation to HOOD long <strong>{percent(allocation)}</strong>
            </span>
            <input
              type="range"
              min="10"
              max="95"
              value={allocation}
              onChange={(event) => setAllocation(safeNumber(event.target.value, allocation))}
            />
          </label>

          <div className="two-controls">
            <label className="control">
              <span>Target leverage</span>
              <input
                type="number"
                min="1"
                max="5"
                step="0.25"
                value={targetLeverage}
                onChange={(event) => setTargetLeverage(safeNumber(event.target.value, targetLeverage))}
              />
            </label>
            <label className="control">
              <span>Demo HOOD mark</span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={hoodMark}
                onChange={(event) => setHoodMark(safeNumber(event.target.value, hoodMark))}
              />
            </label>
          </div>

          <label className="control">
            <span>NLT supply</span>
            <input
              type="number"
              min="1"
              step="1000"
              value={nltSupply}
              onChange={(event) => setNltSupply(safeNumber(event.target.value, nltSupply))}
            />
          </label>

          <div className="risk-strip">
            <div>
              <span>Projected shares</span>
              <strong>{new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(projectedShares)}</strong>
            </div>
            <div>
              <span>Monthly refill</span>
              <strong>{percent(refillRate)}</strong>
            </div>
            <div>
              <span>Move to wipe margin</span>
              <strong>{percent(liquidationBuffer)}</strong>
            </div>
          </div>
        </div>
      </section>

      <section id="account" className="section-grid account-layout">
        <div className="panel account-panel">
          <div className="section-heading">
            <span className="icon-chip">
              <WalletCards size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="kicker">Hyperliquid account</p>
              <h2>Read-only link</h2>
            </div>
          </div>

          <div className={`status-pill ${status}`}>
            <span aria-hidden="true" />
            {status === "loading" ? "Reading account" : status === "linked" ? "Account linked" : status === "error" ? "Needs attention" : "Demo or link"}
          </div>

          <label className="control address-control">
            <span>Account address</span>
            <input
              value={address}
              placeholder="0x..."
              onChange={(event) => setAddress(event.target.value)}
              spellCheck={false}
            />
          </label>

          <div className="button-row">
            <button className="button primary" type="button" onClick={linkAccount} disabled={status === "loading"}>
              <Link2 size={17} aria-hidden="true" />
              Read account
            </button>
            <button className="button ghost" type="button" onClick={loadDemo}>
              <Database size={17} aria-hidden="true" />
              Demo
            </button>
            <button className="icon-button" type="button" onClick={clearAccount} aria-label="Clear linked account">
              <RefreshCcw size={18} aria-hidden="true" />
            </button>
          </div>

          <p className="helper-text">{message}</p>

          <div className="account-readout">
            <div>
              <span>Linked account</span>
              <strong>{shortAddress(address)}</strong>
            </div>
            <div>
              <span>Account value</span>
              <strong>{account ? money(accountValue) : "-"}</strong>
            </div>
            <div>
              <span>Total perp notional</span>
              <strong>{account ? money(accountNotional) : "-"}</strong>
            </div>
            <div>
              <span>Margin used</span>
              <strong>{account ? money(marginUsed) : "-"}</strong>
            </div>
          </div>
        </div>

        <div className="panel exposure-panel">
          <div className="section-heading compact-heading">
            <span className="icon-chip">
              <TrendingUp size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="kicker">Published exposure</p>
              <h2>HOOD long amount</h2>
            </div>
          </div>

          <div className="exposure-number">
            <span>{liveHoodLong > 0 ? "Linked HOOD long" : "Projected HOOD long"}</span>
            <strong>{money(displayedLongNotional)}</strong>
            <small>{liveHoodLong > 0 ? `${money(liveHoodPnl)} unrealized PnL` : `${money(monthlyAllocation)} fee allocation at ${targetLeverage}x`}</small>
          </div>

          <div className="positions-table">
            <div className="table-head">
              <span>Coin</span>
              <span>Size</span>
              <span>Notional</span>
              <span>PnL</span>
            </div>
            {(hoodPositions.length ? hoodPositions : positions.slice(0, 3)).map((position) => (
              <div className="table-row" key={`${position.coin}-${position.notional}-${position.size}`}>
                <span>{position.coin}</span>
                <span>{new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(position.size)}</span>
                <span>{money(position.notional)}</span>
                <span className={position.pnl >= 0 ? "positive" : "negative"}>{money(position.pnl)}</span>
              </div>
            ))}
            {!positions.length && (
              <div className="empty-row">
                Link an account or load the demo state to populate public positions.
              </div>
            )}
          </div>

          <div className="disclosure">
            <ShieldCheck size={18} aria-hidden="true" />
            No private keys, signatures, custody, or order placement in this prototype.
          </div>
        </div>
      </section>

      <section id="thesis" className="thesis-band">
        <div className="section-heading">
          <span className="icon-chip">
            <BarChart3 size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="kicker">Bullish thesis</p>
            <h2>Why the HOOD long exists</h2>
          </div>
        </div>

        <div className="thesis-grid">
          {thesisPoints.map((point) => (
            <article className="thesis-card" key={point.label}>
              <span>{point.label}</span>
              <strong>{point.value}</strong>
              <p>{point.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-grid risk-layout">
        <div className="panel memo-panel">
          <div className="section-heading compact-heading">
            <span className="icon-chip">
              <CircleDollarSign size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="kicker">Mechanism memo</p>
              <h2>Fee-backed leverage token</h2>
            </div>
          </div>
          <p>
            Hood3 fees accumulate as margin, a defined share is routed to a HOOD long, and the account readout publishes
            the long notional as NLT backing. The user-facing token can be shown as levered HOOD exposure while governance
            controls allocation, leverage, max drawdown, and rebalance cadence.
          </p>
          <div className="memo-flow">
            <span>Flow</span>
            <strong>{"Fees -> collateral -> HOOD long -> NLT backing"}</strong>
          </div>
        </div>

        <div className="panel risk-panel">
          <div className="section-heading compact-heading">
            <span className="icon-chip warning">
              <TriangleAlert size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="kicker">Bear case</p>
              <h2>Risks to track</h2>
            </div>
          </div>
          <ul className="risk-list">
            {risks.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
        </div>
      </section>

      <footer id="sources" className="footer">
        <p>
          Prototype only. Not investment advice, not an offer to buy or sell securities, derivatives, crypto assets, or
          NLT tokens. Perpetuals and leverage can lose money quickly.
        </p>
        <div className="source-links">
          {sourceLinks.map((source) => (
            <a key={source.href} href={source.href} target="_blank" rel="noreferrer">
              {source.label}
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          ))}
        </div>
      </footer>
    </main>
  );
}
