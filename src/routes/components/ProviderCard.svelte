<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { getProviderData } from "$lib/get_provider";

    let {
        bid,
        escrow
    } = $props();

    let providerAddress = escrow.owner;

    let providerDataPromise = getProviderData(providerAddress);

    let cost : number = $state(Number.parseFloat(bid.price.amount));

    //convert from uakt per 6 seconds to uakt per hour
    cost *= 10 * 60 * 24;
    cost *= Math.pow(10, -6)


    let dispatch = createEventDispatcher();

    function choose_provider(){
        dispatch("ChooseProvider", { bid });
    }

    let showAttributes:boolean = $state(false);
  
    function toggleAttributes() {
        showAttributes = !showAttributes;
    }
</script>

<div class="card">
  {#await providerDataPromise then providerData}
    <div class="card-content">
      <div class="card-header">
        <h3 class="truncated-address" title={providerAddress}>
          Provider: {providerAddress.slice(0, 6)}...{providerAddress.slice(-4)}
        </h3>
        <div class="cost">Cost: {cost.toFixed(2)} AKT/day</div>
      </div>
      
      <div class="card-main">
        <div class="uri">URI: {providerData.provider.hostUri}</div>
        <button class="toggle-btn" onclick={toggleAttributes}>
          {#if showAttributes}Hide Attributes{:else}View Attributes{/if}
        </button>
      </div>
      
      {#if showAttributes}
        <div class="attributes-dropdown">
          {#each providerData.provider.attributes as attribute}
            <div class="attribute">
              <span class="key">{attribute.key}:</span>
              <span class="value">{attribute.value}</span>
            </div>
          {/each}
        </div>
      {/if}
      
      <button class="choose-btn" onclick={choose_provider}>Choose Provider</button>
    </div>
  {/await}
</div>

<style>
  .card {
    background: rgba(15, 15, 15, 0.8);
    border: 1px solid #753e3e;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 20px;
    width: 90%;
  }

  .truncated-address {
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
  }
  
  .card-header h3 {
    font-size: 16px;
    margin: 0;
    color: white;
  }
  
  .cost {
    font-size: 16px;
    color: #e62e00;
    font-weight: bold;
  }
  
  .card-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .uri {
    font-size: 14px;
    color: #aaa;
  }
  
  .toggle-btn {
    background: #e62e00;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.3s ease;
  }
  
  .toggle-btn:hover {
    background: #ff4500;
    box-shadow: 0 3px 10px rgba(230, 46, 0, 0.4);
  }
  
  .attributes-dropdown {
    background: rgba(30, 30, 30, 0.9);
    border-radius: 6px;
    padding: 10px;
    margin-bottom: 15px;
    max-height: 200px;
    overflow-y: auto;
  }
  
  .attribute {
    display: flex;
    padding: 5px 0;
    border-bottom: 1px solid #333;
  }
  
  .key {
    font-weight: bold;
    color: #888;
    min-width: 120px;
  }
  
  .value {
    color: #ccc;
    word-break: break-word;
  }
  
  .choose-btn {
    background: #e62e00;
    border: none;
    padding: 10px;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    width: 100%;
    font-weight: bold;
    transition: all 0.3s ease;
  }
  
  .choose-btn:hover {
    background: #ff4500;
    box-shadow: 0 3px 10px rgba(230, 46, 0, 0.4);
  }
</style>