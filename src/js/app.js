/* eslint-disable no-restricted-globals, no-param-reassign, no-new */
import P5 from 'p5';
import volumeOnIcon from '../img/volume-on.svg';
import volumeOffIcon from '../img/volume-off.svg';
import clockIcon from '../img/clock.svg';
import deleteIcon from '../img/delete.svg';

// Inputs
const hoursInput = document.getElementById('hours');
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');

// Buttons
const startButton = document.querySelector('button[value="start"]');
const resetButton = document.querySelector('button[value="reset"]');
const resumeButton = document.querySelector('button[value="resume"]');
const pauseButton = document.querySelector('button[value="pause"]');

// Other Elements
const errorElement = document.getElementById('error');
const formWrapper = document.querySelector('form');
const volumeElement = document.getElementById('volume');
const audioElement = document.querySelector('audio');
const mainElement = document.querySelector('main');
const pastTimersElement = document.querySelector('section#pastTimers');
const TimerStatus = {
  RESET: 'reset',
  PAUSE: 'pause',
  START: 'start',
};
const VolumeStatus = {
  ON: 'on',
  OFF: 'off',
};

// Timer related global variables
let timer = 0;
let maxTimer = 0;
let timerStatus = TimerStatus.RESET;
let volumeStatus = VolumeStatus.ON;

const setErrorState = () => {
  errorElement.innerText = 'Invalid Time';
  pauseButton.style.display = 'none';
  resumeButton.style.display = 'none';
  startButton.style.display = 'inline-block';
  resetButton.style.display = 'inline-block';
  formWrapper.classList.add('error');
};

const validateTime = () => {
  const hours = Number(hoursInput.value);
  const minutes = Number(minutesInput.value);
  const seconds = Number(secondsInput.value);
  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
    setErrorState();
    return null;
  }
  const timerValue = (hours * 60 * 60) + (minutes * 60) + seconds;
  if (timerValue === 0) {
    setErrorState();
    return null;
  }
  formWrapper.classList.remove('error');
  errorElement.innerText = '';
  return timerValue;
};

const updateTimer = (timerValue) => {
  const hours = Math.floor(timerValue / 3600);
  const minutes = Math.floor((timerValue % 3600) / 60);
  const seconds = Math.floor((timerValue % 3600) % 60);
  hoursInput.value = hours > 9 ? hours : `0${hours}`;
  minutesInput.value = minutes > 9 ? minutes : `0${minutes}`;
  secondsInput.value = seconds > 9 ? seconds : `0${seconds}`;
};

function updatePastTimers() {
  const pastTimers = localStorage.pastTimers && JSON.parse(localStorage.pastTimers);
  if (pastTimers) {
    pastTimersElement.innerHTML = pastTimers.map((t, index) => {
      let hours = Math.floor(t / 3600);
      let minutes = Math.floor((t % 3600) / 60);
      let seconds = Math.floor((t % 3600) % 60);
      hours = hours > 9 ? hours : `0${hours}`;
      hours = hours === '00' ? '' : `${hours}:`;
      minutes = minutes > 9 ? minutes : `0${minutes}`;
      seconds = seconds > 9 ? seconds : `0${seconds}`;
      return `
        <div class="past-timer">
          <p>
            ${hours}
            ${minutes}:
            ${seconds}
          </p>
          <a href="#" class="clock-icon" data-value="${t}">
            <img src="${clockIcon}" alt="Clock Icon" />
          </a>
          <a href="#" class="delete-icon" data-value="${index}">
            <img src="${deleteIcon}" alt="Delete Icon" />
          </a>
        </div>
      `;
    }).join('');
    // eslint-disable-next-line
    updatePastTimerEventListeners();
  }
}

function updatePastTimerEventListeners() {
  document.querySelectorAll('a.clock-icon').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      updateTimer(link.dataset.value);
      startButton.click();
      updatePastTimers();
    });
  });
  document.querySelectorAll('a.delete-icon').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      let { pastTimers } = localStorage;
      pastTimers = JSON.parse(pastTimers);
      pastTimers.splice(link.dataset.value, 1);
      localStorage.pastTimers = JSON.stringify(pastTimers);
      updatePastTimers();
    });
  });
}

