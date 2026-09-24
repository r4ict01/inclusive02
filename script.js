const durationSelect = document.querySelector("#duration");
const soundSelect = document.querySelector("#sound");
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
let displayTimerId = null;
let deadline = null;
let audioContext = null;

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
  window.clearTimeout(timerId);
  window.clearInterval(displayTimerId);
  timerId = null;
  displayTimerId = null;
  deadline = null;
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

  if (!audioContext) audioContext = new AudioContext();
  if (audioContext.state === "suspended") audioContext.resume();

  const now = audioContext.currentTime;
  const sound = soundSelect.value;
  const frequencies = {
    bell: [660, 880],
    ping: [880, 660],
    chime: [523.25, 659.25, 783.99],
  }[sound] || [660, 880];
  const duration = sound === "chime" ? 1.05 : 0.7;
  const interval = duration + 0.18;

  for (let repeat = 0; repeat < 3; repeat += 1) {
    const startTime = now + repeat * interval;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = sound === "ping" ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(frequencies[0], startTime);
    frequencies.slice(1).forEach((frequency, index) => {
      oscillator.frequency.setValueAtTime(frequency, startTime + (index + 1) * 0.16);
    });
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.25, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }
}

function prepareAudio() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  if (!audioContext) audioContext = new AudioContext();
  if (audioContext.state === "suspended") audioContext.resume();
}

function updateRemainingDisplay() {
  if (!deadline) return;

  const nextRemaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  if (nextRemaining !== remainingSeconds) {
    remainingSeconds = nextRemaining;
    updateDisplay();
  }
}

function resetTimer() {
  window.clearTimeout(timerId);
  window.clearInterval(displayTimerId);
  timerId = null;
  displayTimerId = null;
  deadline = null;
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
    window.clearTimeout(timerId);
    window.clearInterval(displayTimerId);
    timerId = null;
    displayTimerId = null;
    if (deadline) {
      remainingSeconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      updateDisplay();
    }
    deadline = null;
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
  prepareAudio();
  deadline = Date.now() + remainingSeconds * 1000;
  timerId = window.setTimeout(finishTimer, remainingSeconds * 1000);
  displayTimerId = window.setInterval(updateRemainingDisplay, 100);
}

durationSelect.addEventListener("change", resetTimer);
soundSelect.addEventListener("change", () => {
  if (!timerId) return;
  prepareAudio();
});
startButton.addEventListener("click", toggleTimer);
resetButton.addEventListener("click", resetTimer);
updateDisplay();
