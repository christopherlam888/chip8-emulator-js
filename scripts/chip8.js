import Renderer from "./renderer.js";
import Keyboard from "./keyboard.js";
import Speaker from "./speaker.js";
import CPU from "./cpu.js";

const renderer = new Renderer({ scale: 10 });
const keyboard = new Keyboard();
const speaker = new Speaker();
const cpu = new CPU(renderer, keyboard, speaker);

let loop;

let fps = 60,
  fpsInterval,
  startTime,
  now,
  then,
  elapsed;

function init() {
  fpsInterval = 1000 / fps;
  then = Date.now();
  startTime = then;

  cpu.loadSpritesIntoMemory();
  cpu.loadRom("SUBMARINE");
  loop = requestAnimationFrame(step);
}

function step() {
  now = Date.now();
  elapsed = now - then;

  if (elapsed > fpsInterval) {
    cpu.cycle();
  }

  loop = requestAnimationFrame(step);
}

// Start the emulator
init();

// Runtime settings

const speed_btn = document.getElementById("speed-btn");
speed_btn.addEventListener("click", () => {
  if (cpu.speed === 1) {
    speed_btn.innerHTML = "Speed: 2x";
  } else if (cpu.speed === 2) {
    speed_btn.innerHTML = "Speed: 0.5x";
  } else if (cpu.speed === 0.5) {
    speed_btn.innerHTML = "Speed: 1x";
  }
  cpu.changeSpeed();
});

const pause_btn = document.getElementById("pause-btn");
pause_btn.addEventListener("click", () => {
  if (cpu.paused === true) {
    pause_btn.innerHTML = "Pause";
  } else if (cpu.paused === false) {
    pause_btn.innerHTML = "Play";
  }
  cpu.pauseCPU();
});

const mute_btn = document.getElementById("mute-btn");
mute_btn.addEventListener("click", () => {
  if (cpu.muted) {
    mute_btn.innerHTML = "Mute";
  } else if (!cpu.muted) {
    mute_btn.innerHTML = "Unmute";
  }
  cpu.toggleMute();
});
