import { certificateManager } from "@akashnetwork/akashjs/build/certificates/certificate-manager";
import { Registry, type EncodeObject } from "@cosmjs/proto-signing";
import { Message } from "@akashnetwork/akashjs/build/stargate";
import { SigningStargateClient, type SequenceResponse, type StdFee } from "@cosmjs/stargate";
import { type Window as KeplrWindow } from "@keplr-wallet/types";
import { broadcastCertificate } from "@akashnetwork/akashjs/build/certificates";
import { MsgCreateDeployment } from "@akashnetwork/akash-api/v1beta3";
import { SDL } from "@akashnetwork/akashjs/build/sdl";

const rpcEndpoint = "https://rpc.akashnet.net:443";
const rawSDL = `---
version: "2.0"
services:
  proxy:
    image: butcherbirdshrike/akash_notebook:0.3.1
    expose:
      - port: 8888
        as: 8888
        to:
          - global: true
profiles:
  compute:
    proxy:
      resources:
        cpu:
          units: 1
        memory:
          size: 5gb
        storage:
          - size: 5gb
  placement:
    dcloud:
      pricing:
        proxy:
          denom: uakt
          amount: 10000
deployment:
  proxy:
    dcloud:
      profile: proxy
      count: 1
`;

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

  const registry = new Registry()
  registry.register(Message.MsgCreateDeployment, MsgCreateDeployment)

  // Create the SigningStargateClient
  const client : SigningStargateClient = await SigningStargateClient.connectWithSigner(
    rpcEndpoint,
    offlineSigner,
    { registry: registry}
  );

  return { client, account: accounts[0] };
}

export async function signTransaction(client:SigningStargateClient, 
  wallet_address:string , messages: readonly EncodeObject[], 
  fee: StdFee | "auto" | number, 
  memo?: string
):Promise<number>
{
  console.log("Signing -------> ", messages[0])

  const tx = await client.signAndBroadcast(wallet_address, messages, fee, memo);

  return tx.code
}

async function loadOrCreateCertificate(wallet_address: string, client: SigningStargateClient) {
  const stored_certificate = localStorage.getItem("CERT");
  
  if(stored_certificate !== null){
    console.log("Loaded From Storage:")
    console.log(stored_certificate)
    return JSON.parse(stored_certificate)
  }

  const certificate = certificateManager.generatePEM(wallet_address);
  const result = await broadcastCertificate(certificate, wallet_address, client);

  if (result.code !== undefined && result.code === 0) {
    localStorage.setItem("CERT", JSON.stringify(certificate))
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

  const sdl = SDL.fromString(rawSDL, "beta3");
  const version = await sdl.manifestVersion();
  const {msg:deployMsg, fee:deployFee} = getDeploymentCreationDetails(account.address, blockHeight, sdl.groups(), version);

  const deployResponseCode = await signTransaction(client, account.address, [deployMsg], deployFee, "create deployment")

  if(deployResponseCode != 0){
    console.error("Deployment Creation Failed Returncode: "+deployResponseCode)
  }

  const leaseResponse = await fetch("/api/GetLeaseCreationDetails", {
    method: "GET",
    headers: {
      "DEPLOYMENT": JSON.stringify(deployMsg)
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

export function getDeploymentCreationDetails(walletAddress: string, blockHeight: number, groups: any[], manifestVersion : Uint8Array) {
  const deployment = {
    id: {
      owner: walletAddress,
      dseq: blockHeight
    },
    groups: groups,
    deposit: {
      denom: "uakt",
      amount: "5000000"
    },
    version: manifestVersion,
    depositor: walletAddress
  };

  const fee = {
    amount: [
      {
        denom: "uakt",
        amount: "20000"
      }
    ],
    gas: "800000"
  };

  const msg = {
    typeUrl: "/akash.deployment.v1beta3.MsgCreateDeployment",
    value: MsgCreateDeployment.fromPartial(deployment)
  };

  return {"msg":msg, "fee":fee}
}