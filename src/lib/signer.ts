import { certificateManager } from "@akashnetwork/akashjs/build/certificates/certificate-manager";
import type { EncodeObject } from "@cosmjs/proto-signing";
import { MsgCreateCertificate } from "@akashnetwork/akash-api/v1beta3";
import { SigningStargateClient, type StdFee } from "@cosmjs/stargate";
import { type Window as KeplrWindow } from "@keplr-wallet/types";

const rpcEndpoint = "https://rpc.akashnet.net:443";

// Extend the Window interface to include Keplr
declare global {
  interface Window extends KeplrWindow {}
}

export async function getSigningStargateClient() {
  const chainId = "akashnet-2";
  // Check if Keplr is installed
  if (!window.keplr) {
    throw new Error("Keplr extension not found");
  }

  // Enable the wallet for the given chainId
  await window.keplr.enable(chainId);

  // Get the offline signer for the chain
  const offlineSigner = window.keplr.getOfflineSigner(chainId);

  // Get the first account from the offline signer
  const accounts = await offlineSigner.getAccounts();

  // Create the SigningStargateClient
  const client = await SigningStargateClient.connectWithSigner(
    rpcEndpoint,
    offlineSigner
  );

  return { client, account: accounts[0] };
}

export async function signTransaction(client:SigningStargateClient, 
  wallet_address:string , messages: readonly EncodeObject[], 
  fee: StdFee | "auto" | number, 
  memo?: string
):Promise<number>
{
  const tx = await client.signAndBroadcast(wallet_address, messages, fee, memo);

  return tx.code
}

/**
 * Converts a base64 string to a Uint8Array.
 * @param {string} base64 - The base64 encoded string.
 * @returns {Uint8Array} A Uint8Array representation of the base64 string.
 */
function base64ToUInt(base64) {
  if (typeof window !== "undefined") {
      const binary_string = window.atob(base64);
      const len = binary_string.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
          bytes[i] = binary_string.charCodeAt(i);
      }
      return bytes;
  }
  return Buffer.from(base64, "base64");
}

/**
 * Converts a Uint8Array or string to a base64 encoded string.
 * @param {Uint8Array | string} input - The input to encode as base64. In a browser, this can be a Uint8Array or a string; in Node.js, it can be a Buffer or string.
 * @returns {string} A base64 encoded string representation of the input.
 */
function toBase64(input) {
  if (typeof window !== "undefined") {
    // Browser environment
    let binary = '';
    const bytes = input instanceof Uint8Array ? input : new TextEncoder().encode(input);
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
  // Node.js environment
  if (input instanceof Buffer) {
    return input.toString("base64");
  }
  return Buffer.from(input).toString("base64");
}

async function broadcastCertificate(pem, owner, client) {
  if ("csr" in pem && !("cert" in pem)) {
    console.trace("The `csr` field is deprecated. Use `cert` instead.");
  }
  const certKey = "cert" in pem ? pem.cert : pem.csr;
  const encodedCsr = base64ToUInt(toBase64(certKey));
  const encodedPublicKey = base64ToUInt(toBase64(pem.publicKey));

  // Create the message directly with MsgCreateCertificate
  const message = {
    typeUrl: `/${MsgCreateCertificate.$type}`,
    value: {
      owner: owner,
      cert: encodedCsr,
      pubkey: encodedPublicKey,
    },
  };

  // Use a default fee (adjust as needed)
  const fee = {
    amount: [{ denom: "uakt", amount: "5000" }], // 0.005 AKT
    gas: "200000", // Gas limit
  };

  return await client.signAndBroadcast(owner, [message], fee);
}

async function loadOrCreateCertificate(wallet_address: string, client: SigningStargateClient) {
  const certificate = certificateManager.generatePEM(wallet_address);
  const result = await broadcastCertificate(certificate, wallet_address, client);

  if (result.code !== undefined && result.code === 0) {
    return certificate;
  }

  throw new Error(`Could not create certificate: ${result.rawLog} `);
}

export async function deploy() {
  const {client, account} = await getSigningStargateClient();
  console.log(client, account)
  const certificate = await loadOrCreateCertificate(account.address, client);
  console.log(certificate)


  const blockHeight : number = await client.getHeight();
  console.log("block Height ", blockHeight)

  const depoloymentResponse = await fetch("/api/GetDeploymentCreationDetails", {
      method: "GET",
      headers: {
        "BLOCKHEIGHT":blockHeight.toString(),
        "WALLETADDRESS":account.address
      }
  });
  console.log(depoloymentResponse)

  const { deployment, msg:deployMsg, fee:deployFee } = await depoloymentResponse.json();
  console.log(deployment, deployMsg)

  const deployResponseCode = await signTransaction(client, account.address, [deployMsg], deployFee, "create deployment")

  if(deployResponseCode != 0){
    console.error("Deployment Creation Failed Returncode: "+deployResponseCode)
  }

  const leaseResponse = await fetch("/api/GetDeploymentCreationDetails", {
    method: "GET",
    headers: {
      "DEPLOYMENT": deployment
    }
  });

  const { msg:leaseMsg, fee:leaseFee, lease:lease } = await leaseResponse.json()
  console.log(lease)

  const leaseResponseCode = await signTransaction(client, account.address, [leaseMsg], leaseFee, "create lease")

  if(leaseResponseCode != 0){
    console.error("Lease Creation Failed Returncode: "+deployResponseCode)
  }

  const sendManifestResponse = await fetch("/api/postManifest", {
    method: "POST",
    headers: {
      "CERTIFICATE": JSON.stringify(certificate),
      "LEASE": JSON.stringify(lease),
    }
  });

  return await sendManifestResponse.json()
}