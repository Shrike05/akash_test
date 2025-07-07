<script lang="ts">
    import ProviderCard from "./ProviderCard.svelte";
    import { getSigningStargateClient, createDeploymentRequest, fetch_bids, createLease, sendManifest, signTransaction } from "$lib/signer";
    import type { QueryBidResponse } from "@akashnetwork/akash-api/akash/market/v1beta4";
    import type { SigningStargateClient } from "@cosmjs/stargate"; 
    import type { AccountData } from "@cosmjs/proto-signing";

    let deploying : boolean = $state(false);

    let bids : QueryBidResponse[] = $state([]);
    let client: SigningStargateClient, account: AccountData, blockheight: number
    let rawsdl: string = "";

    // Add new state variables for resources
    let cpu: number = $state(1); // CPU cores (default: 1)
    let memory: number = $state(4); // Memory in GB (default: 4GB)
    let disk: number = $state(100); // Disk space in GB (default: 100GB)
    let gpuEnabled: boolean = $state(false); // GPU toggle state
    let selectedGpu: string = $state('nvidia-h100'); // Default GPU selection
    
    // Available GPU options (hardcoded for example)
    const gpuOptions = [
        { id: 'nvidia-gtx960', name: 'NVIDIA GTX960' },
        { id: 'nvidia-a100', name: 'NVIDIA A100' },
        { id: 'nvidia-h100', name: 'NVIDIA H100' },
        { id: 'nvidia-h200', name: 'NVIDIA H200' }
    ];

    async function chosenProvider(event : any){
        let provider = event.detail.bid;

        let { msg, fee, lease} = await createLease(provider);

        await signTransaction(client, account.address, [msg], fee, "create lease");

        await sendManifest(blockheight, client, account.address, lease, rawsdl);

        bids = [];
        deploying = false;
    }

    async function create_deployment(){
        deploying = true

        let result = await getSigningStargateClient();
        client = result.client;
        account = result.account;
        blockheight = await client.getHeight();

        let { msg, fee, rawSDL } = await createDeploymentRequest(account, blockheight, cpu, memory, disk);
        rawsdl = rawSDL;

        await signTransaction(client, account.address, [msg], fee, "create deployment")

        bids = await fetch_bids(blockheight, account.address);
    }

    function formatResource(value: number, unit: string): string {
        return `${value} ${unit}`;
    }
</script>

<main class="container">
  <div class="content">
    <div class="top-section">
      <!-- Header with title and deploy button on same line -->
      <div class="header-row">
        <h1>Create New Deployment</h1>
        <button class="deploy-btn" onclick={create_deployment}>Deploy</button>
      </div>
        <!-- Resource Configuration Section -->
      <div class="resource-config">
        <h2>Resource Allocation</h2>
        
        <div class="resource-slider">
          <label for="cpu-slider">CPU Cores: {formatResource(cpu, 'cores')}</label>
          <input 
            type="range" 
            id="cpu-slider"
            min="0.1" 
            max="384" 
            step="0.1"
            bind:value={cpu}
          />
        </div>
        
        <div class="resource-slider">
          <label for="memory-slider">Memory: {formatResource(memory, 'GB')}</label>
          <input 
            type="range" 
            id="memory-slider"
            min="4" 
            max="64" 
            step="1"
            bind:value={memory}
          />
        </div>
        
        <div class="resource-slider">
          <label for="disk-slider">Disk Space: {formatResource(disk, 'GB')}</label>
          <input 
            type="range" 
            id="disk-slider"
            min="1" 
            max="400" 
            step="1"
            bind:value={disk}
          />
        </div>
        
        <div class="gpu-toggle">
          <label>
            <input 
              type="checkbox" 
              bind:checked={gpuEnabled}
            />
            Enable GPU Acceleration
          </label>
          
          {#if gpuEnabled}
            <div class="gpu-selector">
              <label for="gpu-select">Select GPU:</label>
              <select id="gpu-select" bind:value={selectedGpu}>
                {#each gpuOptions as gpu}
                  <option value={gpu.id}>{gpu.name}</option>
                {/each}
              </select>
            </div>
          {/if}
        </div>
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

  .resource-config {
    background: rgba(30, 30, 30, 0.7);
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 25px;
    border: 1px solid #333;
  }

  .resource-config h2 {
    margin-top: 0;
    color: #ddd;
    border-bottom: 1px solid #444;
    padding-bottom: 10px;
  }

  .resource-slider {
    margin-bottom: 20px;
  }

  .resource-slider label {
    display: block;
    margin-bottom: 8px;
    color: #bbb;
  }

  .resource-slider input {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #222;
    outline: none;
    -webkit-appearance: none;
  }

  .resource-slider input::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #e62e00;
    cursor: pointer;
  }

  .gpu-toggle {
    padding: 10px 0;
    border-top: 1px solid #333;
    margin-top: 10px;
  }

  .gpu-toggle label {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #bbb;
    cursor: pointer;
  }

  .gpu-selector {
    margin-top: 15px;
    padding-left: 25px;
  }

  .gpu-selector select {
    background: #222;
    color: white;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 8px 12px;
    margin-left: 10px;
    width: 250px;
  }

  .deploy-row {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
</style>