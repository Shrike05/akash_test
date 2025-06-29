<script lang="ts">
    import ProviderCard from "./ProviderCard.svelte";
    import { getSigningStargateClient, createDeploymentRequest, fetch_bids, createLease, sendManifest, signTransaction } from "$lib/signer";
    import type { QueryBidResponse } from "@akashnetwork/akash-api/akash/market/v1beta4";
    import type { SigningStargateClient } from "@cosmjs/stargate"; 
    import type { AccountData } from "@cosmjs/proto-signing";

    let deploying : boolean = $state(false);

    let bids : QueryBidResponse[] = $state([]);
    let client: SigningStargateClient, account: AccountData, blockheight: number

    async function chosenProvider(event : any){
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
    }
</script>

<main class="container">
  <div class="content">
    <div class="top-section">
      <div class="header-row">
        <h1>Create New Deployment</h1>
        <button class="deploy-btn" onclick={create_deployment}>Deploy</button>
      </div>
      
      <div class="status-row">
        {#if deploying && bids.length === 0}
          <div class="status-message">
            <div class="loading-spinner"></div>
            <h3>Waiting for providers...</h3>
          </div>
        {:else if !deploying && bids.length === 0}
          <div class="status-message">
            <h3>Press "Deploy" to discover available providers</h3>
          </div>
        {/if}
      </div>
    </div>
    
    <div class="providers-grid">
      {#each bids as bid}
        <ProviderCard bid={bid.bid} escrow={bid.escrowAccount} on:ChooseProvider={chosenProvider} />
      {/each}
    </div>
  </div>
</main>

<style>
  .container {
    background: #0d0d0d;
    color: white;
    min-height: 100vh;
    padding: 20px;
  }
  
  .content {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .top-section {
    background: rgba(20, 20, 20, 0.9);
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 30px;
    border: 1px solid #333;
  }
  
  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .header-row h1 {
    font-size: 36px;
    margin: 0;
    color: #fff;
  }
  
  .deploy-btn {
    background: #e62e00;
    border: none;
    padding: 12px 25px;
    border-radius: 6px;
    color: white;
    font-weight: bold;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
  }
  
  .deploy-btn:hover {
    background: #ff4500;
    box-shadow: 0 3px 15px rgba(230, 46, 0, 0.5);
    transform: translateY(-2px);
  }
  
  .status-row {
    text-align: center;
    padding: 20px 0;
  }
  
  .status-message {
    display: inline-flex;
    align-items: center;
    gap: 15px;
    background: rgba(30, 30, 30, 0.7);
    padding: 15px 30px;
    border-radius: 8px;
    border-left: 3px solid #e62e00;
  }
  
  .status-message h3 {
    margin: 0;
    font-size: 18px;
    color: #aaa;
    font-weight: normal;
  }
  
  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid rgba(230, 46, 0, 0.3);
    border-radius: 50%;
    border-top-color: #e62e00;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .providers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 25px;
    width: 100%;
  }
</style>