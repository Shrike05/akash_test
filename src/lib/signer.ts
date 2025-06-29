import { type CertificatePem } from "@akashnetwork/akashjs/build/certificates/certificate-manager/CertificateManager";
import { certificateManager } from "@akashnetwork/akashjs/build/certificates/certificate-manager";
import { Registry, type AccountData, type EncodeObject } from "@cosmjs/proto-signing";
import { Message } from "@akashnetwork/akashjs/build/stargate";
import { SigningStargateClient, type SequenceResponse, type StdFee } from "@cosmjs/stargate";
import { type Window as KeplrWindow } from "@keplr-wallet/types";
import { broadcastCertificate } from "@akashnetwork/akashjs/build/certificates";
import { MsgCloseDeployment, MsgCreateDeployment } from "@akashnetwork/akash-api/v1beta3";
import { SDL } from "@akashnetwork/akashjs/build/sdl";
import { getRpc } from "@akashnetwork/akashjs/build/rpc";
import { QueryBidsRequest, QueryClientImpl as QueryMarketClient, MsgCreateLease, BidID, Bid } from "@akashnetwork/akash-api/akash/market/v1beta4";
import https from "https";
import { QueryClientImpl as QueryProviderClient, QueryProviderRequest } from "@akashnetwork/akash-api/akash/provider/v1beta3";

const rpcEndpoint = "https://rpc.akashnet.net:443";

type Lease = {
  id: {
    owner: string;
    dseq: number;
    provider: string;
    gseq: number;
    oseq: number;
  };
};

// Extend the Window interface to include Keplr
declare global {
  interface Window extends KeplrWindow { }
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
  registry.register(Message.MsgCreateLease, MsgCreateLease)
  registry.register(Message.MsgCloseDeployment, MsgCloseDeployment)
  
  // Create the SigningStargateClient
  const client: SigningStargateClient = await SigningStargateClient.connectWithSigner(
    rpcEndpoint,
    offlineSigner,
    { registry: registry }
  );

  return { client, account: accounts[0] };
}

export async function signTransaction(client: SigningStargateClient,
  wallet_address: string, messages: readonly EncodeObject[],
  fee: StdFee | "auto" | number,
  memo?: string
): Promise<number> {
  console.log("Signing -------> ", messages[0])

  const tx = await client.signAndBroadcast(wallet_address, messages, fee, memo);

  return tx.code
}

