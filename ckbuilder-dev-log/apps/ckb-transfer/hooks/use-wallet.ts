import { useState, useEffect } from "react";
import { ccc } from "@ckb-ccc/connector-react";

export function useWallet() {
  const { open, disconnect, wallet } = ccc.useCcc();
  const signer = ccc.useSigner();

  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<string>("");

  useEffect(() => {
    // If there is no signer (wallet disconnected), clear the state
    if (!signer) {
      setAddress("");
      setBalance("");
      return;
    }

    // Fetch the user's address and CKB balance
    const fetchWalletData = async () => {
      try {
        const addr = await signer.getRecommendedAddress();
        setAddress(addr);

        const capacity = await signer.getBalance();
        setBalance(ccc.fixedPointToString(capacity));
      } catch (error) {
        console.error("Failed to fetch wallet data:", error);
      }
    };

    fetchWalletData();
  }, [signer]);

  // Helper to format the address cleanly for the UI
  const formattedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  return {
    connect: open,
    disconnect,
    wallet,
    signer,
    address,
    balance,
    formattedAddress,
    isConnected: !!wallet,
  };
}