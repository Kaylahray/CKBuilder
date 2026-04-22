import { useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { useWallet } from "./use-wallet";

export function useTransfer() {
  const { signer } = useWallet();
  const [isCalculating, setIsCalculating] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'error' | 'success', message: string }>({ type: 'idle', message: '' });

  const calculateMaxAmount = async (transferTo: string, data: string): Promise<string | undefined> => {
    if (!signer) {
      setStatus({ type: 'error', message: "Please connect your wallet first." });
      return;
    }
    
    setIsCalculating(true);
    setStatus({ type: 'idle', message: "Calculating max capacity..." });
    
    try {
      const { script: toLock } = await ccc.Address.fromString(transferTo, signer.client);
      const outputData = data ? ccc.bytesFrom(data) : [];

      const tx = ccc.Transaction.from({
        outputs: [{ lock: toLock }],
        outputsData: [outputData],
      });

      await tx.completeInputsAll(signer);
      await tx.completeFeeChangeToOutput(signer, 0, 2000);
      
      const maxAmount = ccc.fixedPointToString(tx.outputs[0].capacity);
      setStatus({ type: 'success', message: `Max transferable: ${maxAmount} CKB` });
      return maxAmount;
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : "Failed to calculate max amount" });
    } finally {
      setIsCalculating(false);
    }
  };

  const executeTransfer = async (transferTo: string, amount: string, data: string) => {
    if (!signer) {
      setStatus({ type: 'error', message: "Please connect your wallet first." });
      return;
    }

    setIsTransferring(true);
    setStatus({ type: 'idle', message: "Waiting for wallet approval..." });
    
    try {
      const { script: toLock } = await ccc.Address.fromString(transferTo, signer.client);
      const outputData = data ? ccc.bytesFrom(data) : [];

      const tx = ccc.Transaction.from({
        outputs: [{ lock: toLock }],
        outputsData: [outputData],
      });

      tx.outputs[0].capacity = ccc.fixedPointFrom(amount);

      await tx.completeInputsByCapacity(signer);
      await tx.completeFeeBy(signer, 2000);

      const txHash = await signer.sendTransaction(tx);
      setStatus({ type: 'idle', message: "Transaction sent. Waiting for confirmation..." });
      
      await signer.client.waitTransaction(txHash);
      setStatus({ type: 'success', message: `Transfer Complete! Hash: ${txHash.slice(0, 10)}...` });
      
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : "Transaction rejected or failed." });
    } finally {
      setIsTransferring(false);
    }
  };

  return { calculateMaxAmount, executeTransfer, isCalculating, isTransferring, status };
}