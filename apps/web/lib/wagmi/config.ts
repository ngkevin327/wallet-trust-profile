import { CHAIN_IDS } from "@onchain-reputation/shared";
import { http, createConfig } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export const wagmiConfig = createConfig({
  chains: [mainnet, base],
  connectors: [
    injected({ target: "metaMask" }),
    ...(projectId
      ? [
          walletConnect({
            projectId,
            showQrModal: true,
          }),
        ]
      : []),
  ],
  transports: {
    [CHAIN_IDS.ETHEREUM_MAINNET]: http(),
    [CHAIN_IDS.BASE]: http(),
  },
  ssr: true,
});
