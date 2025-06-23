<script>
    let {
        name,
        cost
    } = $props();
</script>

<div class="card">
    <div class="details">
        <h3>Name: {name}</h3>
        <h3>Cost: {cost} AKT </h3>
    </div>
    <button>Choose</button>
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