const addToLocalStorage = (value) => {
  let { pastTimers } = localStorage;
  pastTimers = pastTimers && JSON.parse(pastTimers);
  if (!pastTimers) {
    pastTimers = [];
  }
  pastTimers.unshift(value);
  if (pastTimers.length > 3) {
    pastTimers.pop();
  }
  localStorage.pastTimers = JSON.stringify(pastTimers);
  updatePastTimers();
};

startButton.addEventListener('click', (e) => {
  e.preventDefault();
  const timerValue = validateTime();
  if (timerValue) {
    addToLocalStorage(timerValue);
    timer = timerValue;
    maxTimer = timer;
    timerStatus = TimerStatus.START;
    startButton.style.display = 'none';
    resetButton.style.display = 'none';
    resumeButton.style.display = 'none';
    pauseButton.style.display = 'inline-block';
    hoursInput.disabled = true;
    minutesInput.disabled = true;
    secondsInput.disabled = true;
    window.onbeforeunload = (event) => {
      const message = 'Your timer is still running, Do you really want to close the window?';
      event = event || window.event;
      // For IE and Firefox prior to version 4
      if (event) {
        event.returnValue = message;
      }
      // For Safari
      return message;
    };
  }
});

pauseButton.addEventListener('click', (e) => {
  e.preventDefault();
  timerStatus = TimerStatus.PAUSE;
  pauseButton.style.display = 'none';
  startButton.style.display = 'none';
  resumeButton.style.display = 'inline-block';
  resetButton.style.display = 'inline-block';
});

resumeButton.addEventListener('click', (e) => {
  e.preventDefault();
  timerStatus = TimerStatus.START;
  resumeButton.style.display = 'none';
  resetButton.style.display = 'none';
  startButton.style.display = 'none';
  pauseButton.style.display = 'inline-block';
});

resetButton.addEventListener('click', (e) => {
  e.preventDefault();
  timerStatus = TimerStatus.RESET;
  timer = 0;
  maxTimer = 0;
  hoursInput.value = '00';
  minutesInput.value = '00';
  secondsInput.value = '00';
  errorElement.innerText = '';
  resetButton.style.display = 'none';
  pauseButton.style.display = 'none';
  resumeButton.style.display = 'none';
  startButton.style.display = 'inline-block';
  hoursInput.disabled = false;
  minutesInput.disabled = false;
  secondsInput.disabled = false;
  audioElement.pause();
  audioElement.currentTime = 0;
  formWrapper.classList.remove('error');
  mainElement.classList.remove('buzz');
  window.onbeforeunload = null;
});

volumeElement.addEventListener('click', () => {
  audioElement.currentTime = 0;
  audioElement.pause();
  if (volumeStatus === VolumeStatus.OFF) {
    volumeStatus = VolumeStatus.ON;
    volumeElement.innerHTML = `
      <img src="${volumeOnIcon}" alt="Sound is On">
      <span>Sound is On</span>`;
    return;
  }
  volumeStatus = VolumeStatus.OFF;
  volumeElement.innerHTML = `
    <img src="${volumeOffIcon}" alt="Muted">
    <span>Muted</span>`;
});

const sketch = (p) => {
  p.setup = () => {
    const canvas = p.createCanvas(375, 375);
    canvas.id('timer-canvas');
    p.angleMode('degrees');
    p.frameRate(1);
    p.strokeWeight(10);
    p.stroke(4, 191, 173);
  };

  p.draw = () => {
    p.background(2, 31, 89);
    p.translate(375 / 2, 375 / 2);
    p.rotate(-90);
    p.noFill();
    if (timerStatus === TimerStatus.RESET) {
      p.arc(0, 0, 375 - 10, 375 - 10, 0, 360);
      return;
    }
    if (timerStatus === TimerStatus.START) {
      timer -= 1;
    }
    if (timer === 0) {
      timerStatus = TimerStatus.PAUSE;
      startButton.style.display = 'none';
      pauseButton.style.display = 'none';
      resumeButton.style.display = 'none';
      resetButton.style.display = 'inline-block';
      secondsInput.value = '00';
      if (!mainElement.classList.contains('buzz')) {
        mainElement.classList.add('buzz');
      }
      if (volumeStatus === VolumeStatus.ON) {
        audioElement.play();
      }
      return;
    }
    const end = p.map(timer, 0, maxTimer, 0, 360);
    p.arc(0, 0, 375 - 10, 375 - 10, 0, end);
    updateTimer(timer);
  };
};

new P5(sketch, 'target');
updatePastTimers();
