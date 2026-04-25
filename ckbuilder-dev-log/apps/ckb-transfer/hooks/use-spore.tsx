import { useEffect, useRef, useState } from "react";
import { useSigner, ccc } from "@ckb-ccc/connector-react";

type MintedSpore = {
  id: string;
  imageUrl: string;
  contentType: string;
};

export function useSpore() {
  const signer = useSigner();
  const [isMinting, setIsMinting] = useState(false);
  const [isLoadingSpores, setIsLoadingSpores] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'error' | 'success', message: string }>({ type: 'idle', message: '' });
  const [mintedImageUrl, setMintedImageUrl] = useState<string | null>(null);
  const [mintedSpores, setMintedSpores] = useState<MintedSpore[]>([]);
  const mintedImageUrlRef = useRef<string | null>(null);
  const mintedSporesRef = useRef<MintedSpore[]>([]);

  const mintSpore = async (file: File) => {
    if (!signer) {
      setStatus({ type: 'error', message: "Please connect your wallet first." });
      return;
    }

    setIsMinting(true);
    setStatus({ type: 'idle', message: "Reading image data..." });

    try {
      // 1. Convert the file into raw bytes
      const arrayBuffer = await file.arrayBuffer();
      const content = new Uint8Array(arrayBuffer);
      const contentType = file.type; 

      setStatus({ type: 'idle', message: "Drafting Spore transaction..." });

      // 2. Draft the transaction natively with CCC
      const { tx: sporeTx, id: sporeId } = await ccc.spore.createSpore({
        signer,
        data: {
          contentType,
          content,
        },
      });

      // 3. Pay network fee
      await sporeTx.completeFeeBy(signer, 2000);

      // 4. Sign and Broadcast
      setStatus({ type: 'idle', message: "Waiting for wallet approval..." });
      const txHash = await signer.sendTransaction(sporeTx);
      
      setStatus({ type: 'idle', message: "Transaction sent! Waiting for confirmation..." });
      await signer.client.waitTransaction(txHash);

      setStatus({ type: 'success', message: `Spore Minted! ID: ${sporeId.slice(0, 10)}...` });

      // 5. Instantly fetch and render it back from the blockchain using the spore id.
      await renderMintedSpore(sporeId);

    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err instanceof Error ? err.message : "Failed to mint Spore." });
    } finally {
      setIsMinting(false);
    }
  };

  const renderMintedSpore = async (sporeId: string) => {
    if (!signer) return;

    try {
      // 1. Resolve spore data through the official spore API.
      const found = await ccc.spore.findSpore(signer.client, sporeId);
      if (!found) return;

      // 2. Convert the decoded bytes into browser-readable formats.
      const mimeType = found.sporeData.contentType || "application/octet-stream";
      const buffer = Uint8Array.from(ccc.bytesFrom(found.sporeData.content));

      // 3. Create a visual URL for the browser.
      const blob = new Blob([buffer], { type: mimeType });
      const url = URL.createObjectURL(blob);

      setMintedSpores((prev) => {
        const existing = prev.find((item) => item.id === sporeId);
        if (existing) {
          URL.revokeObjectURL(url);
          return prev;
        }
        return [{ id: sporeId, imageUrl: url, contentType: mimeType }, ...prev];
      });

      if (mintedImageUrlRef.current) {
        URL.revokeObjectURL(mintedImageUrlRef.current);
      }
      setMintedImageUrl(url);
    } catch (error) {
      console.error("Failed to render Spore from chain:", error);
    }
  };

  const loadMintedSpores = async (limit = 12) => {
    if (!signer) {
      setMintedSpores((prev) => {
        prev.forEach((item) => URL.revokeObjectURL(item.imageUrl));
        return [];
      });
      return;
    }

    setIsLoadingSpores(true);
    try {
      const loaded: MintedSpore[] = [];
      for await (const found of ccc.spore.findSporesBySigner({ signer, order: "desc", limit })) {
        const mimeType = found.sporeData.contentType || "application/octet-stream";
        if (!mimeType.startsWith("image/")) {
          continue;
        }

        const bytes = Uint8Array.from(ccc.bytesFrom(found.sporeData.content));
        const blob = new Blob([bytes], { type: mimeType });
        const imageUrl = URL.createObjectURL(blob);
        loaded.push({
          id: found.spore.cellOutput.type?.args ?? crypto.randomUUID(),
          imageUrl,
          contentType: mimeType,
        });
      }

      setMintedSpores((prev) => {
        prev.forEach((item) => URL.revokeObjectURL(item.imageUrl));
        return loaded;
      });
    } catch (error) {
      console.error("Failed to load minted spores:", error);
      setStatus({ type: "error", message: "Failed to load minted spores." });
    } finally {
      setIsLoadingSpores(false);
    }
  };

  useEffect(() => {
    mintedImageUrlRef.current = mintedImageUrl;
  }, [mintedImageUrl]);

  useEffect(() => {
    mintedSporesRef.current = mintedSpores;
  }, [mintedSpores]);

  useEffect(() => {
    return () => {
      mintedSporesRef.current.forEach((item) => URL.revokeObjectURL(item.imageUrl));
      if (mintedImageUrlRef.current) {
        URL.revokeObjectURL(mintedImageUrlRef.current);
      }
    };
  }, []);

  const resetSpore = () => {
    if (mintedImageUrl) {
      URL.revokeObjectURL(mintedImageUrl);
    }
    setMintedImageUrl(null);
    setStatus({ type: 'idle', message: '' });
  };

  return {
    mintSpore,
    loadMintedSpores,
    isMinting,
    isLoadingSpores,
    status,
    mintedImageUrl,
    mintedSpores,
    resetSpore,
  };
}