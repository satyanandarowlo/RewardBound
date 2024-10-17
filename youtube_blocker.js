let remainingTime; // Will be calculated based on total time spent
let intervalId;
let totalYoutubeTime = 0; // Variable to track total time spent on YouTube
let isActive = true; // Track if the user is currently active on the page
let isBlocked = false; // Track if YouTube is blocked
let grantedReward = 0; // Default value for GrantedReward

// Function to inject the blocked message directly into the YouTube page
function displayBlockedMessage() {
  isBlocked = true; // Mark YouTube as blocked
  const blockedMessageDiv = document.createElement("div");
  blockedMessageDiv.style.position = "fixed";
  blockedMessageDiv.style.top = "0";
  blockedMessageDiv.style.left = "0";
  blockedMessageDiv.style.width = "100%";
  blockedMessageDiv.style.height = "100vh";
  blockedMessageDiv.style.display = "flex";
  blockedMessageDiv.style.justifyContent = "center";
  blockedMessageDiv.style.alignItems = "center";
  blockedMessageDiv.style.backgroundColor = "rgba(0, 0, 0, 1)";
  blockedMessageDiv.style.color = "white";
  blockedMessageDiv.style.zIndex = "9998"; // Lower z-index to keep values div visible

  blockedMessageDiv.innerHTML = `
    <div style="text-align: center;">
      <h1>This Site is Blocked, Focus on Self Development</h1>
      <p>You haven't spent sufficient time on self development.</p>
    </div>
  `;

  document.body.appendChild(blockedMessageDiv);
}

// Function to display the remaining time, total time spent on YouTube, and show values
function displayValuesDiv(remainingTime, totalYoutubeTime) {
  const valuesDiv = document.createElement("div");
  valuesDiv.style.position = "fixed";
  valuesDiv.style.bottom = "10px";
  valuesDiv.style.right = "10px";
  valuesDiv.style.padding = "10px";
  valuesDiv.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  valuesDiv.style.color = "white";
  valuesDiv.style.fontSize = "14px";
  valuesDiv.style.zIndex = "9999"; // Ensure the values div is always on top
  valuesDiv.style.fontFamily = "Arial, sans-serif";

  valuesDiv.innerHTML = `
    <div>
      <p>Time left: <span id="timeLeft">${Math.floor(
        remainingTime / 60
      )}M:${Math.floor(remainingTime % 60)}S</span></p>
      <p>Total Time on Entertainment: <span id="totalYoutubeTime">${Math.floor(
        totalYoutubeTime / 60
      )}M:${Math.floor(totalYoutubeTime % 60)}S</span></p>
      <p>Granted Reward: ${grantedReward} minutes</p>
    </div>
  `;

  document.body.appendChild(valuesDiv);

  // Update remaining time every second
  intervalId = setInterval(() => {
    remainingTime--;
    document.getElementById("timeLeft").textContent =
      Math.floor(remainingTime / 60) +
      "M:" +
      Math.floor(remainingTime % 60) +
      "S";

    // If time is up, block YouTube
    if (remainingTime <= 0) {
      clearInterval(intervalId);
      displayBlockedMessage();
    }
  }, 1000);

  // Update total time spent every second if the user is active and YouTube is not blocked
  setInterval(() => {
    if (isActive && !isBlocked) {
      totalYoutubeTime++;
      document.getElementById("totalYoutubeTime").textContent =
        Math.floor(totalYoutubeTime / 60) +
        "M:" +
        Math.floor(totalYoutubeTime % 60) +
        "S";
      // Save the updated total time to storage
      chrome.storage.local.set({ TotalYoutubeTime: totalYoutubeTime });
    }
  }, 1000);
}

// Function to detect user activity
function resetActivityTimer() {
  isActive = true;
  clearTimeout(activityTimeout);
  activityTimeout = setTimeout(() => {
    isActive = false;
  }, 30000); // Assume the user is inactive if there's no interaction for 30 seconds
}

// Function to check the total time spent and remaining time, and decide whether to block YouTube
function checkAccess() {
  chrome.storage.local.get(["GrantedReward", "TotalYoutubeTime"], (data) => {
    totalYoutubeTime = data.TotalYoutubeTime || 0; // Load the total time spent on YouTube from storage

    // Get GrantedReward from storage or default to 0
    grantedReward = data.GrantedReward || 0; // Default to 0 if GrantedReward is not set
    let rewardSeconds = grantedReward * 60; // Convert GrantedReward (minutes) to seconds

    // Calculate remaining time: rewardSeconds minus the total time already spent
    remainingTime = Math.max(rewardSeconds - totalYoutubeTime, 0);

    // Always display the values div
    displayValuesDiv(remainingTime, totalYoutubeTime);

    if (remainingTime <= 0) {
      console.log("Time is up, displaying blocked message.");
      displayBlockedMessage(); // Display blocked message if time is up
    }
  });
}

// Call checkAccess when the page loads
checkAccess();

// Add listeners to detect user activity (click, keypress, mousemove)
document.addEventListener("mousemove", resetActivityTimer);
document.addEventListener("click", resetActivityTimer);
document.addEventListener("keydown", resetActivityTimer);
document.addEventListener("load", resetActivityTimer);

let activityTimeout = setTimeout(() => {
  isActive = false; // Mark inactive if there's no interaction for a while
}, 30000); // Timeout after 30 seconds of inactivity
