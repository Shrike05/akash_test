<script>
  
    let projects = [{ id: 1, name: "Quantum Widget", visibility: "private", updated: "25-03-14", selected: false }, { id: 2, name: "Eco Dashboard", visibility: "public", updated: "25-03-13", selected: false }, { id: 3, name: "AI Chatbot", visibility: "private", updated: "25-03-12", selected: false }, { id: 4, name: "Blockchain Tracker", visibility: "public", updated: "25-03-11", selected: false }, { id: 5, name: "VR Game", visibility: "private", updated: "25-03-10", selected: false }];
    let news = "Explore your projects and start something new! - Platform Owner";  
    let searchQuery = "";
    let filterUpdated = "all"; // Options: all, last7days, last30days
    let filteredProjects = [...projects];
    const today = "25-03-15";
  
    // Filter and search logic
    function updateFilteredProjects() {
      filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        const projectDate = new Date(`20${project.updated.split('-')[0]}-${project.updated.split('-')[1]}-${project.updated.split('-')[2]}`);
        const currentDate = new Date(`20${today.split('-')[0]}-${today.split('-')[1]}-${today.split('-')[2]}`);
        const daysDiff = (currentDate - projectDate) / (1000 * 60 * 60 * 24);
  
        let matchesFilter = true;
        if (filterUpdated === "last7days") {
          matchesFilter = daysDiff <= 7;
        } else if (filterUpdated === "last30days") {
          matchesFilter = daysDiff <= 30;
        }
        
        return matchesSearch && matchesFilter;
      });
    }
  
    $: searchQuery, updateFilteredProjects();
  
    function handleFilterChange(event) {
      filterUpdated = event.target.value;
      updateFilteredProjects();
    }
  
    function deleteSelected() {
      projects = projects.filter(project => !project.selected);
      updateFilteredProjects();
    }
  
    let allSelected = false;
    function toggleAll() {
      allSelected = !allSelected;
      projects = projects.map(project => ({ ...project, selected: allSelected }));
      filteredProjects = filteredProjects.map(project => ({ ...project, selected: allSelected }));
    }
  </script>
  
  <main class="container">
    <div class="content">
      <!-- Page Intro Section -->
      <section class="page-intro">
        <div class="header-row">
          <h1>Your Work</h1>
        </div>
  
        <div class="project-news">
          <h3>Project News</h3>
          <p>{news}</p>
        </div>
      </section>
  
      <!-- Projects Section -->
      <section class="projects">
        <h2>All Projects</h2>
        <div class="controls">
          <input type="text" placeholder="Search projects..." bind:value={searchQuery} class="search-bar" />
          <select bind:value={filterUpdated} on:change={handleFilterChange} class="filter-dropdown">
            <option value="all">All</option>
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
          </select>
          <button class="delete-btn" on:click={deleteSelected} disabled={!filteredProjects.some(p => p.selected)}>
            Delete Selected
          </button>
          <label class="select-all">
            <input type="checkbox" bind:checked={allSelected} on:change={toggleAll} /> Select All
          </label>
        </div>
  
        <div class="project-list">
          {#each filteredProjects as project (project.id)}
            <div class="project-item">
              <label class="checkbox">
                <input type="checkbox" bind:checked={project.selected} />
              </label>
              <h3>{project.name}</h3>
              <div class="details">
                <div class="info-box" class:private={project.visibility === 'private'} class:public={project.visibility === 'public'}>
                  <h2>Visibility</h2>
                  <span>{project.visibility}</span>
                </div>
                <div class="info-box small">
                  <h2>Last Updated</h2>
                  <span>{project.updated}</span>
                </div>
                <button class="view-btn">View Project</button>
              </div>
            </div>
          {/each}
        </div>
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
    .page-intro {
      padding: 20px;
      border-bottom: 1px solid #e62e00;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .page-intro h1 {
      font-size: 36px;
      margin: 0;
    }
    .project-news {
      background: rgba(20, 20, 20, 0.9);
      padding: 10px;
      border-radius: 6px;
    }
    .project-news h3 {
      font-size: 12px;
      color: #888;
      margin-bottom: 8px;
    }
    .project-news p {
      font-size: 14px;
      color: #aaa;
    }
  
    /* Projects Section */
    .projects {
      flex: 1;
      padding: 20px;
    }
    .projects h2 {
      font-size: 24px;
      margin-bottom: 20px;
    }
    .controls {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      align-items: center;
      flex-wrap: wrap;
    }
    .search-bar {
      padding: 8px 12px;
      border: 1px solid #444;
      border-radius: 4px;
      background: #141414;
      color: white;
      font-size: 14px;
      width: 200px;
    }
    .filter-dropdown {
      padding: 8px;
      border: 1px solid #444;
      border-radius: 4px;
      background: #141414;
      color: white;
      font-size: 14px;
    }
    .delete-btn {
      background: #e62e00;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      color: white;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .delete-btn:hover {
      background: #ff4500;
      box-shadow: 0 3px 10px rgba(230, 46, 0, 0.4);
    }
    .delete-btn:disabled {
      background: #555;
      cursor: not-allowed;
    }
    .select-all {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #aaa;
      font-size: 14px;
    }
    .project-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .project-item {
      background: rgba(25, 25, 25, 0.9);
      border: 1px solid #0303a9;
      padding: 15px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .checkbox {
      display: flex;
      align-items: center;
    }
    .project-item h3 {
      font-size: 20px;
      margin: 0;
      flex: 0 0 200px;
    }
    .details {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
      flex: 1;
    }
    .info-box {
      background: rgba(30, 30, 30, 0.9);
      padding: 8px;
      border-radius: 4px;
      min-width: 100px;
    }
    .info-box.small {
      min-width: 80px;
    }
    .info-box h2 {
      font-size: 10px;
      color: #888;
      margin: 0 0 4px 0;
    }
    .info-box span {
      font-size: 14px;
      color: white;
    }
    .info-box.private span {
      color: #504e4e; /* Red for private */
    }
    .info-box.public span {
      color: #ffffff; /* Green for public */
    }
    .view-btn {
      background: #0303a9;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 14px;
      margin-left: auto;
    }
    .view-btn:hover {
      background: #ff9900;
      box-shadow: 0 3px 10px rgba(230, 153, 0, 0.4);
    }
  </style>