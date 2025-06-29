<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { getProviderData } from "$lib/get_provider";

    let {
        bid,
        escrow
    } = $props();

    let providerAddress = escrow.owner;

    let providerDataPromise = getProviderData(providerAddress);

    // let providerData = await getProviderData(providerAddress);
    // console.log("---------------------------------------------------")
    // console.log(providerAddress)
    // console.log(providerData)
    // console.log("---------------------------------------------------")

    // let providerURI = providerData

    let cost : number = $state(Number.parseFloat(bid.price.amount));

    //convert from uakt per 6 seconds to uakt per hour
    cost *= 10 * 60;


    let dispatch = createEventDispatcher();

    function choose_provider(){
        dispatch("ChooseProvider", { bid });
    }
</script>

<div class="card">
    <div class="details">
        {#await providerDataPromise then providerData}
            <h3>Address: {providerAddress}</h3>

            <h3>{console.log(providerData)}</h3>
            <h3>URI: {providerData.provider.hostUri}</h3>
            {#each providerData.provider.attributes as attribute}
                <h3>{attribute.key}: {attribute.value}</h3>
            {/each}
            
            <h3>Cost: {cost.toFixed(2)} uAKT / min </h3>
        {/await}
    </div>
    <button onclick= {choose_provider}>Choose</button>
</div>

<style>
    .card{
        background: rgba(15, 15, 15, 0.8);
        border: 1px solid #753e3e;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 20px;
        width: 90%;
    }
    .details {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      flex-direction: row;
      justify-content: space-between;
    }
</style>