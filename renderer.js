document.getElementById('btn-min').addEventListener('click', () => window.api.controlWindow('minimize'));
document.getElementById('btn-max').addEventListener('click', () => window.api.controlWindow('maximize'));
document.getElementById('btn-close').addEventListener('click', () => window.api.controlWindow('close'));

window.api.onLaunchStatus((data) => {
  alert(data.message);
});

let allGames = [];

async function loadLocalGames() {
  const container = document.getElementById('quests-container');
  container.innerHTML = '<span style="color: var(--text-muted);">Reading local configuration...</span>';

  try {
    allGames = await window.api.getGameList();
    renderGames(allGames);
  } catch (error) {
    container.innerHTML = `<span style="color: #ff4a4a;">Error building grid: ${error.message}</span>`;
  }
}

function renderGames(gamesToDisplay) {
  const container = document.getElementById('quests-container');
  container.innerHTML = '';

  if (gamesToDisplay.length === 0) {
    container.innerHTML = '<span style="color: var(--text-muted);">No matching games found.</span>';
    return;
  }

  gamesToDisplay.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';

    card.innerHTML = `
      <div class="game-title">${game.name}</div>
      <div style="color: var(--text-muted); font-size: 12px; font-family: 'PT Sans'; margin-bottom: 8px;">
        Process: ${game.exe}
      </div>
      <button class="btn-play">Launch Quest</button>
    `;

    card.querySelector('.btn-play').addEventListener('click', () => {
      window.api.launchDummy(game.exe, game.name);
    });

    container.appendChild(card);
  });
}

const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('btn-clear-search');

searchInput.addEventListener('input', (event) => {
  const searchTerm = event.target.value.toLowerCase();
  
  if (searchTerm.length > 0) {
    clearSearchBtn.style.display = 'block';
  } else {
    clearSearchBtn.style.display = 'none';
  }

  const filteredGames = allGames.filter(game => 
    game.name.toLowerCase().includes(searchTerm)
  );
  
  renderGames(filteredGames);
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearSearchBtn.style.display = 'none';
  renderGames(allGames);
  searchInput.focus();
});

document.getElementById('btn-refresh').addEventListener('click', () => {
  searchInput.value = '';
  clearSearchBtn.style.display = 'none';
  loadLocalGames();
});

loadLocalGames();