document.getElementById('btn-min').addEventListener('click', () => window.api.controlWindow('minimize'));
document.getElementById('btn-max').addEventListener('click', () => window.api.controlWindow('maximize'));
document.getElementById('btn-close').addEventListener('click', () => window.api.controlWindow('close'));

window.api.onLaunchStatus((data) => {
  alert(data.message);
});

async function loadLocalGames() {
  const container = document.getElementById('quests-container');
  container.innerHTML = '<span style="color: var(--text-muted);">Reading local configuration...</span>';

  try {
    const games = await window.api.getGameList();
    container.innerHTML = '';

    if (games.length === 0) {
      container.innerHTML = '<span style="color: var(--text-muted);">No entries found in discord-executables.txt.</span>';
      return;
    }

    games.forEach(game => {
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
        window.api.launchDummy(game.exe);
      });

      container.appendChild(card);
    });

  } catch (error) {
    container.innerHTML = `<span style="color: #ff4a4a;">Error building grid: ${error.message}</span>`;
  }
}

document.getElementById('btn-refresh').addEventListener('click', loadLocalGames);
loadLocalGames();