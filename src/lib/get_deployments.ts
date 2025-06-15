import { QueryDeploymentsResponse, QueryDeploymentsRequest, QueryClientImpl } from "@akashnetwork/akash-api/akash/deployment/v1beta3";
import { getRpc } from "@akashnetwork/akashjs/build/rpc";

export async function getDeploymentData(wallet_address: string) {
  const request = QueryDeploymentsRequest.fromJSON({
    filters: {
      owner: wallet_address,
      "state": "active"
    }
  });

  const client = new QueryClientImpl(await getRpc("http://rpc.akashnet.net"));
  const response = await client.Deployments(request);
  const data = QueryDeploymentsResponse.toJSON(response);

  const deployments = [];

  for (var i: number = 0; i < data.deployments.length; i++) {
    deployments.push(getDeploymentDetails(data.deployments[i]))
  }
  return deployments;
}

export function getDeploymentDetails(deployment_data) {
  console.log(deployment_data)
  const dseq: number = deployment_data.groups[0].groupId.dseq;
  const resources = deployment_data.groups[0].groupSpec.resources[0].resource;
  const cpu: number = parseInt(atob(resources.cpu.units.val));
  const gpu: number = parseInt(atob(resources.gpu.units.val));
  const memory: number = parseInt(atob(resources.memory.quantity.val));
  const storage: number = parseInt(atob(resources.storage[0].quantity.val));
  const balance: number = parseInt(deployment_data.escrowAccount.balance.amount);
  const price: number = parseInt(deployment_data.groups[0].groupSpec.resources[0].price.amount);

  return {
    dseq,
    cpu,
    gpu,
    memory,
    storage,
    balance,
    price
  };
}