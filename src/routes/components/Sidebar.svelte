<script>
    import { deploy } from '$lib/signer';
  import { createEventDispatcher } from 'svelte';

  let activePage = "Dashboard"; // Default to Dashboard
  let isDropdownOpen = false; // Track dropdown state

  const dispatch = createEventDispatcher();

  function setActivePage(page) {
    activePage = page;
    dispatch('pageChange', { page });
  }

  function toggleDropdown() {
    isDropdownOpen = !isDropdownOpen;
  }

  async function handleCreateOption(option) {
    console.log(`Selected: ${option}`); // Placeholder for handling the option
    isDropdownOpen = false; // Close dropdown after selection
    // Add logic for "New Project" or "New Dataset" here
    if (option === "New Project") {
      const response = await deploy();
      console.log(response)
    } else if (option === "New Dataset") {
      // Logic for creating a new dataset
    }
  }
</script>

<aside class="sidebar">
  <div class="logo">
    <div class="hexagon"></div>
    <span>Akash Notebooks</span>
  </div>
  <div class="nav-menu">
    <div class="create-container">
      <button class="create-btn" on:click={toggleDropdown}>
        + CREATE
      </button>
      {#if isDropdownOpen}
        <div class="dropdown-content">
          <button class="dropdown-item" on:click={() => handleCreateOption("New Project")}>
            New Project
          </button>
          <button class="dropdown-item" on:click={() => handleCreateOption("New Dataset")}>
            New Dataset
          </button>
        </div>
      {/if}
    </div>
    <ul class="nav-items">
      <li class:active={activePage === "Dashboard"} on:click={() => setActivePage("Dashboard")}>Dashboard</li>
      <li class:active={activePage === "Projects"} on:click={() => setActivePage("Projects")}>Projects</li>
      <li class:active={activePage === "Datasets"} on:click={() => setActivePage("Datasets")}>Datasets</li>
      <li class:active={activePage === "Events"} on:click={() => setActivePage("Events")}>Events</li>
      <li class:active={activePage === "Learning"} on:click={() => setActivePage("Learning")}>Learning</li>
      <li class:active={activePage === "About Us"} on:click={() => setActivePage("About_Us")}>About Us</li>
      <li class:active={activePage === "Akash Network"} on:click={() => setActivePage("Akash_Network")}>Akash Network</li>
    </ul>
  </div>
</aside>

<style>
  .sidebar {
    width: 190px;
    background: #141414;
    padding: 20px;
    border-right: 3px solid #e62e00;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    z-index: 100; /* Ensure sidebar is above other content */
    overflow-y: auto; /* Allow scrolling if content overflows */
  }
  .logo {
    display: flex;
    align-items: center;
    font-weight: bold;
    color: white;
    margin-bottom: 40px; /* Increased gap between logo and create button */
  }
  .logo span {
    font-family: 'sans-serif';
    font-size: 20px;
    font-weight: bold;
    color: #ffffff;
    text-transform: uppercase;
    transition: all 0.3s ease;
  }
  .hexagon {
    width: 20px;
    height: 20px;
    background: #e62e00;
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    margin-right: 10px;
  }
  .nav-menu {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .create-container {
    position: relative;
    margin-bottom: 5px; /* Reduced gap between create button and nav-items */
  }
  .create-btn {
    background: #e62e00;
    border: none;
    padding: 8px 16px;
    border-radius: 15px;
    color: white;
    font-weight: bold;
    font-size: 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    text-align: center;
  }
  .create-btn:hover {
    background: #ffffff;
    color: red;
    box-shadow: 0 5px 15px rgba(230, 46, 0, 0.4);
  }
  .dropdown-content {
    position: absolute;
    top: 100%;
    left: 0;
    background: #141414;
    border: 1px solid #e62e00;
    border-radius: 6px;
    width: 100%;
    z-index: 101;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
  .dropdown-item {
    background: none;
    border: none;
    padding: 10px 16px;
    color: #aaaaaa;
    text-align: left;
    width: 100%;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 16px;
  }
  .dropdown-item:hover {
    background: rgba(230, 46, 0, 0.1);
    color: #ffffff;
  }
  .nav-items {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .nav-items li {
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 5px;
    color: #aaaaaa;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 24px;
  }
  .nav-items li:hover:not(.active) {
    background: rgba(230, 46, 0, 0.05);
    color: #ffffff;
    transform: translateX(5px);
  }
  .nav-items li.active {
    background: rgba(230, 46, 0, 0.1);
    color: white;
    font-weight: bold;
  }
</style>