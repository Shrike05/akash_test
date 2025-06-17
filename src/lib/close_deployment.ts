import { MsgCloseDeployment } from "@akashnetwork/akash-api/v1beta3";
import { getTypeUrl } from "@akashnetwork/akashjs/build/stargate";
import type { SigningStargateClient } from "@cosmjs/stargate";

const rpc_endpoint = "http://rpc.akashnet.net"

export async function close_deployment(account: string, client: SigningStargateClient, dseq: number) {
    const message = MsgCloseDeployment.fromPartial({
        id: {
            dseq: dseq,
            owner: account
        }
    });

    const msg = {
        typeUrl: getTypeUrl(MsgCloseDeployment),
        value: message
    }

    const fee = {
        amount: [
            {
                denom: "uakt",
                amount: "20000"
            }
        ],
        gas: "800000"
    };

    await client.signAndBroadcast(account, [msg], fee, "close deployment")
}