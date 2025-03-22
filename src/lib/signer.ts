import { SigningStargateClient } from "@cosmjs/stargate";
import { type Window as KeplrWindow } from "@keplr-wallet/types";

const rpcEndpoint = "https://rpc.akashnet.net:443";

// Extend the Window interface to include Keplr
declare global {
  interface Window extends KeplrWindow {}
}

export async function getSigningStargateClient(chainId: string) {
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