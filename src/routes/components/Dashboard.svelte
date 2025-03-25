<script>
    import ProjectCard from './DeploymentCard.svelte';
  
    let userName = "User"; // This could come from user input or auth
    let deployments = [
      { name: "Project Alpha", url: "https://alpha.example.com", cost: "127.45 AKT", balance: 534.8, resources: "4 vCPU • 8 GB • 100 GB", status: "healthy" },
      { name: "Project Beta", url: "https://beta.example.com", cost: "89.30 AKT", balance: 312.5, resources: "2 vCPU • 4 GB • 80 GB", status: "healthy" },
      { name: "Project Gamma", url: "https://gamma.example.com", cost: "214.75 AKT", balance: 78.2, resources: "6 vCPU • 12 GB • 300 GB", status: "low" }
    ];
  
    let recentProjects = [
      { name: "Project Delta", recent: "25-03-14" },
      { name: "Project Epsilon", recent: "25-03-13" },
      { name: "Project Zeta", recent: "25-03-12" }
    ];
    let datasets = [
      { name: "AI Training v3", size: "1.2 GB" },
      { name: "Climate 2025", size: "800 MB" }
    ];
    let competitions = [
      { name: "Code Sprint", endDate: "25-03-20" },
      { name: "Data Hack", endDate: "25-04-01" }
    ];
    let learningTracks = [
      { name: "ML Basics", progress: "60%" },
      { name: "Web3 Dev", progress: "25%" }
    ];
  
    let userRank = { title: "Bronze Coder", badge: "🥉", level: 3 };
    let spiceEarned = 145; // This could come from user data or a backend API
  
    // Project category counts derived from deployments
    let deploymentCategories = [
      { name: "All Deployments", count: deployments.length },
      { name: "Active", count: deployments.filter(d => d.status === "healthy").length },
      { name: "Low Balance", count: deployments.filter(d => d.status === "low").length }
    ];
  
    // New AKT Balance (sum of deployment balances)
    let aktBalance = deployments.reduce((sum, d) => sum + d.balance, 0).toFixed(1);
  
    // Overall stats
    let overallStats = {
      cpu: "12 vCPU",
      memory: "24 GB",
      storage: "480 GB",
      cost: "431.50 AKT"
    };
  
    // Placeholder data for news
    let news = "Welcome to Akash Notebooks! Earn $SPICE by completing challenges and competing in our monthly contests! - Platform Owner";
  
    // State to track visible column
    let activeColumn = "left"; // Default to left column
  
    // Functions to switch columns
    function showLeftColumn() {
      activeColumn = "left";
    }
    function showRightColumn() {
      activeColumn = "right";
    }
  </script>
  
  <main class="container">
    <div class="content">
      <section class="dashboard">
        <!-- Header with Welcome (not centered) -->
        <div class="header-row">
          <h1>Welcome, {userName}!</h1>
        </div>
        
        <!-- Quick Stats with Navigation -->
        <div class="quick-stats">
          <button class="nav-arrow left-arrow" on:click={showLeftColumn} disabled={activeColumn === "left"}>←</button>
          <div class="column-container">
            {#if activeColumn === "left"}
              <div class="column">
                <!-- Upper Row -->
                <div class="row upper">
                  {#each deploymentCategories as category}
                    <div class="stat-card project-category" class:active={category.name === "Active"} class:low={category.name === "Low Balance"}>
                      <h3>{category.name}</h3>
                      <span>{category.count}</span>
                    </div>
                  {/each}
                  <div class="stat-card akt-balance">
                    <h3>AKT Balance</h3>
                    <span>{aktBalance} AKT</span>
                  </div>
                </div>
                <!-- Lower Row -->
                <div class="row lower">
                  <div class="stat-card stat">
                    <h3>Total CPU</h3>
                    <span>{overallStats.cpu}</span>
                  </div>
                  <div class="stat-card stat">
                    <h3>Total Memory</h3>
                    <span>{overallStats.memory}</span>
                  </div>
                  <div class="stat-card stat">
                    <h3>Total Storage</h3>
                    <span>{overallStats.storage}</span>
                  </div>
                  <div class="stat-card stat">
                    <h3>Monthly Cost</h3>
                    <span>{overallStats.cost}</span>
                  </div>
                </div>
              </div>
            {:else if activeColumn === "right"}
              <div class="column">
                <!-- Upper Row -->
                <div class="row upper">
                  <div class="stat-card recent-projects">
                    <h3>Recent Projects</h3>
                    <div class="projects-container">
                      <ul>
                        {#each recentProjects as project}
                          <li>{project.name}</li>
                        {/each}
                      </ul>
                      <button class="create-btn">+ CREATE</button>
                    </div>
                  </div>
                  <div class="stat-card learning-tracks">
                    <h3>Learning Tracks</h3>
                    <ul>
                      {#each learningTracks as track}
                        <li>{track.name} - {track.progress}</li>
                      {/each}
                    </ul>
                  </div>
                  <div class="stat-card spice">
                  <h3>$SPICE Earned</h3>
                  <span>{spiceEarned.toFixed(0)}</span>
                </div>
                </div>
                <!-- Lower Row -->
                <div class="row lower">
                  <div class="stat-card datasets">
                    <h3>Datasets</h3>
                    <ul>
                      {#each datasets as dataset}
                        <li>{dataset.name} ({dataset.size})</li>
                      {/each}
                    </ul>
                  </div>
                  <div class="stat-card competitions">
                    <h3>Competitions</h3>
                    <ul>
                      {#each competitions as comp}
                        <li>{comp.name} - Ends {comp.endDate}</li>
                      {/each}
                    </ul>
                  </div>
                  <div class="stat-card rank">
                    <div class="rank-content">
                        <div class="badge">{userRank.badge}</div>
                        <span>{userRank.title}</span>
                    </div>
                </div>
                </div>
              </div>
            {/if}
          </div>
          <button class="nav-arrow right-arrow" on:click={showRightColumn} disabled={activeColumn === "right"}>→</button>
        </div>
  
        <!-- News/Words from Owner (not centered) -->
        <div class="news">
          <h3>Platform Updates</h3>
          <p>{news}</p>
        </div>
      </section>
  
      <section class="deployments">
        <h2>My Deployments</h2>
        {#each deployments as deployment}
          <ProjectCard {...deployment} />
        {/each}
      </section>
    </div>
  </main>
  
  <style>
    .container {
      display: flex;
      flex-direction: column;
      background: #0d0d0d;
      color: white;
      height: 100vh;
    }
    .content {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow-y: auto;
    }
    .dashboard {
      padding: 20px;
      border-bottom: 1px solid #e62e00;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .dashboard h1 {
      font-size: 36px;
      margin: 0;
    }
    .quick-stats {
      display: flex;
      justify-content: center; /* Center the entire quick-stats block */
      align-items: center;
      gap: 20px; /* Increased gap for better spacing */
      margin-bottom: 20px;
      width: 100%;
    }
    .column-container {
      width: 800px; /* Fixed width to ensure centering */
      max-width: 100%; /* Responsive fallback */
    }
    .column {
      display: flex;
      flex-direction: column;
      gap: 15px;
      width: 100%;
    }
    .row {
      display: flex;
      justify-content: center; /* Center cards within each row */
      gap: 15px;
      flex-wrap: wrap;
    }
    .stat-card {
      background: rgba(20, 20, 20, 0.9);
      padding: 10px;
      border-radius: 6px;
      flex: 1;
      min-width: 150px;
      max-width: 200px;
      height: 120px;
      display: flex;
      flex-direction: column;
    }
    .stat-card h3 {
      font-size: 12px;
      color: #888;
      margin: 0;
    }
    .stat-card span {
      font-size: 20px;
      font-weight: bold;
    }
    .project-category, .akt-balance, .stat {
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .project-category span {
      font-size: 24px;
    }
    .project-category.active span {
      color: #00cc00; /* Green for Active */
    }
    .project-category.low span {
      color: #ff3333; /* Red for Low Balance */
    }
    .akt-balance span {
      font-size: 24px;
    }
    .spice {
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .spice span {
      font-size: 28px;
    }
    .recent-projects {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .recent-projects h3 {
      font-size: 14px;
    }
    .recent-projects ul {
      list-style: none;
      padding: 0;
      text-align: left;
      font-size: 12px;
      color: #aaa;
      margin: 0;
    }
    .projects-container {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }
    .datasets h3, .competitions h3, .learning-tracks h3 {
      font-size: 14px;
    }
    .datasets ul, .competitions ul, .learning-tracks ul {
      list-style: none;
      padding: 0;
      text-align: center;
      font-size: 12px;
      color: #aaa;
      margin: 0;
    }
    .recent-projects li, .datasets li, .competitions li, .learning-tracks li {
      margin-bottom: 4px;
    }
    .create-btn {
      background: #e62e00;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      color: white;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      width: auto;
      max-width: 80px;
      font-size: 12px;
    }
    .create-btn:hover {
      background: #ff4500;
      box-shadow: 0 3px 10px rgba(230, 46, 0, 0.4);
    }
    .rank {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .rank-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
    }
    .badge {
      font-size: 24px;
    }
    .news {
      background: rgba(20, 20, 20, 0.9);
      padding: 10px;
      border-radius: 6px;
      width: 100%;
    }
    .news h3 {
      font-size: 12px;
      color: #888;
      margin-bottom: 8px;
    }
    .news p {
      font-size: 14px;
      color: #aaa;
    }
    .deployments {
      flex: 1;
      padding: 20px;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .deployments h2 {
      font-size: 24px;
      margin-bottom: 20px;
    }
    .nav-arrow {
      background: #e62e00;
      border: none;
      padding: 10px;
      border-radius: 50%;
      color: white;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .nav-arrow:hover:not(:disabled) {
      background: #ff4500;
      box-shadow: 0 3px 10px rgba(230, 46, 0, 0.4);
    }
    .nav-arrow:disabled {
      background: #444;
      cursor: not-allowed;
    }
  </style>