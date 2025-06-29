import { QueryClientImpl, QueryProviderRequest, QueryProviderResponse } from "@akashnetwork/akash-api/akash/provider/v1beta3";
import { getRpc } from "@akashnetwork/akashjs/build/rpc";

export async function getProviderData(provider_address: string) {
  const client = new QueryClientImpl(await getRpc("http://rpc.akashnet.net"));

  const getProviderInfoRequest = QueryProviderRequest.fromPartial({
    owner: provider_address
  });
  const providerResponse = await client.Provider(getProviderInfoRequest);
  const data = QueryProviderResponse.toJSON(providerResponse);

  return data;
}
