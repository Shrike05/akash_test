<script>
    import ProviderCard from "./ProviderCard.svelte";


</script>

<main class="container">
    <div class="top_bar">
        <h1>Providers</h1>
        <button class="deploy-btn">Deploy</button>
    </div>
    <div class="providers">
        <ProviderCard name="Provider1" cost=10 />
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