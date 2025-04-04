import { certificateManager } from "@akashnetwork/akashjs/build/certificates/certificate-manager";
import { Registry, type EncodeObject } from "@cosmjs/proto-signing";
import { getAkashTypeRegistry } from "@akashnetwork/akashjs/build/stargate";
import { SigningStargateClient, type StdFee } from "@cosmjs/stargate";
import { type Window as KeplrWindow } from "@keplr-wallet/types";
import { broadcastCertificate } from "@akashnetwork/akashjs/build/certificates";

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

  const akashRegistry = getAkashTypeRegistry();
  console.log("Registry", akashRegistry)

  // Create the SigningStargateClient
  const client = await SigningStargateClient.connectWithSigner(
    rpcEndpoint,
    offlineSigner,
    { registry: new Registry(akashRegistry)}
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

  const depoloymentResponse = await fetch("/api/getDeploymentCreationDetails", {
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