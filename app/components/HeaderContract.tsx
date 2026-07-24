"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type HeaderContractProps = {
  address: string;
};

export function HeaderContract({ address }: HeaderContractProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      return;
    }

    setCopied(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), 1_000);
  }

  return (
    <button
      className="contract-chip header-ca-button"
      type="button"
      onClick={copyAddress}
      title={address}
      aria-label={copied ? "Contract address copied" : `Copy contract address ${address}`}
    >
      <span>{copied ? "COPIED" : "CA"}</span>
      <code>{shortAddress}</code>
      {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
    </button>
  );
}
