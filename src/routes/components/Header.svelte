<script>
  let walletAddress = null; // Store the connected wallet address
  let isConnected = false; // Track connection status

  // Chain information for Akash Network (Mainnet)
  const akashChainInfo = {
    chainId: "akashnet-2", // Akash Mainnet chain ID
    chainName: "Akash Network",
    rpc: "https://rpc.akash.network:443", // Akash RPC endpoint
    rest: "https://api.akash.network:443", // Akash REST endpoint
    bip44: { coinType: 118 }, // Cosmos coin type
    bech32Config: {
      bech32PrefixAccAddr: "akash",
      bech32PrefixAccPub: "akashpub",
      bech32PrefixValAddr: "akashvaloper",
      bech32PrefixValPub: "akashvaloperpub",
      bech32PrefixConsAddr: "akashvalcons",
      bech32PrefixConsPub: "akashvalconspub",
    },
    currencies: [
      {
        coinDenom: "AKT",
        coinMinimalDenom: "uakt",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "AKT",
        coinMinimalDenom: "uakt",
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.01,
          average: 0.025,
          high: 0.04,
        },
      },
    ],
    stakeCurrency: {
      coinDenom: "AKT",
      coinMinimalDenom: "uakt",
      coinDecimals: 6,
    },
    coinType: 118,
    features: ["ibc-transfer", "ibc-go"], // Supported features
  };

  // Function to connect to Keplr wallet
  async function connectWallet() {
    try {
      // Check if we're in a browser environment and Keplr is installed
      if (typeof window === "undefined" || !window.keplr) {
        alert("Please install the Keplr wallet extension.");
        return;
      }

      // Suggest the Akash chain to Keplr (if not already added)
      await window.keplr.experimentalSuggestChain(akashChainInfo);

      // Enable the Akash chain
      await window.keplr.enable(akashChainInfo.chainId);

      // Get the offline signer for signing transactions
      const offlineSigner = window.keplr.getOfflineSigner(akashChainInfo.chainId);

      // Get the user's accounts
      const accounts = await offlineSigner.getAccounts();

      if (accounts.length === 0) {
        alert("No accounts found in Keplr wallet.");
        return;
      }

      // Store the first account's address
      walletAddress = accounts[0].address;
      isConnected = true;

      console.log("Connected to Keplr wallet:", walletAddress);
    } catch (error) {
      console.error("Error connecting to Keplr wallet:", error);
      if (error.message.includes("There is no chain info")) {
        alert("Failed to connect: Akash Network chain info not found in Keplr.");
      } else if (error.message.includes("user rejected")) {
        alert("Connection rejected by user.");
      } else {
        alert("Failed to connect to Keplr wallet. Please ensure it is unlocked and try again.");
      }
    }
  }

  // Function to disconnect wallet
  function disconnectWallet() {
    walletAddress = null;
    isConnected = false;
    console.log("Disconnected from Keplr wallet");
  }

  // Handle wallet button click
  function handleWalletButtonClick() {
    if (isConnected) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  }
</script>

<header class="header">
  <div class="auth-buttons">
    <button class="connect-wallet-btn" on:click={handleWalletButtonClick}>
      {#if isConnected}
        {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Disconnect"}
      {:else}
        Connect Wallet
      {/if}
    </button>
    <div class="dropdown auth-dropdown">
      <button class="sign-in-btn">Sign In</button>
      <div class="dropdown-content">
        <button class="nav-btn">Sign In</button>
        <button class="nav-btn">Sign Up</button>
      </div>
    </div>
    <div class="profile">AM</div>
  </div>
</header>

<style>
  .header {
    display: flex;
    justify-content: flex-end;
    background: #141414;
    padding: 15px 30px;
    border-bottom: 3px solid #e62e00;
    transition: all 0.3s ease;
    margin-left: 190px;
    height: 60px;
    width: calc(100% - 190px); /* Adjust width to fit beside sidebar */
    position: fixed; /* Ensure it stays at the top */
    top: 0;
    right: 0;
    z-index: 50; /* Below sidebar but above content */
  }
  .auth-buttons {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .sign-in-btn {
    background: #141414;
    border: 1px solid #e62e00;
    padding: 6px 12px;
    border-radius: 5px;
    color: #ffffff;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .sign-in-btn:hover {
    background: #e62e00;
    color: #ffffff;
    box-shadow: 0 5px 15px rgba(230, 46, 0, 0.4);
  }
  .connect-wallet-btn {
    background: #e62e00;
    border: none;
    padding: 6px 12px;
    border-radius: 5px;
    color: #ffffff;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .connect-wallet-btn:hover {
    background: #ffffff;
    color: #e62e00;
    box-shadow: 0 5px 15px rgba(230, 46, 0, 0.4);
  }
  .dropdown {
    position: relative;
    display: inline-block;
  }
  .dropdown-content {
    position: absolute;
    background-color: #141414;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
    border-radius: 6px;
    border: 1px solid #e62e00;
    top: 100%;
    left: 0;
    margin-top: 5px;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease, visibility 0s linear 0.5s;
  }
  .dropdown-content .nav-btn {
    width: 100%;
    text-align: left;
    margin: 0;
    padding: 10px 16px;
  }
  .dropdown-content .nav-btn:hover {
    background-color: rgba(230, 46, 0, 0.1);
    color: #ffffff;
  }
  .dropdown:hover .dropdown-content {
    opacity: 1;
    visibility: visible;
    transition: opacity 0.2s ease;
  }
  .auth-dropdown .dropdown-content {
    right: 0;
    left: auto;
  }
  .profile {
    background: #222;
    border: 2px solid #e62e00;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.3s ease;
  }
  .profile:hover {
    transform: scale(1.1);
    box-shadow: 0 0 15px rgba(230, 46, 0, 0.5);
    background: #e62e00;
    cursor: pointer;
  }
</style>