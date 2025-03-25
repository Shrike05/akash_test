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

  const deployments  = [];

  for(var i : number = 0; i < data.deployments.length; i++){
    deployments.push(get_deployment_details(data.deployments[i]))
  }
  return deployments;
}

function get_deployment_details(deployment_data) {
  const dseq: number = deployment_data.groups[0].groupId.dseq;
  const resources = deployment_data.groups[0].groupSpec.resources[0].resource;
  const cpu: number = parseInt(atob(resources.cpu.units.val));
  const gpu: number = parseInt(atob(resources.gpu.units.val));
  const memory: number = parseInt(atob(resources.memory.quantity.val));
  const storage: number = parseInt(atob(resources.storage[0].quantity.val));

  return {
    dseq,
    cpu,
    gpu,
    memory,
    storage
  };
}