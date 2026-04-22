"use client";

import { type ReactNode, type CSSProperties } from "react";
import { ccc } from "@ckb-ccc/connector-react";

interface CustomCSS extends CSSProperties {
  [key: `--${string}`]: string | number;
}

const isMainnet = process.env.NEXT_PUBLIC_IS_MAINNET === "true";
const defaultClient = isMainnet
  ? new ccc.ClientPublicMainnet()
  : new ccc.ClientPublicTestnet();

const clientOptions = [
  {
    name: "CKB Testnet",
    client: new ccc.ClientPublicTestnet(),
  },
  {
    name: "CKB Mainnet",
    client: new ccc.ClientPublicMainnet(),
  },
];

const connectorStyle: CustomCSS = {
  "--background": "#1a1a1a", 
  "--divider": "rgba(255, 255, 255, 0.1)",
  "--btn-primary": "#e3e6e4", 
  "--btn-primary-hover": "#d4e64b",
  "--btn-secondary": "#2D2F2F",
  "--btn-secondary-hover": "#515151",
  "--icon-primary": "#141414", 
  "--icon-secondary": "rgba(255, 255, 255, 0.6)",
  color: "#000000", 
  "--tip-color": "#9ca3af",
};

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ccc.Provider
      defaultClient={defaultClient}
      clientOptions={clientOptions}
      connectorProps={{ style: connectorStyle }}
    >
      {children}
    </ccc.Provider>
  );
}