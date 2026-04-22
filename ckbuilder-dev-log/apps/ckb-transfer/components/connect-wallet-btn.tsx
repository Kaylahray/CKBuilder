import { ccc } from "@ckb-ccc/connector-react";

export default function ConnectWallet() {
  // 'open' triggers the wallet selection modal
  const { open, disconnect, setClient } = ccc.useCcc(); 
  // 'wallet' holds the connected wallet info
  const { wallet } = ccc.useCcc(); 

  return (
    <div>
      {wallet ? (
        <button onClick={disconnect}>
          Disconnect {wallet.name}
        </button>
      ) : (
        <button onClick={open}>
          Connect Wallet
        </button>
      )}
    </div>
  );
}