<script lang="ts">
    import ProviderCard from "./ProviderCard.svelte";
    import { getSigningStargateClient, createDeploymentRequest, fetch_bids, createLease, sendManifest, signTransaction } from "$lib/signer";
    import type { QueryBidResponse } from "@akashnetwork/akash-api/akash/market/v1beta4";
    import type { SigningStargateClient } from "@cosmjs/stargate"; 
    import type { AccountData } from "@cosmjs/proto-signing";

    let deploying = false;

    let bids : QueryBidResponse[] = $state([]);
    let client: SigningStargateClient, account: AccountData, blockheight: number

    async function chosenProvider(event){
        let provider = event.detail.bid;

        let { msg, fee, lease} = await createLease(provider);

        await signTransaction(client, account.address, [msg], fee, "create lease");

        await sendManifest(blockheight, client, account.address, lease);

        bids = [];
        deploying = false;
    }

    async function create_deployment(){
        deploying = true

        let result = await getSigningStargateClient();
        client = result.client;
        account = result.account;
        blockheight = await client.getHeight();

        let { msg, fee } = await createDeploymentRequest(account, blockheight);

        await signTransaction(client, account.address, [msg], fee, "create deployment")

        bids = await fetch_bids(blockheight, account.address);
        console.log(bids)
    }
</script>

<main class="container">
    <button class="deploy-btn" onclick={create_deployment}>Deploy</button>
    <div class="top_bar">
        <h1>Providers</h1>
        <!-- <button class="deploy-btn">Choose Provider</button> -->
    </div>
    <div class="providers">
        {#each bids as bid}
            <ProviderCard bid={bid.bid} escrow={bid.escrowAccount} on:ChooseProvider={chosenProvider} />
        {/each}
        {#if bids.length == 0}
            {#if deploying}
                <h1>waiting for providers...</h1>
            {:else}
                <h1>Press deploy to start</h1>
            {/if}
        {/if}
    </div>
</main>

<style>
    .top_bar{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }
    .deploy-btn {
    background: #e62e00;
    border: none;
    padding: 8px 16px;
    border-radius: 15px;
    color: white;
    font-weight: bold;
    font-size: 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 20%;
    text-align: center;
  }
  .providers {
    flex: 1;
    padding: 20px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>