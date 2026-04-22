"use client";

import { useState } from "react";
import { useTransfer } from "../hooks/use-transfer";
import { ArrowRight, Info, AlertCircle, CheckCircle2 } from "lucide-react";
import { validateCkbAmount } from "../lib/utils";

export function TransferCard() {
  const [transferTo, setTransferTo] = useState("");
  const [amount, setAmount] = useState("");
  const [data, setData] = useState("");

  const { calculateMaxAmount, executeTransfer, isCalculating, isTransferring, status } = useTransfer();

  const { isValid: isAmountValid, error: amountError } = validateCkbAmount(amount);
  const hasStatusMessage = Boolean(status.message);

  const isButtonDisabled = !transferTo || !isAmountValid || isTransferring || isCalculating;

  const handleMaxAmount = async () => {
    if (!transferTo) return; 
    const max = await calculateMaxAmount(transferTo, data);
    if (max) setAmount(max);
  };

  const handleTransfer = async () => {
    if (isButtonDisabled) return;
    await executeTransfer(transferTo, amount, data);
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-16 bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#EEFF54]/5 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2" />

      <h2 className="text-2xl font-bold mb-8">Send CKB</h2>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Recipient Address</label>
          <textarea
            value={transferTo}
            onChange={(e) => setTransferTo(e.target.value)}
            placeholder="ckt1q..."
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#EEFF54]/50 focus:ring-1 focus:ring-[#EEFF54]/50 transition-all resize-none h-24"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400 flex justify-between">
            Amount (CKB)
            <button 
              onClick={handleMaxAmount}
              disabled={isCalculating || !transferTo}
              className="text-[#EEFF54] hover:text-[#d4e64b] disabled:opacity-50 text-xs tracking-wider uppercase font-bold transition-colors"
            >
              {isCalculating ? "Calculating..." : "Use Max"}
            </button>
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`w-full bg-white/5 border rounded-xl p-4 text-white text-lg placeholder:text-gray-600 focus:outline-none transition-all ${
                amountError 
                  ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500" 
                  : "border-white/10 focus:border-[#EEFF54]/50 focus:ring-1 focus:ring-[#EEFF54]/50"
              }`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">CKB</span>
          </div>
          {amountError && (
            <p className="text-red-400 text-xs font-medium pl-1">{amountError}</p>
          )}
        </div>

        <div className="min-h-24">
          {hasStatusMessage && (
            <div className={`p-4 rounded-xl flex items-start gap-3 text-sm ${
              status.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
              status.type === 'success' ? 'bg-[#EEFF54]/10 text-[#EEFF54] border border-[#EEFF54]/20' : 
              'bg-white/5 text-gray-300 border border-white/10'
            }`}>
              {status.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
              {status.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
              {status.type === 'idle' && <Info className="w-5 h-5 shrink-0" />}
              <p className="break-all mt-0.5">{status.message}</p>
            </div>
          )}
        </div>

        <button
          onClick={handleTransfer}
          disabled={isButtonDisabled}
          className="w-full bg-[#EEFF54] hover:bg-[#d4e64b] disabled:bg-white/10 disabled:text-gray-500 text-[#141414] font-bold text-lg py-4 rounded-xl transition-all flex items-center justify-center gap-2 group mt-4"
        >
          <span className="inline-flex min-w-[10rem] items-center justify-center gap-2">
            <span>{isTransferring ? "Processing..." : "Confirm Transfer"}</span>
            <ArrowRight
              className={`w-5 h-5 transition-all ${
                isTransferring ? "opacity-0" : `opacity-100 ${!isButtonDisabled ? "group-hover:translate-x-1" : ""}`
              }`}
            />
          </span>
        </button>
      </div>
    </div>
  );
}