import { generateKeyPairSync } from "node:crypto";

const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

console.log("# Add to .env (escape newlines as \\n for single-line env files)");
console.log(`JWT_PRIVATE_KEY="${privateKey.trim().replace(/\n/g, "\\n")}"`);
console.log(`JWT_PUBLIC_KEY="${publicKey.trim().replace(/\n/g, "\\n")}"`);
