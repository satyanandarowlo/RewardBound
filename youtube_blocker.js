let blockTime = 300000; // 5 minutes

// Function to inject the blocked message directly into the YouTube page
function displayBlockedMessage() {
  document.body.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background-color: rgba(0, 0, 0, 0.9); color: white;">
        <div style="text-align: center;">
          <h1>YouTube is Blocked</h1>
          <p>You haven't spent sufficient time on the preparation.</p>
          <label style="display: flex; justify-content: center; align-items: center;">
            <input type="checkbox" id="forceCheckbox" style="margin-right: 10px; width: 20px; height: 20px;" />
            <span style="font-size: 18px;">Force access</span>
          </label>
          <button id="applyForce" style="margin-top: 20px; padding: 10px 20px; font-size: 16px;">Apply and Go to YouTube</button>
        </div>
      </div>
    `;

  // Add event listener for "Force Access" button
  document.getElementById("applyForce").addEventListener("click", () => {
    const forceEnabled = document.getElementById("forceCheckbox").checked;

    // Save ForceEnabled state in local storage
    chrome.storage.local.set({ ForceEnabled: forceEnabled }, () => {
      console.log(`Force is now ${forceEnabled ? "enabled" : "disabled"}`);
      // Reload the YouTube page
      window.location.reload();
    });
  });
}

// Function to check Well Spent and decide whether to block YouTube
function checkAccess() {
  chrome.storage.local.get(["WellSpent", "ForceEnabled"], (data) => {
    const wellSpent = data.WellSpent || false;
    const forceEnabled = data.ForceEnabled || false;

    if (forceEnabled) {
      console.log("Force is enabled, allowing YouTube for 5 minutes.");
      setTimeout(displayBlockedMessage, blockTime); // Allow YouTube for 5 minutes, then block
    } else if (!wellSpent) {
      console.log("Well Spent is false, displaying blocked message.");
      displayBlockedMessage(); // Display blocked message if Well Spent is false
    } else {
      console.log("Well Spent is true, allowing YouTube for 5 seconds.");
      setTimeout(displayBlockedMessage, blockTime); // Allow YouTube for 5 minutes, then block
    }
  });
}

// Call checkAccess when the page loads
checkAccess();
