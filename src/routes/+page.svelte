<script>
  import Header from './components/Header.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import Dashboard from './components/Dashboard.svelte';
  import Projects from './components/Projects.svelte';
  import Datasets from './components/Datasets.svelte';
  import Events from './components/Events.svelte';
    import NewDeployment from './components/NewDeployment.svelte';

  let activePage = "Dashboard"; // Default to Dashboard

  const pageComponents = {
    "Dashboard": Dashboard,
    "Projects": Projects,
    "Datasets": Datasets,
    "Events": Events,
    "NewDeployment": NewDeployment
  };

  function handlePageChange(event) {
    const newPage = event.detail.page;
    if (pageComponents[newPage]) {
      activePage = newPage;
    }
  }
</script>

<main class="container">
  <Header />
  <div class="content">
    <Sidebar on:pageChange={handlePageChange} />
    <section class="main-content">
      {#if pageComponents[activePage]}
        <svelte:component this={pageComponents[activePage]} />
      {:else}
        <p>Page not found or under construction.</p>
      {/if}
    </section>
  </div>
</main>

<style>
  /* Reset default margins and set background */
  body {
    margin: 0;
    padding: 0;
    background: #0d0d0d;
  }

  .container {
    display: flex;
    flex-direction: column;
    background: #0d0d0d;
    color: white;
    min-height: 100vh; /* Allow container to grow beyond viewport */
    width: 100vw;
  }
  .content {
    display: flex;
    flex: 1;
    width: 100%;
    padding-top: 60px; /* Use padding instead of margin to avoid height issues */
  }
  .main-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    margin-top: 40px;
    margin-left: 230px; /* Match sidebar width */
    width: calc(100% - 190px); /* Consistent with margin-left */
    min-height: calc(100vh - 60px); /* Ensure full height minus header */
    box-sizing: border-box; /* Include padding in height/width calculations */
  }
</style>
