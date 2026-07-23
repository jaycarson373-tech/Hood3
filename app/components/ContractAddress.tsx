"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ContractAddressProps = {
  address: string;
};

export function ContractAddress({ address }: ContractAddressProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
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

    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }

    resetTimer.current = setTimeout(() => setCopied(false), 1_000);
  }

  return (
    <div className="contract-address">
      <span>Contract address</span>
      <code>{address}</code>
      <button type="button" onClick={copyAddress} aria-label={copied ? "Contract address copied" : "Copy contract address"}>
        {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
        {copied ? "Copied ✓" : "Copy"}
      </button>
    </div>
  );
}
