// app.js
document.addEventListener('DOMContentLoaded', () => {
  const ledStage = document.getElementById('ledStage');
  // create animated floating LEDs for hero
  for (let i = 0; i < 24; i++) {
    const d = document.createElement('div');
    d.className = 'led';
    d.style.margin = '6px';
    ledStage.appendChild(d);
  }

  // small loop to pulse random LEDs
  setInterval(() => {
    const leds = Array.from(ledStage.children);
    leds.forEach(l => l.classList.remove('on'));
    const idx = Math.floor(Math.random() * leds.length);
    leds[idx].classList.add('on');
  }, 380);

  // fetch leaderboard
  loadLeaderboard();

  // Play Demo button scrolls to game and starts demo
  document.getElementById('playDemo').addEventListener('click', () => {
    document.getElementById('game').scrollIntoView({ behavior: 'smooth' });
    startDemoSequence();
  });
});

async function loadLeaderboard() {
  try {
    const res = await fetch('/api/leaderboard');
    const data = await res.json();
    const list = document.getElementById('leaderList');
    list.innerHTML = '';

    // ✅ Remove manual numbering here
    data.slice(0, 10).forEach((p) => {
      const li = document.createElement('li');
      li.textContent = `${p.name} — ${p.score}`;
      list.appendChild(li);
    });
  } catch (e) {
    console.warn('Leaderboard load failed', e);
  }
}

function startDemoSequence() {
  // triggers a small in-page demo in game.js
  if (window.Game) window.Game.startDemo();
}

