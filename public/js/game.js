// game.js
// Simple rhythm LED game logic with audio integration (desktop + mobile ready)

window.Game = (function(){
  const LED_COUNT = 8;
  const bpmBase = 100; // base speed
  let interval = null;
  let position = 0;
  let playing = false;
  let score = 0;
  let totalHits = 0;
  let beats = [];
  let speedMs = 600; // derived from bpm

  // audio
  const kickSound = new Audio('/assets/sounds/kick.wav');
  const snareSound = new Audio('/assets/sounds/snare.wav');
  const hihatSound = new Audio('/assets/sounds/hihat.wav');
  const failSound = new Audio('/assets/sounds/fail.wav');      
  const gameoverSound = new Audio('/assets/sounds/gameover.wav'); 

  const ledRow = document.getElementById('ledRow');
  const startBtn = document.getElementById('startBtn');
  const submitBtn = document.getElementById('submitScore');
  const playerInput = document.getElementById('playerName');
  const scoreDisplay = document.getElementById('scoreDisplay');

  // create LEDs
  for (let i=0;i<LED_COUNT;i++){
    const d = document.createElement('div');
    d.className = 'led';
    ledRow.appendChild(d);
  }
  const leds = ledRow.children;

  // start/stop button
  startBtn.addEventListener('click', () => {
    if (!playing) startGame();
    else stopGame();
  });

  submitBtn.addEventListener('click', submitScore);

  // desktop key listener
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      registerHit();
    }
  });

  // mobile: tap on LED row counts as hit
  ledRow.addEventListener('click', registerHit);

  // mobile: tap anywhere on screen to start/stop
  window.addEventListener('touchstart', (e) => {
    if (!playing) startGame();
    else stopGame();
  });

  function startGame(){
    playing = true;
    score = 0; totalHits = 0;
    position = 0;
    speedMs = Math.max(200, 600 - (Math.floor(Math.random()*3)*80));
    startBtn.textContent = 'Stop';
    submitBtn.disabled = true;

    beats = new Array(LED_COUNT).fill(false);
    for (let i=0;i<LED_COUNT;i++){
      beats[i] = Math.random() < 0.45; 
    }
    beats[0] = true; // first beat

    interval = setInterval(tick, speedMs);
  }

  function stopGame(){
    playing = false;
    clearInterval(interval);
    startBtn.textContent = 'Start';
    submitBtn.disabled = false;
    gameoverSound.play();
  }

  function tick(){
    for (let i=0;i<leds.length;i++){
      leds[i].classList.remove('on');
      leds[i].style.opacity = beats[i] ? 0.9 : 0.45;
    }
    leds[position].classList.add('on');
    hihatSound.cloneNode().play();
    position = (position + 1) % LED_COUNT;
  }

  function registerHit(){
    if (!playing) return;

    const prev = (position - 1 + LED_COUNT) % LED_COUNT;
    totalHits++;
    let deltaScore = 0;

    if (beats[prev]) {
      deltaScore = 100 + Math.floor(Math.random()*50);
      kickSound.cloneNode().play();
    } else {
      deltaScore = -20;
      failSound.cloneNode().play();
    }

    score = Math.max(0, score + deltaScore);
    scoreDisplay.textContent = `Score: ${score}`;
    leds[prev].classList.add('on');
  }

  async function submitScore(){
    const name = (playerInput.value || 'Anonymous').trim();
    const payload = { name, score };
    try {
      await fetch('/api/score', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      alert('Score submitted — nice! Check leaderboard below.');
      if (window.fetch) {
        fetch('/api/leaderboard').then(r=>r.json()).then(data=>{
          const list = document.getElementById('leaderList');
          list.innerHTML='';
          data.slice(0,10).forEach((p,i)=>{
            const li = document.createElement('li');
            li.textContent = `${i+1}. ${p.name} — ${p.score}`;
            list.appendChild(li);
          });
        });
      }
      submitBtn.disabled = true;
    } catch (e) {
      alert('Failed to submit score. Make sure backend is running.');
    }
  }

  function startDemo(){
    if (playing) return;
    startGame();
    setTimeout(()=>{ stopGame(); }, 14000);
  }

  return {
    startGame, stopGame, startDemo
  };
})();
