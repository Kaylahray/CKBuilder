import { ccc } from "@ckb-ccc/connector-react";

export default function ConnectWallet() {
  const { open, disconnect, setClient } = ccc.useCcc(); 
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