async function loadOrCreateCertificate(wallet_address: string, client: SigningStargateClient) {
  const stored_certificate = localStorage.getItem("CERT");

  if (stored_certificate !== null) {
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

export async function createDeploymentRequest(account: AccountData, blockHeight: number){
  const SdlResponse = await fetch("/api/getSdlDetails", {
    method: "GET"
  });

  const { rawSDL, manifestVersion } = await SdlResponse.json();
  const sdl = SDL.fromString(rawSDL, "beta3");
  const uint_version = new Uint8Array(32);
  let i = 0;
  for (const [key, val] of Object.entries(manifestVersion)) {
    uint_version[i] = val;
    i++;
  }
  return getDeploymentCreationDetails(account.address, blockHeight, sdl.groups(), uint_version);
}

export async function fetch_bids(blockHeight: number, accountAddress: string){
  const rpc = await getRpc(rpcEndpoint);
  const client = new QueryMarketClient(rpc);
  const request = QueryBidsRequest.fromPartial({
    filters: {
      owner: accountAddress,
      dseq: blockHeight
    }
  });

  const startTime = Date.now();
  const timeout = 1000 * 60 * 5;

  while (Date.now() - startTime < timeout) {
    console.log("Fetching bids...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    const bids = await client.Bids(request);

    if (bids.bids.length > 0 && bids.bids[0].bid !== undefined) {
      console.log("Bid fetched!");
      return bids.bids;
    }

    // wait 1 second before trying again
  }

  throw new Error(`Could not fetch bid for deployment ${blockHeight}.Timeout reached.`);
}

export async function createLease(bid: Bid){
  if (bid.bidId === undefined) {
    throw new Error("Bid ID is undefined");
  }

  const leaseId = {
    bidId: bid.bidId
  };

  const fee = {
    amount: [
      {
        denom: "uakt",
        amount: "50000"
      }
    ],
    gas: "2000000"
  };

  const msg = {
    typeUrl: `/${MsgCreateLease.$type}`,
    value: MsgCreateLease.fromPartial(leaseId)
  };

  const lease = {
    id: BidID.toJSON(bid.bidId) as {
      owner: string;
      dseq: number;
      provider: string;
      gseq: number;
      oseq: number;
    }
  };

  return { msg, fee, lease }
}

export async function sendManifest(blockHeight: number, client: SigningStargateClient, accountAddress:string, lease: any){
  const certificate = await loadOrCreateCertificate(accountAddress, client);

  const sendManifestResponse = await fetch("/api/postManifest", {
    method: "POST",
    headers: {
      "CERTIFICATE": JSON.stringify(certificate),
      "LEASE": JSON.stringify(lease),
    }
  });

  const mainfest_response = await sendManifestResponse.json();

  localStorage.setItem(blockHeight.toString(), JSON.stringify(mainfest_response))
  
  return mainfest_response;
}

function getDeploymentCreationDetails(walletAddress: string, blockHeight: number, groups: any[], manifestVersion: Uint8Array) {
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

  return { "msg": msg, "fee": fee }
}


// export async function deploy(client: SigningStargateClient, account: AccountData) {
//   const certificate = await loadOrCreateCertificate(account.address, client);
//   const blockHeight: number = await client.getHeight();

//   const SdlResponse = await fetch("/api/getSdlDetails", {
//     method: "GET"
//   });
  

//   const { rawSDL, manifestVersion } = await SdlResponse.json();
//   const sdl = SDL.fromString(rawSDL, "beta3");
//   const uint_version = new Uint8Array(32);
//   let i = 0;
//   for (const [key, val] of Object.entries(manifestVersion)) {
//     uint_version[i] = val;
//     i++;
//   }
//   const { msg: deployMsg, fee: deployFee } = getDeploymentCreationDetails(account.address, blockHeight, sdl.groups(), uint_version);

//   const deployResponseCode = await signTransaction(client, account.address, [deployMsg], deployFee, "create deployment")

//   if (deployResponseCode != 0) {
//     console.error("Deployment Creation Failed Returncode: " + deployResponseCode)
//   }

//   const { msg: leaseMsg, fee: leaseFee, lease: lease } = await getLeaseCreationDetails(blockHeight, account.address);
//   const leaseResponseCode = await signTransaction(client, account.address, [leaseMsg], leaseFee, "create lease")

//   if (leaseResponseCode != 0) {
//     console.error("Lease Creation Failed Returncode: " + leaseResponseCode)
//   }

//   const sendManifestResponse = await fetch("/api/postManifest", {
//     method: "POST",
//     headers: {
//       "CERTIFICATE": JSON.stringify(certificate),
//       "LEASE": JSON.stringify(lease),
//     }
//   });

//   const mainfest_response = await sendManifestResponse.json();

//   localStorage.setItem(blockHeight.toString(), JSON.stringify(mainfest_response))
  
//   return mainfest_response;
// }

// export async function fetchBid(dseq: number, owner: string) {
//   const rpc = await getRpc(rpcEndpoint);
//   const client = new QueryMarketClient(rpc);
//   const request = QueryBidsRequest.fromPartial({
//     filters: {
//       owner: owner,
//       dseq: dseq
//     }
//   });

//   const startTime = Date.now();
//   const timeout = 1000 * 60 * 5;

//   while (Date.now() - startTime < timeout) {
//     console.log("Fetching bids...");
//     await new Promise(resolve => setTimeout(resolve, 5000));
//     const bids = await client.Bids(request);

//     if (bids.bids.length > 0 && bids.bids[0].bid !== undefined) {
//       console.log("Bid fetched!");
//       return bids.bids[0].bid;
//     }

//     // wait 1 second before trying again
//   }

//   throw new Error(`Could not fetch bid for deployment ${dseq}.Timeout reached.`);
// }

// export async function getLeaseCreationDetails(dseq: number, owner: string) {
//   const bid = await fetchBid(dseq, owner);

//   if (bid.bidId === undefined) {
//     throw new Error("Bid ID is undefined");
//   }

//   const leaseId = {
//     bidId: bid.bidId
//   };

//   const fee = {
//     amount: [
//       {
//         denom: "uakt",
//         amount: "50000"
//       }
//     ],
//     gas: "2000000"
//   };

//   const msg = {
//     typeUrl: `/${MsgCreateLease.$type}`,
//     value: MsgCreateLease.fromPartial(leaseId)
//   };

//   const lease = {
//     id: BidID.toJSON(bid.bidId) as {
//       owner: string;
//       dseq: number;
//       provider: string;
//       gseq: number;
//       oseq: number;
//     }
//   };

//   return { msg, fee, lease }
// }