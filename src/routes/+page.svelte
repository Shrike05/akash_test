<script lang="ts">
  const links : string[] = [];
  const mnemonic = $state("");
</script>

<h1>Welcome to SvelteKit</h1>
<p>Input your mnemonic</p>
<input value={mnemonic}/>
<button onclick={async ()=>{
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
}}>Deploy</button>
<p>Note: You can't see your deployment anywhere here -nor do you get any confirmation, cry about it- all you get is a console log<br>refer to akash console to manage the deployment</p>
{#each links as link}
  <p>{link}</p>
{/each}