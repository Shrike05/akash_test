import https from "https";
import { MsgCreateDeployment } from "@akashnetwork/akash-api/akash/deployment/v1beta3";
import { QueryClientImpl as QueryProviderClient, QueryProviderRequest } from "@akashnetwork/akash-api/akash/provider/v1beta3";
import { QueryBidsRequest, QueryClientImpl as QueryMarketClient, MsgCreateLease, BidID } from "@akashnetwork/akash-api/akash/market/v1beta4";
import { getRpc } from "@akashnetwork/akashjs/build/rpc";
import { SDL } from "@akashnetwork/akashjs/build/sdl";
import { type CertificatePem } from "@akashnetwork/akashjs/build/certificates/certificate-manager/CertificateManager";


// In case you want to test on a sandbox environment, uncomment the following line and comment the following line
// const rpcEndpoint = "https://rpc.sandbox-01.aksh.pw";

// Update this with your RPC endpoint
const rpcEndpoint = "https://rpc.akashnet.net:443";

// Update this with your SDL file
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

type Deployment = {
  id: {
    owner: string;
    dseq: number;
  };
};

type Lease = {
  id: {
    owner: string;
    dseq: number;
    provider: string;
    gseq: number;
    oseq: number;
  };
};

export async function loadSDL() {
  const sdl = SDL.fromString(rawSDL, "beta3");
  const ver = await sdl.manifestVersion();
  return { rawSDL:rawSDL, manifestVersion:ver }
}

export async function fetchBid(dseq: number, owner: string) {
  const rpc = await getRpc(rpcEndpoint);
  const client = new QueryMarketClient(rpc);
  const request = QueryBidsRequest.fromPartial({
    filters: {
      owner: owner,
      dseq: dseq
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
      return bids.bids[0].bid;
    }

    // wait 1 second before trying again
  }

  throw new Error(`Could not fetch bid for deployment ${dseq}.Timeout reached.`);
}

export async function getLeaseCreationDetails(deployment: Deployment){
  const {
    id: { dseq, owner }
  } = deployment;
  const bid = await fetchBid(dseq, owner);

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

async function queryLeaseStatus(lease: Lease, providerUri: string, certificate: CertificatePem) {
  const id = lease.id;

  if (id === undefined) {
    throw new Error("Lease ID is undefined");
  }

  const leasePath = `/lease/${id.dseq}/${id.gseq}/${id.oseq}/status`;

  const agent = new https.Agent({
    cert: certificate.cert,
    key: certificate.privateKey,
    rejectUnauthorized: false
  });

  const uri = new URL(providerUri);

  return new Promise<{ services: Record<string, { uris: string[] }> }>((resolve, reject) => {
    const req = https.request(
      {
        hostname: uri.hostname,
        port: uri.port,
        path: leasePath,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        agent: agent
      },
      res => {
        if (res.statusCode !== 200) {
          return reject(`Could not query lease status: ${res.statusCode}`);
        }

        let data = "";

        res.on("data", chunk => (data += chunk));
        res.on("end", () => resolve(JSON.parse(data)));
      }
    );

    req.on("error", reject);
    req.end();
  });
}

export async function sendManifest(
  sdl: SDL, 
  lease: Lease, 
  certificate: { cert: string; privateKey: string; publicKey: string }){
  if (lease.id === undefined) {
    throw new Error("Lease ID is undefined");
  }

  const { dseq, provider } = lease.id;
  const rpc = await getRpc(rpcEndpoint);
  const client = new QueryProviderClient(rpc);
  const request = QueryProviderRequest.fromPartial({
    owner: provider
  });

  const tx = await client.Provider(request);

  if (tx.provider === undefined) {
    throw new Error(`Could not find provider ${provider}`);
  }

  const providerInfo = tx.provider;
  const manifest = sdl.manifestSortedJSON();
  const path = `/deployment/${dseq}/manifest`;

  const uri = new URL(providerInfo.hostUri);
  const agent = new https.Agent({
    cert: certificate.cert,
    key: certificate.privateKey,
    rejectUnauthorized: false
  });

  await new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: uri.hostname,
        port: uri.port,
        path: path,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Content-Length": manifest.length
        },
        agent: agent
      },
      res => {
        res.on("error", reject);

        res.on("data", chunk => {
          console.log("Response:", chunk.toString());
        });

        if (res.statusCode !== 200) {
          return reject(`Could not send manifest: ${res.statusCode}`);
        }

        resolve("ok");
      }
    );

    req.on("error", reject);
    req.write(manifest);
    req.end();
  });

  const startTime = Date.now();
  const timeout = 1000 * 60 * 10;

  while (Date.now() - startTime < timeout) {
    console.log("Waiting for deployment to start...");
    const status = await queryLeaseStatus(lease, providerInfo.hostUri, certificate).catch(err => {
      if (err.includes("Could not query lease status: 404")) {
        return undefined;
      }

      throw err;
    });
    console.log(status);

    const proxy = status.forwarded_ports.proxy[0];
    if (status && (proxy !== null || proxy !== undefined)) {
      console.log(`available at: ${proxy.host}:${proxy.externalPort}`);
      return {
        "host":proxy.host,
        "external_port":proxy.externalPort,
        "link":`${proxy.host}:${proxy.externalPort}`
      };
    }

    // wait 1 second before trying again
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  throw new Error(`Could not start deployment. Timeout reached.`);
}