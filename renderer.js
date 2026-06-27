document.getElementById('btn-min').addEventListener('click',   () => window.api.controlWindow('minimize'));
document.getElementById('btn-max').addEventListener('click',   () => window.api.controlWindow('maximize'));
document.getElementById('btn-close').addEventListener('click', () => window.api.controlWindow('close'));

window.api.getVersion().then(v => {
  document.getElementById('version-number').textContent = `v${v}`;
});
window.api.onLaunchStatus((data) => alert(data.message));

let allGames = [];
let isAlphabetical = false;

document.getElementById('btn-alphabetical').addEventListener('click', (e) => {
  isAlphabetical = !isAlphabetical;
  e.target.classList.toggle('active', isAlphabetical);
  renderGames(allGames);
});

async function loadGames() {
  const container = document.getElementById('quests-container');
  container.innerHTML = '<span style="color: var(--text-muted);">Fetching game list…</span>';

  try {
    allGames = await window.api.getGameList();
    renderGames(allGames);
  } catch (error) {
    container.innerHTML = `<span style="color: #ff4a4a;">Error loading games: ${error.message}</span>`;
  }
}

function renderGames(games) {
  const container = document.getElementById('quests-container');
  container.innerHTML = '';

  let displayGames = [...games];
  if (isAlphabetical) {
    displayGames.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (displayGames.length === 0) {
    container.innerHTML = '<span style="color: var(--text-muted);">No matching games found.</span>';
    return;
  }

  displayGames.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card' + (game.working ? '' : ' not-working');
    const coverEl = document.createElement('img');
    coverEl.className = 'game-cover';
    const safeImageName = game.name.replace(/[:\/\\?%*|"<>]/g, '');
    coverEl.src = `./covers/${safeImageName}.webp`;
    coverEl.onerror = () => coverEl.src = './covers/default.jpg'; 

    const titleEl = document.createElement('div');
    titleEl.className = 'game-title';
    titleEl.title = game.name;
    titleEl.textContent = game.name;

    const pathEl = document.createElement('div');
    pathEl.style.cssText = 'color: var(--text-muted); font-size: 12px; font-family: "PT Sans"; margin-bottom: 8px;';
    pathEl.textContent = `Process: ${game.exeName}`;

    const btn = document.createElement('button');
    btn.className = 'btn-play';

    if (game.working) {
      btn.textContent = 'Launch Quest';
      btn.addEventListener('click', () => window.api.launchDummy(game.exeName, game.name));
    } else {
      // send the user straight to legacy mode if the application isn't working.
      btn.textContent = 'Use Legacy Mode';
      btn.classList.add('btn-legacy-mode');
      btn.addEventListener('click', () => window.api.openLegacyMode());
    }

    card.append(coverEl, titleEl, pathEl, btn);
    container.appendChild(card);
  });
}

const searchInput    = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('btn-clear-search');

searchInput.addEventListener('input', () => {
  const term = searchInput.value.toLowerCase();
  clearSearchBtn.style.display = term ? 'block' : 'none';
  renderGames(allGames.filter(g => g.name.toLowerCase().includes(term)));
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearSearchBtn.style.display = 'none';
  renderGames(allGames);
  searchInput.focus();
});

document.getElementById('btn-refresh').addEventListener('click', (e) => {
  const svgIcon = e.currentTarget.querySelector('.refresh-svg');
  if (svgIcon) {
    svgIcon.classList.add('spinning');
    setTimeout(() => svgIcon.classList.remove('spinning'), 1000);
  }

  searchInput.value = '';
  clearSearchBtn.style.display = 'none';
  loadGames();
});

loadGames();