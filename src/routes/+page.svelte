<script lang="ts">
  import { get_deployment_data } from '$lib/get_deployments.js'
  const links : string[] = $state([]);
  const deployments : any[] = $state([]);
  var mnemonic = $state("");

  const deploy = async (mnemonic: string) => {
    console.log(mnemonic)
    const response = await fetch("/api/create_deployment", {
        method: "GET",
        headers: {
            "MNEMONIC": mnemonic
        }
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Deployment results: ",result);
      links.push(result.link);
    } else {
      console.error('Failed to create deployment');
    }
  }

  const get_deployments = async () => {
    const new_deployments = await get_deployment_data("akash1ljev9q5zx8p4knvcdst4aq7cht0dxx3av0479k");
    console.log(new_deployments)
  }
</script>

<h1>Welcome to SvelteKit</h1>
<p>Input your mnemonic</p>
<input bind:value={mnemonic}/>

<button onclick={() => deploy(mnemonic)}>Deploy</button>
<p>Note: You can't see your deployment anywhere here -nor do you get any confirmation, cry about it- all you get is a console log<br>refer to akash console to manage the deployment</p>

<button onclick={get_deployments}> Get Deployments</button>

{#each links as link}
  <p>{link}</p>
{/each}

<style>
  p {
    color: white;
  }
  h1 {
    color: hsl(356.8, 100%, 62.9%);
  }
</style>
