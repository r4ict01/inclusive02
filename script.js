const durationSelect = document.querySelector("#duration");
const startButton = document.querySelector("#startButton");
const resetButton = document.querySelector("#resetButton");
const timeDisplay = document.querySelector("#time");
const statusDisplay = document.querySelector("#status");
const progressRing = document.querySelector(".ring-progress");
const timerCard = document.querySelector(".timer-card");

const radius = 108;
const circumference = 2 * Math.PI * radius;
let totalSeconds = Number(durationSelect.value);
let remainingSeconds = totalSeconds;
let timerId = null;

progressRing.style.strokeDasharray = `${circumference} ${circumference}`;

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

function updateDisplay() {
  const progress = totalSeconds === 0 ? 0 : remainingSeconds / totalSeconds;
  timeDisplay.textContent = formatTime(remainingSeconds);
  progressRing.style.strokeDashoffset = circumference * (1 - progress);
}

function finishTimer() {
  timerId = null;
  remainingSeconds = 0;
  updateDisplay();
  statusDisplay.textContent = "おわり！";
  startButton.textContent = "▶ もういちど";
  timerCard.classList.add("finished");
  document.title = "おわり！ - みえるタイマー";
  playBell();
}

function playBell() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.16);
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.25, audioContext.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.7);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.7);
}

function resetTimer() {
  window.clearInterval(timerId);
  timerId = null;
  totalSeconds = Number(durationSelect.value);
  remainingSeconds = totalSeconds;
  updateDisplay();
  statusDisplay.textContent = "じゅんびOK";
  startButton.textContent = "▶ はじめる";
  timerCard.classList.remove("finished");
  document.title = "みえるタイマー";
}

function toggleTimer() {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
    statusDisplay.textContent = "いったん おやすみ";
    startButton.textContent = "▶ つづける";
    return;
  }

  if (remainingSeconds === 0) {
    resetTimer();
  }

  statusDisplay.textContent = "カウント中！";
  startButton.textContent = "Ⅱ とめる";
  timerCard.classList.remove("finished");
  timerId = window.setInterval(() => {
    remainingSeconds -= 1;
    updateDisplay();
    if (remainingSeconds <= 0) finishTimer();
  }, 1000);
}

durationSelect.addEventListener("change", resetTimer);
startButton.addEventListener("click", toggleTimer);
resetButton.addEventListener("click", resetTimer);
updateDisplay();
