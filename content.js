let timeSpent = 0;
let isActive = true;
let intervalId;
let wellSpent = false;
let studyTime = 3600; // Default study time set to 1 hour
let grantedReward = 0; // Initialize GrantedReward to 0

// Create a timer display container (draggable)
const timerContainer = document.createElement("div");
timerContainer.style.position = "fixed";
timerContainer.style.top = "10px";
timerContainer.style.right = "10px";
timerContainer.style.padding = "8px";
timerContainer.style.width = "200px";
timerContainer.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
timerContainer.style.color = "white";
timerContainer.style.fontSize = "12px"; // Reduce font size for a more compact display
timerContainer.style.zIndex = "9999";
timerContainer.style.fontFamily = "Arial, sans-serif";
timerContainer.style.display = "flex";
timerContainer.style.flexDirection = "column";
timerContainer.style.alignItems = "flex-start";
timerContainer.style.border = "1px solid #fff";
timerContainer.style.borderRadius = "5px";
timerContainer.style.cursor = "move"; // Add move cursor to indicate it's draggable
document.body.appendChild(timerContainer);

// Timer display
const timerDisplay = document.createElement("div");
timerDisplay.style.marginBottom = "8px"; // Reduced margin for compactness
timerContainer.appendChild(timerDisplay);

// Reset button
const resetButton = document.createElement("button");
resetButton.textContent = "Reset Timer";
resetButton.style.padding = "4px";
resetButton.style.fontSize = "12px";
resetButton.style.cursor = "pointer";
resetButton.style.backgroundColor = "#ff6666";
resetButton.style.color = "white";
resetButton.style.border = "none";
resetButton.style.borderRadius = "4px";
resetButton.style.marginBottom = "8px";
timerContainer.appendChild(resetButton);

// Dropdown for selecting study time
const studyTimeDropdown = document.createElement("select");
studyTimeDropdown.style.padding = "4px";
studyTimeDropdown.style.fontSize = "12px";
studyTimeDropdown.style.marginBottom = "8px";
const options = [
  { label: "1 hour (Reward: 6 mins)", value: 3600 },
  { label: "2 hours (Reward: 12 mins)", value: 7200 },
  { label: "3 hours (Reward: 18 mins)", value: 10800 },
  { label: "4 hours (Reward: 24 mins)", value: 14400 },
  { label: "5 hours (Reward: 30 mins)", value: 18000 },
];
options.forEach((opt) => {
  const option = document.createElement("option");
  option.textContent = opt.label;
  option.value = opt.value;
  studyTimeDropdown.appendChild(option);
});
studyTimeDropdown.value = studyTime; // Default to 1 hour
timerContainer.appendChild(studyTimeDropdown);

// Draggable functionality
let isDragging = false;
let offsetX, offsetY;

timerContainer.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - timerContainer.getBoundingClientRect().left;
  offsetY = e.clientY - timerContainer.getBoundingClientRect().top;
  timerContainer.style.cursor = "grabbing"; // Change cursor while dragging
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    timerContainer.style.left = `${e.clientX - offsetX}px`;
    timerContainer.style.top = `${e.clientY - offsetY}px`;
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  timerContainer.style.cursor = "move"; // Restore cursor
});

// Load stored time, status, study time, and granted reward when the page is loaded
chrome.storage.local.get(
  ["timeSpent", "WellSpent", "StudyTime", "GrantedReward"],
  (data) => {
    if (data.timeSpent) {
      timeSpent = data.timeSpent;
    }
    if (data.WellSpent) {
      wellSpent = data.WellSpent;
    }
    if (data.StudyTime) {
      studyTime = data.StudyTime;
      studyTimeDropdown.value = studyTime;
    }
    if (data.GrantedReward) {
      grantedReward = data.GrantedReward;
    }
    updateDisplay();
    startTimer();
  }
);

// Track visibility and user activity
document.addEventListener("visibilitychange", () => {
  isActive = !document.hidden;
});

document.addEventListener("mousemove", resetActivityTimer);
document.addEventListener("keydown", resetActivityTimer);
document.addEventListener("click", resetActivityTimer);

// Start counting time spent on the webpage
function startTimer() {
  intervalId = setInterval(() => {
    if (isActive) {
      timeSpent++;
      updateDisplay();
      chrome.storage.local.set({ timeSpent: timeSpent }); // Save time spent
      if (timeSpent >= studyTime && !wellSpent) {
        // Reached the study goal
        const rewardMinutes = (studyTime * 0.1) / 60;
        grantedReward = rewardMinutes; // Set GrantedReward
        chrome.storage.local.set({ GrantedReward: grantedReward });
        saveWellSpent();
        wellSpent = true;
      }
    }
  }, 1000);
}

// Update the timer display
function updateDisplay() {
  const rewardMinutes = (studyTime * 0.1) / 60; // Reward is 10% of effort
  timerDisplay.textContent = `Time: ${Math.floor(timeSpent / 60)}m ${
    timeSpent % 60
  }s - Well Spent: ${wellSpent} (Reward: ${rewardMinutes.toFixed(
    1
  )} mins) - Granted Reward: ${grantedReward.toFixed(1)} mins`;
}

// Save Well Spent status
function saveWellSpent() {
  chrome.storage.local.set({ WellSpent: true, TotalYoutubeTime: 0 }, () => {
    console.log(
      `Well Spent set to true and GrantedReward set to ${grantedReward}`
    );
  });
}

// Reset button functionality
resetButton.addEventListener("click", () => {
  timeSpent = 0;
  wellSpent = false;
  grantedReward = 0; // Reset GrantedReward
  chrome.storage.local.set(
    { timeSpent: 0, WellSpent: false, GrantedReward: 0, ForceEnabled: false },
    () => {
      console.log(
        "Timer reset, Well Spent set to false, and GrantedReward reset"
      );
    }
  );
  updateDisplay();
});

// Activity reset function to track user interactions
function resetActivityTimer() {
  isActive = true;
}

// Update study time when the dropdown value changes
studyTimeDropdown.addEventListener("change", (event) => {
  studyTime = parseInt(event.target.value);
  const rewardMinutes = (studyTime * 0.1) / 60; // Calculate reward minutes
  chrome.storage.local.set(
    { StudyTime: studyTime, RewardMinutes: rewardMinutes },
    () => {
      console.log(
        `Study time set to ${studyTime} seconds, Reward: ${rewardMinutes.toFixed(
          1
        )} mins`
      );
    }
  );
  updateDisplay();
});
