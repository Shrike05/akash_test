<script>
    let userName = "User"; // This could come from user input or auth
  
    // Mock data for datasets with tags
    let datasets = [{ id: 1, title: "AI Training v3", desc: "Neural network dataset", filetype: "CSV", size: "1.2 GB", uploader: "Alice", tags: ["AI", "Machine Learning"] },{ id: 2, title: "Climate 2025", desc: "Global climate data", filetype: "JSON", size: "800 MB", uploader: "Bob", tags: ["Climate", "Environment"] },{ id: 3, title: "Traffic Patterns", desc: "Urban traffic stats", filetype: "Parquet", size: "2.5 GB", uploader: "Charlie", tags: ["Traffic", "Urban"] },{ id: 4, title: "Health Metrics", desc: "Patient health records", filetype: "CSV", size: "1.8 GB", uploader: "Dana", tags: ["Health", "Medical"] },{ id: 5, title: "Social Media Trends", desc: "Twitter sentiment", filetype: "JSON", size: "600 MB", uploader: "Eve", tags: ["Social", "Sentiment"] },{ id: 6, title: "Financial Logs", desc: "Stock market data", filetype: "Parquet", size: "3.1 GB", uploader: "Frank", tags: ["Finance", "Stocks"] }];
    let news = "Discover datasets to fuel your projects! - Platform Owner";
    let searchQuery = "";
    let filteredDatasets = [...datasets];
    let isFilterOpen = false;
    let filterFiletype = "all"; // Options: all, CSV, JSON, Parquet
    let filterSize = "all"; // Options: all, small (<1GB), medium (1-2GB), large (>2GB)
    let filterTag = "all"; // Options: all, or specific tags
  
    const categories = ["All", "AI", "Climate", "Traffic", "Health", "Social", "Finance"];
    const filetypes = ["CSV", "JSON", "Parquet"];
    const sizes = ["small (<1GB)", "medium (1-2GB)", "large (>2GB)"];
    const tags = ["AI", "Machine Learning", "Climate", "Environment", "Traffic", "Urban", "Health", "Medical", "Social", "Sentiment", "Finance", "Stocks"];
  
    function updateFilteredDatasets() {
      filteredDatasets = datasets.filter(dataset => {
        // Search filter
        const matchesSearch = searchQuery === "" || 
                             dataset.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             dataset.desc.toLowerCase().includes(searchQuery.toLowerCase());
  
        // Filetype filter
        const matchesFiletype = filterFiletype === "all" || dataset.filetype === filterFiletype;
  
        // Size filter
        const sizeInGB = parseFloat(dataset.size.split(" ")[0]);
        const matchesSize = filterSize === "all" ||
                            (filterSize === "small (<1GB)" && sizeInGB < 1) ||
                            (filterSize === "medium (1-2GB)" && sizeInGB >= 1 && sizeInGB <= 2) ||
                            (filterSize === "large (>2GB)" && sizeInGB > 2);
  
        // Tag filter
        const matchesTag = filterTag === "all" || dataset.tags.includes(filterTag);
  
        return matchesSearch && matchesFiletype && matchesSize && matchesTag;
      });
    }
  
    // Handle search input and filter changes
    $: searchQuery, filterFiletype, filterSize, filterTag, updateFilteredDatasets();
  
    // Handle category button click
    function searchByCategory(category) {
      searchQuery = category === "All" ? "" : category;
    }
  
    // Toggle filter dropdown
    function toggleFilter() {
      isFilterOpen = !isFilterOpen;
    }
  
    // Reset filters
    function resetFilters() {
      filterFiletype = "all";
      filterSize = "all";
      filterTag = "all";
      isFilterOpen = false;
    }
  </script>
  
  <main class="container">
    <div class="content">
      <!-- Page Intro Section -->
      <section class="page-intro">
        <div class="header-row">
          <h1>Your Datasets</h1>
        </div>
  
        <div class="dataset-news">
          <h3>Dataset News</h3>
          <p>{news}</p>
        </div>
      </section>
  
      <!-- Datasets Section -->
      <section class="datasets">
        <h2>All Datasets</h2>
        <div class="controls">
          <input type="text" placeholder="Search datasets..." bind:value={searchQuery} class="search-bar" />
          <div class="category-buttons">
            {#each categories as category}
              <button class="category-btn" on:click={() => searchByCategory(category)}>
                {category}
              </button>
            {/each}
          </div>
          <div class="filter-dropdown">
            <button class="filter-btn" on:click={toggleFilter}>Filter</button>
            {#if isFilterOpen}
              <div class="dropdown-content">
                <div class="filter-section">
                  <h4>Filetype</h4>
                  <select bind:value={filterFiletype}>
                    <option value="all">All</option>
                    {#each filetypes as filetype}
                      <option value={filetype}>{filetype}</option>
                    {/each}
                  </select>
                </div>
                <div class="filter-section">
                  <h4>Size</h4>
                  <select bind:value={filterSize}>
                    <option value="all">All</option>
                    {#each sizes as size}
                      <option value={size}>{size}</option>
                    {/each}
                  </select>
                </div>
                <div class="filter-section">
                  <h4>Tags</h4>
                  <select bind:value={filterTag}>
                    <option value="all">All</option>
                    {#each tags as tag}
                      <option value={tag}>{tag}</option>
                    {/each}
                  </select>
                </div>
                <button class="reset-btn" on:click={resetFilters}>Reset Filters</button>
              </div>
            {/if}
          </div>
        </div>
        <div class="dataset-list">
          {#each filteredDatasets as dataset (dataset.id)}
            <div class="dataset-box">
              <div class="thumbnail"></div>
              <div class="details">
                <h3>{dataset.title}</h3>
                <p class="desc">{dataset.desc}</p>
                <p class="filetype">Type: {dataset.filetype}</p>
                <p class="size">Size: {dataset.size}</p>
                <p class="uploader">Uploaded by: {dataset.uploader}</p>
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
    .dataset-news {
      background: rgba(20, 20, 20, 0.9);
      padding: 10px;
      border-radius: 6px;
    }
    .dataset-news h3 {
      font-size: 12px;
      color: #888;
      margin-bottom: 8px;
    }
    .dataset-news p {
      font-size: 14px;
      color: #aaa;
    }
  
    /* Datasets Section */
    .datasets {
      flex: 1;
      padding: 20px;
    }
    .datasets h2 {
      font-size: 24px;
      margin-bottom: 20px;
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .search-bar {
      padding: 8px 12px;
      border: 1px solid #444;
      border-radius: 4px;
      background: #141414;
      color: white;
      font-size: 14px;
      width: 100%;
      max-width: 300px;
    }
    .category-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .category-btn {
      background: #e68a00;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      color: white;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .category-btn:hover {
      background: #ff9900;
      box-shadow: 0 3px 10px rgba(230, 153, 0, 0.4);
    }
    .filter-dropdown {
      position: relative;
      display: inline-flex;
      align-items: center;
    }
    .filter-btn {
      background: #e68a00;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      color: white;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .filter-btn:hover {
      background: #ff9900;
      box-shadow: 0 3px 10px rgba(230, 153, 0, 0.4);
    }
    .dropdown-content {
      position: absolute;
      top: 100%;
      left: 0;
      background: #141414;
      border: 1px solid #e68a00;
      border-radius: 4px;
      padding: 10px;
      z-index: 10;
      min-width: 200px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    }
    .filter-section {
      margin-bottom: 10px;
    }
    .filter-section h4 {
      font-size: 12px;
      color: #888;
      margin: 0 0 5px 0;
    }
    .filter-section select {
      width: 100%;
      padding: 5px;
      background: #222;
      border: 1px solid #444;
      border-radius: 4px;
      color: white;
      font-size: 12px;
    }
    .reset-btn {
      background: #e62e00;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      color: white;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      width: 100%;
    }
    .reset-btn:hover {
      background: #ff4500;
      box-shadow: 0 3px 10px rgba(230, 46, 0, 0.4);
    }
    .dataset-list {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
    }
    .dataset-box {
      background: rgba(25, 25, 25, 0.9);
      border: 1px solid #e68a0093;
      border-radius: 8px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 250px;
      max-width: 250px;
    }
    .thumbnail {
      width: 100%;
      height: 120px;
      background: #333;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    .details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .details h3 {
      font-size: 16px;
      margin: 0;
      color: #fff;
    }
    .desc {
      font-size: 12px;
      color: #aaa;
      margin: 0;
      flex-grow: 1;
    }
    .filetype, .size, .uploader {
      font-size: 10px;
      color: #888;
      margin: 0;
    }
  </style>