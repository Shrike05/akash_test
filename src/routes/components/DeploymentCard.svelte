<script>
    export let name;
    export let url;
    export let cost;
    export let balance;
    export let resources;
    export let status;
  
    let isDropdownOpen = false;
  
    function toggleDropdown() {
      isDropdownOpen = !isDropdownOpen;
    }
</script>

<div class="deployment-card">
    <h3>{name}</h3>
    <div class="details">
      <div class="info-box">
        <h2>Deployment URL</h2>
        <a href={url}>{url}</a>
      </div>
      <div class="info-box">
        <h2>Monthly Cost</h2>
        <span>{cost}</span>
      </div>
      <div class="info-box balance small" class:low={status === 'low'}>
        <h2>Balance</h2>
        <span>{balance} AKT</span>
      </div>
      <div class="info-box small">
        <h2>Uptime left</h2>
        <span>~1 month</span>
      </div>
      <div class="info-box">
        <h2>Resources</h2>
        <span>{resources}</span>
      </div>
      <button class="github-btn">
        <img src="https://img.icons8.com/ios11/512/FFFFFF/github.png" alt="GitHub Logo" />
        GitHub
      </button>
      <div class="dropdown">
        <button class="manage-btn" on:click={toggleDropdown}>Manage Deployment</button>
        {#if isDropdownOpen}
          <div class="dropdown-content">
            <a href="#" on:click|preventDefault={() => isDropdownOpen = false}>Add Funds</a>
            <a href="#" on:click|preventDefault={() => isDropdownOpen = false}>Redeploy</a>
            <a href="#" on:click|preventDefault={() => isDropdownOpen = false}>Close deployment</a>
          </div>
        {/if}
      </div>
    </div>
</div>

<style>
    .deployment-card {
      background: rgba(15, 15, 15, 0.8);
      border: 1px solid #753e3e;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
      width: 1200px;
    }
    .details {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      align-items: center;
    }
    h3 {
      font-size: 24px;
    }
    .info-box {
      background: rgba(20, 20, 20, 0.9);
      padding: 10px;
      border-radius: 6px;
      min-width: 10px;
    }
    .info-box.small {
      min-width: 20px;
    }
    h2 {
      font-size: 12px;
      color: #888;
      margin: 0 0 5px 0;
    }
    span, a {
      font-size: 16px;
      display: block;
      color: white;
    }
    a {
      text-decoration: none;
      transition: color 0.3s ease;
    }
    a:hover {
      color: #e62e00;
    }
    .balance.low span {
      color: red;
    }
    button {
      background: #222;
      color: white;
      border: none;
      padding: 10px 20px;
      margin-top: 0;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 16px;
      height: 47px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .github-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #222;
      margin-left: auto; /* Pushes this button and everything after it to the right */
    }
    .github-btn:hover {
      background: #333;
    }
    .github-btn img {
      width: 20px;
      height: 20px;
      vertical-align: middle;
    }
    .dropdown {
      position: relative;
      display: inline-flex;
      align-items: center;
    }
    .manage-btn {
      background: #e62e00;
      padding: 10px 20px;
      height: 47px;
    }
    .manage-btn:hover {
      background: #ff4500;
      box-shadow: 0 5px 15px rgba(230, 46, 0, 0.4);
    }
    .dropdown-content {
      position: absolute;
      background-color: #141414;
      min-width: 140px;
      box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
      z-index: 1;
      border-radius: 6px;
      border: 1px solid #e62e00;
      top: 100%;
      left: 0;
    }
    .dropdown-content a {
      color: #aaaaaa;
      padding: 10px 16px;
      text-decoration: none;
      display: block;
      transition: all 0.3s ease;
    }
    .dropdown-content a:hover {
      background-color: rgba(230, 46, 0, 0.1);
      color: #e62e00;
    }
</style>