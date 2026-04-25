"use client";

import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/navbar";
import { EmptyWalletState } from "@/components/empty-wallet-state";
import { useSpore } from "@/hooks/use-spore";
import { useSigner } from "@ckb-ccc/connector-react";
import { ImagePlus, AlertCircle, CheckCircle2, Info, ArrowRight } from "lucide-react";

export default function SporePage() {
  const signer = useSigner();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    mintSpore,
    loadMintedSpores,
    isMinting,
    isLoadingSpores,
    status,
    mintedImageUrl,
    mintedSpores,
    resetSpore,
  } = useSpore();

  useEffect(() => {
    if (!signer) {
      return;
    }
    void loadMintedSpores();
  }, [signer]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <main className="min-h-screen flex flex-col selection:bg-[#EEFF54] selection:text-[#141414]">
      <Navbar />
      <div className="flex-1 flex flex-col items-center px-6 pt-16 pb-20 gap-8">
        {!signer ? (
          <EmptyWalletState message="Please connect your JoyID wallet to view and manage your Spore DOB collection." />
        ) : (
          <>
        <h1 className="text-4xl font-extrabold mb-4">Create <span className="text-[#EEFF54]">Spore DOB</span></h1>
        <p className="text-gray-400 mb-8 text-center max-w-md">Upload a small image and etch it directly into the Nervos blockchain forever.</p>

        <div className="w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#EEFF54]/5 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2" />

          {mintedImageUrl ? (
            <div className="space-y-6 flex flex-col items-center">
              <h2 className="text-xl font-bold text-[#EEFF54]">On-Chain Spore Minted!</h2>
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-[#EEFF54]/50 shadow-[0_0_30px_rgba(238,255,84,0.15)]">
                <img src={mintedImageUrl} alt="On-chain Spore" className="object-cover w-full h-full" />
              </div>
              <button
                onClick={() => {
                  resetSpore();
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Mint Another
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                  previewUrl ? "border-[#EEFF54]/50 bg-black/50 overflow-hidden" : "border-white/20 hover:border-[#EEFF54]/50 hover:bg-white/5"
                }`}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="object-cover w-full h-full opacity-80 hover:opacity-100 transition-opacity" />
                ) : (
                  <>
                    <ImagePlus className="w-10 h-10 text-gray-500 mb-3" />
                    <span className="text-gray-400 font-medium">Click to upload image (Keep it small!)</span>
                  </>
                )}
              </div>

              {status.message && (
                <div className={`p-4 rounded-xl flex items-start gap-3 text-sm ${status.type === 'error' ? 'bg-red-500/10 text-red-400' : status.type === 'success' ? 'bg-[#EEFF54]/10 text-[#EEFF54]' : 'bg-white/5 text-gray-300'}`}>
                  {status.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
                  {status.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                  {status.type === 'idle' && <Info className="w-5 h-5 shrink-0" />}
                  <p className="break-all mt-0.5">{status.message}</p>
                </div>
              )}

              <button
                onClick={() => selectedFile && mintSpore(selectedFile)}
                disabled={isMinting || !selectedFile}
                className="w-full bg-[#EEFF54] hover:bg-[#d4e64b] disabled:bg-white/10 disabled:text-gray-500 text-[#141414] font-bold text-lg py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isMinting ? "Minting to Blockchain..." : "Mint Spore"}
                {!isMinting && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>

        <section className="w-full max-w-5xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Your Minted Spores</h2>
            <button
              onClick={() => void loadMintedSpores()}
              disabled={isLoadingSpores}
              className="text-sm px-4 py-2 rounded-lg border border-white/20 hover:border-[#EEFF54]/60 disabled:opacity-50"
            >
              {isLoadingSpores ? "Loading..." : "Refresh"}
            </button>
          </div>

          {mintedSpores.length === 0 ? (
            <div className="rounded-2xl border border-white/10 p-6 text-gray-400">
              {isLoadingSpores ? "Loading minted spores from chain..." : "No image spores found for this wallet yet."}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mintedSpores.map((spore) => (
                <div key={spore.id} className="rounded-2xl overflow-hidden border border-white/10 bg-[#151515]">
                  <div className="aspect-square overflow-hidden">
                    <img src={spore.imageUrl} alt={`Spore ${spore.id.slice(0, 8)}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="px-3 py-2 text-xs text-gray-400 truncate">{spore.id}</div>
                </div>
              ))}
            </div>
          )}
        </section>
          </>
        )}
      </div>
    </main>
  );
}