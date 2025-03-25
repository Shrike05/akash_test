<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';

  let userName = "User"; // This could come from user input or auth

  // Mock data for Akash Network-related events with dates for 2025
  let events = [
    { id: 1, title: "Akash Hackathon 2025", desc: "Global online hackathon for decentralized cloud", type: "Hackathon", teams: 50, prize: "$15,000", city: "Online", location: "Remote", past: false, date: "2025-03-15" },
    { id: 2, title: "Cosmos Buenos Aires", desc: "Workshop on Cosmos ecosystem with Akash", type: "Workshop", teams: 20, prize: "N/A", city: "Buenos Aires", location: "On-site", past: true, date: "2025-02-10" },
    { id: 3, title: "Solana Season Hackathon", desc: "Eastern Europe track with Akash", type: "Hackathon", teams: 80, prize: "$1M", city: "Online", location: "Remote", past: false, date: "2025-06-20" },
    { id: 4, title: "Akash Technical Summit", desc: "Russian community deployment challenge", type: "Summit", teams: 15, prize: "$5,000", city: "Moscow", location: "On-site", past: false, date: "2025-09-05" },
    { id: 5, title: "SparkTheSummer Gujarat", desc: "In-person hackathon with Akash support", type: "Hackathon", teams: 300, prize: "$10,000", city: "Ahmedabad", location: "On-site", past: true, date: "2025-01-25" },
    { id: 6, title: "Akash Provider Workshop", desc: "Learn to set up an Akash provider", type: "Workshop", teams: 10, prize: "N/A", city: "Online", location: "Remote", past: false, date: "2025-11-30" }
  ];

  let news = "Join Akash Network events worldwide! - Akash Team";

  let searchQuery = "";
  let filteredEvents = [...events];
  let isFilterOpen = false;
  let showPastEvents = false;

  // Filter states
  let filterTeams = "all"; // Options: all, small (<50), medium (50-100), large (>100)
  let filterPrize = "all"; // Options: all, none, low (<$10K), high (≥$10K)
  let filterCity = "all"; // Options: all, or specific cities
  let filterLocation = "all"; // Options: all, Remote, On-site

  // Categories for buttons
  const categories = ["All", "Hackathon", "Workshop", "Summit"];

  // Available filter options (excluding type, now handled by buttons)
  const teamSizes = ["small (<50)", "medium (50-100)", "large (>100)"];
  const prizes = ["none", "low (<$10K)", "high (≥$10K)"];
  const cities = ["Online", "Buenos Aires", "Moscow", "Ahmedabad"];
  const locations = ["Remote", "On-site"];

  // Filter and search logic
  function updateFilteredEvents() {
    filteredEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      const matchesSearch = searchQuery === "" || 
                           event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           event.desc.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = searchQuery === "" || searchQuery === "All" || event.type === searchQuery;

      const teamCount = event.teams;
      const matchesTeams = filterTeams === "all" ||
                          (filterTeams === "small (<50)" && teamCount < 50) ||
                          (filterTeams === "medium (50-100)" && teamCount >= 50 && teamCount <= 100) ||
                          (filterTeams === "large (>100)" && teamCount > 100);

      const prizeValue = event.prize === "N/A" ? 0 : parseFloat(event.prize.replace(/[^0-9.]/g, ""));
      const matchesPrize = filterPrize === "all" ||
                          (filterPrize === "none" && event.prize === "N/A") ||
                          (filterPrize === "low (<$10K)" && prizeValue > 0 && prizeValue < 10000) ||
                          (filterPrize === "high (≥$10K)" && prizeValue >= 10000);

      const matchesCity = filterCity === "all" || event.city === filterCity;

      const matchesLocation = filterLocation === "all" || event.location === filterLocation;

      const matchesPast = showPastEvents || !event.past;

      return matchesSearch && matchesType && matchesTeams && matchesPrize && matchesCity && matchesLocation && matchesPast;
    });
  }

  // Handle search input and filter changes
  $: searchQuery, filterTeams, filterPrize, filterCity, filterLocation, showPastEvents, updateFilteredEvents();

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
    filterTeams = "all";
    filterPrize = "all";
    filterCity = "all";
    filterLocation = "all";
    showPastEvents = false;
    isFilterOpen = false;
    searchQuery = ""; // Reset type filter as well
  }

  // Toggle past events
  function togglePastEvents() {
    showPastEvents = !showPastEvents;
  }

  // Track expanded event for details
  let hoveredEvent = null;
  let clickedEvent = null;
  function handleEventHover(eventId) {
    hoveredEvent = eventId;
  }
  function handleEventLeave() {
    if (!clickedEvent) hoveredEvent = null;
  }
  function toggleEventClick(eventId) {
    clickedEvent = clickedEvent === eventId ? null : eventId;
    if (clickedEvent) hoveredEvent = eventId; // Keep details visible on click
  }

  // Share event
  function shareEvent(event) {
    const url = `${window.location.origin}/events/${event.id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("Event link copied to clipboard!");
    });
  }

  // Group events by quarter
  const quarters = [
    { name: "Q1", months: [0, 1, 2], startDate: "2025-01-01", endDate: "2025-03-31" },
    { name: "Q2", months: [3, 4, 5], startDate: "2025-04-01", endDate: "2025-06-30" },
    { name: "Q3", months: [6, 7, 8], startDate: "2025-07-01", endDate: "2025-09-30" },
    { name: "Q4", months: [9, 10, 11], startDate: "2025-10-01", endDate: "2025-12-31" }
  ];

  // Function to calculate Mondays in a given date range
  function getMondaysInRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const mondays = [];

    let current = new Date(start);
    while (current.getDay() !== 1) {
      current.setDate(current.getDate() + 1);
    }

    while (current <= end) {
      mondays.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }

    return mondays;
  }

  // Calculate total days in each quarter for positioning
  function getDaysInRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (end - start) / (1000 * 60 * 60 * 24) + 1;
  }

  // Calculate Mondays for each quarter and their positions
  const quarterMondays = quarters.map(quarter => {
    const mondays = getMondaysInRange(quarter.startDate, quarter.endDate);
    const totalDays = getDaysInRange(quarter.startDate, quarter.endDate);
    return mondays.map(monday => {
      const daysFromStart = (monday - new Date(quarter.startDate)) / (1000 * 60 * 60 * 24);
      const position = (daysFromStart / totalDays) * 100;
      return { date: monday, position };
    });
  });

  // Scroll to quarter
  function scrollToQuarter(quarterIndex) {
    const element = document.getElementId(`quarter-${quarterIndex}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
</script>

<main class="container">
  <div class="content">
    <!-- Page Intro Section -->
    <section class="page-intro">
      <div class="header-row">
        <h1>Akash Related Events</h1>
      </div>
      <div class="event-news">
        <h3>Event News</h3>
        <p>{news}</p>
      </div>
    </section>

    <!-- Events Timeline Section -->
    <section class="events-timeline">
      <h2>Events 2025</h2>
      <div class="controls sticky-controls">
        <input type="text" placeholder="Search events..." bind:value={searchQuery} class="search-bar" />
        <div class="type-buttons">
          {#each categories as category}
            <button>  
              class="type-btn {category.toLowerCase()}"
              on:click={() => searchByCategory(category)}
              style={category === "All" ? "background: #222; border: 1px solid #ffffff;" : ""}
            
              {category}
            </button>
          {/each}
        </div>
        <div class="filter-dropdown">
          <button class="filter-btn" on:click={toggleFilter}>Filter</button>
          {#if isFilterOpen}
            <div class="dropdown-content" transition:slide>
              <div class="filter-section">
                <h4>Teams</h4>
                <select bind:value={filterTeams}>
                  <option value="all">All</option>
                  {#each teamSizes as size}
                    <option value={size}>{size}</option>
                  {/each}
                </select>
              </div>
              <div class="filter-section">
                <h4>Prize</h4>
                <select bind:value={filterPrize}>
                  <option value="all">All</option>
                  {#each prizes as prize}
                    <option value={prize}>{prize}</option>
                  {/each}
                </select>
              </div>
              <div class="filter-section">
                <h4>City</h4>
                <select bind:value={filterCity}>
                  <option value="all">All</option>
                  {#each cities as city}
                    <option value={city}>{city}</option>
                  {/each}
                </select>
              </div>
              <div class="filter-section">
                <h4>Location</h4>
                <select bind:value={filterLocation}>
                  <option value="all">All</option>
                  {#each locations as location}
                    <option value={location}>{location}</option>
                  {/each}
                </select>
              </div>
              <button class="reset-btn" on:click={resetFilters}>Reset Filters</button>
            </div>
          {/if}
        </div>
        <button class="past-btn" on:click={togglePastEvents}>
          {showPastEvents ? "Hide Past Events" : "Show Past Events"}
        </button>
      </div>
      <div class="quarter-nav">
        {#each quarters as quarter, index}
          <button on:click={() => scrollToQuarter(index)}>{quarter.name}</button>
        {/each}
      </div>
      <div class="timeline-container">
        {#each quarters as quarter, quarterIndex}
          <div class="quarter-timeline" id={`quarter-${quarterIndex}`}>
            <div class="month-labels">
              {#each quarter.months as month}
                <div class="month-label" style="left: calc({(month - quarter.months[0]) * 33.33}%);">
                  {new Date(2025, month, 1).toLocaleString('default', { month: 'short' })}
                </div>
              {/each}
            </div>
            <div class="timeline">
              <!-- Timeline Line and Week Stripes -->
              <div class="timeline-line"></div>
              {#each quarterMondays[quarterIndex] as monday}
                <div class="week-stripe" style="left: {monday.position}%;"></div>
              {/each}
              <!-- Event Markers -->
              {#each filteredEvents.filter(event => quarter.months.includes(new Date(event.date).getMonth())) as event (event.id)}
                <div 
                  class="event-marker {event.type.toLowerCase()}" 
                  style="left: calc({((new Date(event.date).getDate() / 31) * 33.33 + (new Date(event.date).getMonth() - quarter.months[0]) * 33.33)}%);"
                  on:mouseover={() => handleEventHover(event.id)}
                  on:mouseleave={handleEventLeave}
                  on:click={() => toggleEventClick(event.id)}
                  class:visible={hoveredEvent === event.id || clickedEvent === event.id}
                >
                  <span class="marker-dot">
                    <span class="inner-dot"></span>
                  </span>
                  {#if hoveredEvent === event.id || clickedEvent === event.id}
                    <div class="event-details" transition:fade>
                      <h3>{event.title}</h3>
                      <p class="desc">{event.desc}</p>
                      <p><strong>Type:</strong> <span class="tag {event.type.toLowerCase()}">{event.type}</span></p>
                      <p><strong>Teams:</strong> {event.teams}</p>
                      <p><strong>Prize:</strong> {event.prize}</p>
                      <p><strong>City:</strong> {event.city}</p>
                      <p><strong>Location:</strong> {event.location}</p>
                      <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                      <button class="share-btn" on:click={() => shareEvent(event)}>Share Event</button>
                    </div>
                  {/if}
                </div>
              {/each}
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
    background: linear-gradient(135deg, #0d0d0d, #1a1a1a);
    color: white;
    min-height: 100vh;
    font-family: 'Arial', sans-serif;
  }
  .content {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }
  .page-intro {
    padding: 20px 0;
    border-bottom: 2px solid #e62e00;
    background: rgba(20, 20, 20, 0.8);
    border-radius: 8px;
  }
  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .page-intro h1 {
    font-size: 40px;
    margin: 0;
    color: #e62e00;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }
  .event-news {
    background: rgba(30, 30, 30, 0.9);
    padding: 15px;
    border-radius: 8px;
    margin-top: 20px;
    border-left: 4px solid #e62e00;
  }
  .event-news h3 {
    font-size: 14px;
    color: #888;
    margin-bottom: 10px;
  }
  .event-news p {
    font-size: 16px;
    color: #ccc;
    font-style: italic;
  }

  .events-timeline {
    padding: 40px 0;
  }
  .events-timeline h2 {
    font-size: 28px;
    margin-bottom: 30px;
    color: #fff;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 2px;
  }
  .sticky-controls {
    position: sticky;
    top: 60px; /* Adjust based on header height */
    background: rgba(20, 20, 20, 0.95);
    padding: 15px;
    border-radius: 8px;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  }
  .search-bar {
    padding: 10px 15px;
    border: 1px solid #444;
    border-radius: 25px;
    background: #222;
    color: white;
    font-size: 16px;
    width: 100%;
    max-width: 300px;
    transition: all 0.3s ease;
  }
  .search-bar:focus {
    border-color: #e62e00;
    box-shadow: 0 0 8px rgba(230, 46, 0, 0.3);
    outline: none;
  }
  .type-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .type-btn {
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    color: white;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .type-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
  }
  .type-btn.all {
    background: #222;
    border: 1px solid #ffffff;
  }
  .type-btn.hackathon {
    background: #222;
    border: 1px solid #e62e00;

  }
  .type-btn.workshop {
    background: #222;
    border: 1px solid #0400d4;

  }
  .type-btn.summit {
    background: #222;
    border: 1px solid #058516;

  }
  .filter-dropdown {
    position: relative;
    display: inline-flex;
    align-items: center;
  }
  .filter-btn {
    background: #222;
    border: 1px solid #ffffff;
    padding: 10px 20px;
    border-radius: 20px;
    color: white;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .filter-btn:hover {
    background: linear-gradient(135deg, #00d4d4, #00b4b4);
    box-shadow: 0 3px 10px rgba(0, 180, 180, 0.4);
    transform: translateY(-2px);
  }
  .dropdown-content {
    position: absolute;
    top: 100%;
    left: 0;
    background: #1a1a1a;
    border: 1px solid #78039b;
    border-radius: 8px;
    padding: 15px;
    z-index: 10;
    min-width: 220px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  }
  .filter-section {
    margin-bottom: 15px;
  }
  .filter-section h4 {
    font-size: 14px;
    color: #ccc;
    margin: 0 0 8px 0;
    text-transform: uppercase;
  }
  .filter-section select {
    width: 100%;
    padding: 8px;
    background: #222;
    border: 1px solid #444;
    border-radius: 4px;
    color: white;
    font-size: 14px;
    transition: all 0.3s ease;
  }
  .filter-section select:focus {
    border-color: #e62e00;
    box-shadow: 0 0 5px rgba(230, 46, 0, 0.3);
    outline: none;
  }
  .reset-btn {
    background: #e62e00;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    color: white;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
  }
  .reset-btn:hover {
    background: #ff4500;
    box-shadow: 0 3px 10px rgba(230, 46, 0, 0.4);
    transform: translateY(-2px);
  }
  .past-btn {
    background: #222;
    border: 1px solid #ffffff;
    padding: 10px 20px;
    border-radius: 20px;
    color: white;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .past-btn:hover {
    background: linear-gradient(135deg, #00d4d4, #00b4b4);
    box-shadow: 0 3px 10px rgba(0, 180, 180, 0.4);
    transform: translateY(-2px);
  }

  .quarter-nav {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 30px;
  }
  .quarter-nav button {
    background: #222;
    border: 1px solid #ffffff8a;
    padding: 8px 16px;
    border-radius: 20px;
    color: white;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .quarter-nav button:hover {
    background: #e62e00;
    box-shadow: 0 3px 10px rgba(230, 46, 0, 0.4);
    transform: translateY(-2px);
  }

  .timeline-container {
    display: flex;
    flex-direction: column;
    gap: 50px;
  }
  .quarter-timeline {
    position: relative;
    background: rgba(20, 20, 20, 0.8);
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
  .quarter-timeline h3 {
    font-size: 20px;
    margin-bottom: 15px;
    color: #e62e00;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .month-labels {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .month-label {
    font-size: 16px;
    font-weight: bold;
    color: #ccc;
    text-transform: uppercase;
    flex: 1;
    text-align: center;
  }
  .timeline {
    position: relative;
    height: 120px;
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
  }
  .timeline-line {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 6px;
    background: linear-gradient(90deg, #78039b, #e62e00);
    transform: translateY(-50%);
    z-index: 0;
    box-shadow: 0 0 10px rgba(230, 46, 0, 0.3);
  }
  .week-stripe {
    position: absolute;
    top: 42px;
    height: 20px;
    width: 4px;
    background: rgba(230, 46, 0, 0.2);
    z-index: 1;
  }
  .event-marker {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 3;
  }
  .event-marker.hackathon .marker-dot {
    background: #e62e00;
  }
  .event-marker.workshop .marker-dot {
    background: #0400d4;
  }
  .event-marker.summit .marker-dot {
    background: #058516;
  }
  .marker-dot {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: transform 0.3s ease;
  }
  .inner-dot {
    width: 12px;
    height: 12px;
    background: #fff;
    border-radius: 50%;
    transition: all 0.3s ease;
  }
  .event-marker:hover .marker-dot {
    transform: scale(1.2);
    box-shadow: 0 0 10px rgba(230, 46, 0, 0.5);
  }
  .event-marker:hover .inner-dot {
    background: #e62e00;
  }
  .event-details {
    background: rgba(30, 30, 30, 0.95);
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #e62e00;
    width: 280px;
    position: absolute;
    top: -140px;
    left: 20px;
    z-index: 4;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  }
  .event-marker.visible .event-details {
    display: block;
  }
  .event-details h3 {
    font-size: 18px;
    margin: 0 0 10px 0;
    color: #e62e00;
  }
  .event-details p {
    font-size: 14px;
    margin: 5px 0;
    color: #ccc;
  }
  .event-details .desc {
    font-style: italic;
    color: #aaa;
  }
  .tag {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    color: #fff;
  }
  .tag.hackathon {
    background: #e62e00;
  }
  .tag.workshop {
    background: #0400d4;
  }
  .tag.summit {
    background: #058516;
  }
  .share-btn {
    background: #78039b;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    color: white;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 10px;
    width: 100%;
  }
  .share-btn:hover {
    background: #00d4d4;
    box-shadow: 0 3px 10px rgba(0, 180, 180, 0.4);
    transform: translateY(-2px);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .page-intro h1 {
      font-size: 28px;
    }
    .events-timeline h2 {
      font-size: 22px;
    }
    .sticky-controls {
      flex-direction: column;
      align-items: stretch;
    }
    .search-bar {
      max-width: 100%;
    }
    .type-buttons {
      flex-direction: column;
    }
    .timeline {
      height: 150px;
    }
    .event-details {
      width: 200px;
      top: -160px;
      left: 10px;
      font-size: 12px;
    }
    .event-details h3 {
      font-size: 16px;
    }
    .quarter-nav {
      flex-wrap: wrap;
      gap: 10px;
    }
  }
</style>