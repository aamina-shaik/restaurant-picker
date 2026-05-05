  let restaurants = [];
  let winner = null;
  let isRolling = false;

  const input = document.getElementById('restaurantInput');
  const listEl = document.getElementById('restaurantList');
  const emptyState = document.getElementById('emptyState');
  const pickBtn = document.getElementById('pickBtn');
  const hintText = document.getElementById('hintText');
  const resultBanner = document.getElementById('resultBanner');
  const countBadge = document.getElementById('countBadge');

  input.addEventListener('keydown', e => { if (e.key === 'Enter') addRestaurant(); });

  function esc(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function addRestaurant() {
    const name = input.value.trim();
    if (!name || isRolling) return;
    if (restaurants.find(r => r.toLowerCase() === name.toLowerCase())) {
      input.select();
      input.style.borderColor = 'var(--red)';
      setTimeout(() => input.style.borderColor = '', 600);
      return;
    }
    restaurants.push(name);
    input.value = '';
    winner = null;
    resultBanner.style.display = 'none';
    render();
    input.focus();
  }

  function removeRestaurant(idx) {
    if (isRolling) return;
    restaurants.splice(idx, 1);
    winner = null;
    resultBanner.style.display = 'none';
    render();
  }

  function render() {
    // Count badge
    if (restaurants.length > 0) {
      countBadge.style.display = 'flex';
      countBadge.textContent = restaurants.length;
    } else {
      countBadge.style.display = 'none';
    }

    // Empty state
    emptyState.style.display = restaurants.length === 0 ? 'block' : 'none';

    // List
    listEl.innerHTML = restaurants.map((r, i) => {
      const isW = winner === r;
      const isL = winner && !isW;
      const cls = isW ? 'restaurant-item state-winner' : (isL ? 'restaurant-item state-loser' : 'restaurant-item');
      const tag = isW ? '<span class="winner-tag">Tonight\'s pick</span>' : '';
      return `<div class="${cls}" id="item-${i}">
        <span class="item-num">${String(i+1).padStart(2,'0')}</span>
        <span class="item-name">${esc(r)}${tag}</span>
        <button class="remove-btn" onclick="removeRestaurant(${i})" title="Remove" aria-label="Remove ${esc(r)}">×</button>
      </div>`;
    }).join('');

    // Pick button
    const canPick = restaurants.length >= 2;
    pickBtn.disabled = !canPick;
    hintText.textContent = canPick
      ? (restaurants.length === 2 ? 'Two contenders ready — let\'s go!' : `${restaurants.length} options in the running`)
      : 'Add 2+ restaurants to unlock';
  }

  function pickRandom() {
    if (restaurants.length < 2 || isRolling) return;
    isRolling = true;
    winner = null;
    resultBanner.style.display = 'none';
    pickBtn.classList.add('rolling');
    pickBtn.textContent = 'Deciding…';

    // Roll animation
    let ticks = 0;
    const totalTicks = 18;
    let interval = 80;

    function tick() {
      const shown = restaurants[Math.floor(Math.random() * restaurants.length)];
      const items = listEl.querySelectorAll('.restaurant-item');
      items.forEach((el, i) => {
        el.classList.remove('state-winner','state-loser','state-rolling');
        if (restaurants[i] === shown) el.classList.add('state-rolling');
        else el.classList.add('state-loser');
      });

      ticks++;
      if (ticks < totalTicks) {
        if (ticks > 12) interval = 120 + (ticks - 12) * 30; // slow down
        setTimeout(tick, interval);
      } else {
        // Final pick
        winner = restaurants[Math.floor(Math.random() * restaurants.length)];
        isRolling = false;
        pickBtn.classList.remove('rolling');
        pickBtn.textContent = 'Decide for me';
        render();
        showResult();
        spawnConfetti();
      }
    }

    tick();
  }

  function showResult() {
    resultBanner.style.display = 'block';
    resultBanner.innerHTML = `
      <div class="result-banner">
        <div class="result-eyebrow">✦ Tonight you're going to ✦</div>
        <div class="result-name">${esc(winner)}</div>
        <div class="result-actions">
          <button class="btn-secondary btn-again" onclick="pickAgain()">Pick again</button>
          <button class="btn-secondary btn-reset" onclick="resetAll()">Start over</button>
        </div>
      </div>`;
    resultBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function pickAgain() {
    winner = null;
    resultBanner.style.display = 'none';
    render();
    setTimeout(() => pickRandom(), 100);
  }

  function resetAll() {
    restaurants = [];
    winner = null;
    resultBanner.style.display = 'none';
    render();
    input.focus();
  }

  function spawnConfetti() {
    const colors = ['#C49A3C','#2A6B5E','#B84040','#E8CC80','#5DCAA5'];
    const banner = document.querySelector('.result-banner');
    if (!banner) return;
    for (let i = 0; i < 18; i++) {
      const dot = document.createElement('div');
      dot.className = 'confetti-dot';
      const angle = Math.random() * 360;
      const dist = 40 + Math.random() * 80;
      dot.style.cssText = `
        left: ${40 + Math.random()*20}%;
        top: ${20 + Math.random()*40}%;
        background: ${colors[Math.floor(Math.random()*colors.length)]};
        --tx: ${Math.cos(angle*Math.PI/180)*dist}px;
        --ty: ${Math.sin(angle*Math.PI/180)*dist}px;
        animation-delay: ${Math.random()*0.2}s;
        width: ${4+Math.random()*6}px;
        height: ${4+Math.random()*6}px;
      `;
      banner.appendChild(dot);
      setTimeout(() => dot.remove(), 1200);
    }
  }

  render();