import { generateKeyPairSync } from "node:crypto";
import { SiweMessage } from "siwe";
import { privateKeyToAccount } from "viem/accounts";

export const TEST_ACCOUNT = privateKeyToAccount(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
);

export function generateTestJwtKeys() {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  process.env.JWT_PRIVATE_KEY = privateKey;
  process.env.JWT_PUBLIC_KEY = publicKey;
}

export async function buildSignedSiweMessage(params: {
  nonce: string;
  domain: string;
  uri: string;
  chainId: number;
}) {
  const message = new SiweMessage({
    domain: params.domain,
    address: TEST_ACCOUNT.address,
    statement: "Sign in to Onchain Reputation",
    uri: params.uri,
    version: "1",
    chainId: params.chainId,
    nonce: params.nonce,
  });

  const prepared = message.prepareMessage();
  const signature = await TEST_ACCOUNT.signMessage({ message: prepared });
  return { message: prepared, signature };
}
