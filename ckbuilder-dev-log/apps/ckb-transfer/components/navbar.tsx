"use client";

import { Wallet, LogOut } from "lucide-react";
import { useWallet } from "../hooks/use-wallet";

export function Navbar() {
  const { connect, disconnect, wallet, formattedAddress, balance, isConnected } = useWallet();

  return (
    <nav className="w-full border-b border-white/10 bg-[#141414]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEFF54] flex items-center justify-center">
            <Wallet className="text-[#141414] w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">
            CKB <span className="text-[#EEFF54]">Transfer</span>
          </span>
        </div>

        {/* Wallet Connection Section */}
        <div>
          {isConnected ? (
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-1.5 pl-4 rounded-full">
              
              {/* Wallet Icon & Balance (Added from reference code) */}
              <div className="flex items-center gap-2 mr-2">
                {wallet?.icon && (
                  <img src={wallet.icon} alt="Wallet icon" className="w-5 h-5 rounded-full" />
                )}
                {balance && (
                  <span className="text-sm font-bold text-[#EEFF54]">
                    {Number(balance).toLocaleString()} CKB
                  </span>
                )}
              </div>

              {/* Address */}
              <span className="text-sm font-medium text-gray-300 border-l border-white/10 pl-4 py-1">
                {formattedAddress}
              </span>
              
              {/* Disconnect Button */}
              <button 
                onClick={disconnect}
                className="bg-white/10 hover:bg-red-500/20 hover:text-red-400 p-2 rounded-full transition-colors ml-1"
                title="Disconnect Wallet"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={connect}
              className="bg-[#EEFF54] hover:bg-[#d4e64b] text-[#141414] font-semibold px-6 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(238,255,84,0.15)] hover:shadow-[0_0_25px_rgba(238,255,84,0.25)]"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}