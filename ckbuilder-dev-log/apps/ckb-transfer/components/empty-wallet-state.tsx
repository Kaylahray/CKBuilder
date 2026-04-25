"use client";

import { Wallet } from "lucide-react";
import { ccc } from "@ckb-ccc/connector-react";

type EmptyWalletStateProps = {
  message?: string;
};

export function EmptyWalletState({
  message = "Connect your wallet to get started",
}: EmptyWalletStateProps) {
  const { open } = ccc.useCcc();

  return (
    <div className="w-full max-w-3xl flex flex-col items-center justify-center py-20 px-6 border-2 border-dashed border-white/10 rounded-3xl bg-[#1a1a1a]/50 relative overflow-hidden group">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#EEFF54]/5 rounded-full blur-3xl transition-all group-hover:bg-[#EEFF54]/10" />

      <div className="relative mb-6">
        <div className="absolute inset-0 border border-dashed border-white/20 rounded-full animate-[spin_20s_linear_infinite]" />

        <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-sm relative z-10">
          <Wallet className="w-10 h-10 text-gray-500" />

          <div className="absolute inset-0 flex items-center justify-center -rotate-45">
            <div className="w-16 h-0.5 bg-[#EEFF54]/80 shadow-[0_0_10px_rgba(238,255,84,0.5)]" />
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-2 relative z-10">Vault Locked</h3>
      <p className="text-gray-400 mb-8 max-w-sm text-center relative z-10">{message}</p>

      <button
        onClick={open}
        className="relative z-10 bg-[#EEFF54]/10 hover:bg-[#EEFF54]/20 border border-[#EEFF54]/50 text-[#EEFF54] font-medium px-8 py-3 rounded-xl transition-all"
      >
        Connect Wallet
      </button>
    </div>
  );
}
