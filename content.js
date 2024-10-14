let timeSpent = 0;
let isActive = true;
let intervalId;
let wellSpent = false;
let studyTime = 3600;

// Create a timer display
const timerContainer = document.createElement("div");
timerContainer.style.position = "fixed";
timerContainer.style.top = "10px";
timerContainer.style.right = "10px";
timerContainer.style.padding = "10px";
timerContainer.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
timerContainer.style.color = "white";
timerContainer.style.fontSize = "16px";
timerContainer.style.zIndex = "9999";
timerContainer.style.fontFamily = "Arial, sans-serif";
timerContainer.style.display = "flex";
timerContainer.style.alignItems = "center";
document.body.appendChild(timerContainer);

// Timer display
const timerDisplay = document.createElement("div");
timerDisplay.style.marginRight = "10px";
timerContainer.appendChild(timerDisplay);

// Reset button
const resetButton = document.createElement("button");
resetButton.textContent = "Reset Timer";
resetButton.style.padding = "5px";
resetButton.style.fontSize = "14px";
resetButton.style.cursor = "pointer";
resetButton.style.backgroundColor = "#ff6666";
resetButton.style.color = "white";
resetButton.style.border = "none";
resetButton.style.borderRadius = "4px";
timerContainer.appendChild(resetButton);

// Load stored time and status when the page is loaded
chrome.storage.local.get(["timeSpent", "WellSpent"], (data) => {
  if (data.timeSpent) {
    timeSpent = data.timeSpent;
  }
  if (data.WellSpent) {
    wellSpent = data.WellSpent;
  }
  updateDisplay();
  startTimer();
});

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
        // 1 hour
        saveWellSpent(true);
        wellSpent = true;
      }
    }
  }, 1000);
}

// Update the timer display
function updateDisplay() {
  timerDisplay.textContent = `Time spent: ${Math.floor(timeSpent / 60)}m ${
    timeSpent % 60
  }s - Well Spent: ${wellSpent}`;
}

// Save Well Spent status
function saveWellSpent(value) {
  chrome.storage.local.set({ WellSpent: value }, () => {
    console.log(`Well Spent set to ${value}`);
  });
}

// Reset button functionality
resetButton.addEventListener("click", () => {
  timeSpent = 0;
  wellSpent = false;
  chrome.storage.local.set(
    { timeSpent: 0, WellSpent: false, ForceEnabled: false },
    () => {
      console.log("Timer reset and Well Spent set to false");
    }
  );
  updateDisplay();
});

// Activity reset function to track user interactions
function resetActivityTimer() {
  isActive = true;
}
