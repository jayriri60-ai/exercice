/* =====================================================
   PIERRE PAPIER CISEAUX — Game Logic + Multiplayer
   ===================================================== */

// ─── Constants ───────────────────────────────────────
const CHOICES = {
  rock:     { emoji: '🪨', label: 'Pierre',  beats: 'scissors' },
  paper:    { emoji: '📄', label: 'Papier',  beats: 'rock'     },
  scissors: { emoji: '✂️', label: 'Ciseaux', beats: 'paper'    },
};
const CHOICE_KEYS = Object.keys(CHOICES);
const WIN_GOAL = 5;

// ─── Modes ────────────────────────────────────────────
const MODE = { AI: 'ai', MULTI: 'multi' };

// ─── State ────────────────────────────────────────────
let state = {
  mode: MODE.AI,
  playerScore: 0,
  opponentScore: 0,
  round: 1,
  history: [],
  isPlaying: false,
  playerPseudo: 'Toi',
  opponentPseudo: 'IA',

  // Multiplayer
  peer: null,
  conn: null,
  isHost: false,
  myChoice: null,
  opponentChoice: null,
};

// ─── DOM refs ─────────────────────────────────────────
// Screens
const screenMode  = document.getElementById('screen-mode');
const screenLobby = document.getElementById('screen-lobby');
const screenGame  = document.getElementById('screen-game');

// Mode selection
const modeAiBtn    = document.getElementById('mode-ai');
const modeMultiBtn = document.getElementById('mode-multi');

// Lobby
const lobbyBackBtn     = document.getElementById('lobby-back');
const pseudoInput      = document.getElementById('pseudo-input');
const btnCreateRoom    = document.getElementById('btn-create-room');
const btnJoinRoom      = document.getElementById('btn-join-room');
const roomCodeInput    = document.getElementById('room-code-input');
const waitingPanel     = document.getElementById('waiting-panel');
const waitingCode      = document.getElementById('waiting-code');
const copyCodeBtn      = document.getElementById('copy-code-btn');
const btnCancelRoom    = document.getElementById('btn-cancel-room');
const waitingStatusText= document.getElementById('waiting-status-text');
const lobbyCreateCard  = document.getElementById('lobby-create-card');
const lobbyJoinCard    = document.getElementById('lobby-join-card');

// Game
const gameBackBtn     = document.getElementById('game-back');
const connDot         = document.getElementById('conn-dot');
const connLabel       = document.getElementById('conn-label');
const labelPlayer     = document.getElementById('label-player');
const labelOpponent   = document.getElementById('label-opponent');
const arenaLabelPlayer   = document.getElementById('arena-label-player');
const arenaLabelOpponent = document.getElementById('arena-label-opponent');
const gameSubtitle    = document.getElementById('game-subtitle');
const winGoalBanner   = document.getElementById('win-goal-banner');
const playerScoreEl   = document.getElementById('player-score');
const aiScoreEl       = document.getElementById('ai-score');
const roundTextEl     = document.getElementById('round-text');
const pipsPlayer      = document.getElementById('pips-player');
const pipsOpponent    = document.getElementById('pips-opponent');
const playerDisplay   = document.getElementById('player-display');
const aiDisplay       = document.getElementById('ai-display');
const resultBadge     = document.getElementById('result-badge');
const resultText      = document.getElementById('result-text');
const historyList     = document.getElementById('history-list');
const resetBtn        = document.getElementById('reset-btn');
const choiceBtns      = document.querySelectorAll('.choice-btn');
const chooseLabel     = document.getElementById('choose-label');

// Modal
const winnerModal  = document.getElementById('winner-modal');
const modalEmoji   = document.getElementById('modal-emoji');
const modalTitle   = document.getElementById('modal-title');
const modalSub     = document.getElementById('modal-sub');
const modalRematch = document.getElementById('modal-rematch');
const modalQuit    = document.getElementById('modal-quit');

// ─── Screen Navigation ────────────────────────────────
function showScreen(target) {
  [screenMode, screenLobby, screenGame].forEach(s => {
    s.classList.add('hidden');
    s.classList.remove('fade-in');
  });
  target.classList.remove('hidden');
  void target.offsetWidth;
  target.classList.add('fade-in');
}

// ─── Utils ────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function getAiChoice() {
  return CHOICE_KEYS[Math.floor(Math.random() * CHOICE_KEYS.length)];
}

function getOutcome(player, opponent) {
  if (player === opponent) return 'draw';
  if (CHOICES[player].beats === opponent) return 'win';
  return 'lose';
}

function setDisplay(el, emoji) {
  el.innerHTML = `<span class="choice-emoji">${emoji}</span>`;
  el.classList.remove('reveal', 'winner');
  void el.offsetWidth;
  el.classList.add('reveal');
}

function setButtonsDisabled(disabled) {
  choiceBtns.forEach(btn => (btn.disabled = disabled));
}

function getPseudo() {
  const raw = pseudoInput.value.trim();
  return raw.length > 0 ? raw.slice(0, 16) : 'Joueur';
}

// ─── Score Pips ───────────────────────────────────────
function renderPips() {
  const render = (container, filled, cls) => {
    container.innerHTML = Array.from({ length: WIN_GOAL }, (_, i) =>
      `<div class="pip ${i < filled ? cls : ''}"></div>`
    ).join('');
  };
  render(pipsPlayer,   state.playerScore,   'filled-player');
  render(pipsOpponent, state.opponentScore, 'filled-opponent');
}

// ─── Score Update ─────────────────────────────────────
function updateScoreEl(el, newVal) {
  el.textContent = newVal;
  el.classList.remove('score-bump');
  void el.offsetWidth;
  el.classList.add('score-bump');
  el.addEventListener('transitionend', () => el.classList.remove('score-bump'), { once: true });
}

// ─── Result Badge ─────────────────────────────────────
function setResultBadge(outcome) {
  resultBadge.className = 'result-badge';
  resultBadge.classList.add(outcome);

  const isMulti = state.mode === MODE.MULTI;
  const opName  = state.opponentPseudo;

  const messages = {
    win:  ['🏆 Victoire !', 'Bien joué !', 'Tu gagnes !'],
    lose: ['😤 Défaite…',   `${opName} gagne !`, 'Réessaie !'],
    draw: ['🤝 Égalité !',  'Match nul !'],
  };

  const pool = messages[outcome];
  resultText.textContent = pool[Math.floor(Math.random() * pool.length)];
}

// ─── Confetti ─────────────────────────────────────────
function spawnConfetti(count = 30) {
  const colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.width  = (6 + Math.random() * 8) + 'px';
    el.style.height = (6 + Math.random() * 8) + 'px';
    el.style.animationDuration = (0.8 + Math.random() * 0.8) + 's';
    el.style.animationDelay    = Math.random() * 0.3 + 's';
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

// ─── History ──────────────────────────────────────────
function addHistory(playerChoice, opponentChoice, outcome) {
  state.history.unshift({ playerChoice, opponentChoice, outcome, round: state.round - 1 });
  if (state.history.length > 10) state.history.pop();
  renderHistory();
}

function renderHistory() {
  if (state.history.length === 0) {
    historyList.innerHTML = '<p class="history-empty">Aucune partie jouée…</p>';
    return;
  }
  historyList.innerHTML = state.history.map(item => {
    const cls   = `outcome-${item.outcome}`;
    const label = item.outcome === 'win' ? '✓ Victoire' : item.outcome === 'lose' ? '✗ Défaite' : '⊜ Égalité';
    return `
      <div class="history-item">
        <span style="color:var(--text-muted);font-size:.7rem;font-weight:700;min-width:55px">Round ${item.round}</span>
        <div class="history-emojis">
          <span>${CHOICES[item.playerChoice].emoji}</span>
          <span class="history-vs">VS</span>
          <span>${CHOICES[item.opponentChoice].emoji}</span>
        </div>
        <span class="history-outcome ${cls}">${label}</span>
      </div>`;
  }).join('');
}

// ─── Match Winner Modal ────────────────────────────────
function showWinnerModal(playerWon) {
  if (playerWon) {
    modalEmoji.textContent = '🏆';
    modalTitle.textContent = 'Victoire !';
    modalSub.textContent   = `${state.playerPseudo} remporte la partie !`;
    spawnConfetti(80);
  } else {
    modalEmoji.textContent = '😤';
    modalTitle.textContent = 'Défaite…';
    modalSub.textContent   = `${state.opponentPseudo} remporte la partie !`;
  }
  winnerModal.classList.remove('hidden');
}

// ─── Game Init ────────────────────────────────────────
function startGame(mode) {
  state.mode = mode;
  state.playerScore = 0;
  state.opponentScore = 0;
  state.round = 1;
  state.history = [];
  state.isPlaying = false;
  state.myChoice = null;
  state.opponentChoice = null;

  // UI labels
  const isMulti = mode === MODE.MULTI;
  labelPlayer.textContent     = state.playerPseudo;
  labelOpponent.textContent   = state.opponentPseudo;
  arenaLabelPlayer.textContent   = state.playerPseudo;
  arenaLabelOpponent.textContent = state.opponentPseudo;
  gameSubtitle.textContent = isMulti
    ? `${state.playerPseudo} vs ${state.opponentPseudo}`
    : `Défiez l'intelligence artificielle !`;

  winGoalBanner.classList.toggle('visible', true);

  playerScoreEl.textContent = '0';
  aiScoreEl.textContent     = '0';
  roundTextEl.textContent   = 'Round 1';
  renderPips();

  playerDisplay.className = 'choice-display';
  aiDisplay.className     = 'choice-display';
  playerDisplay.innerHTML = '<span class="choice-emoji">❓</span>';
  aiDisplay.innerHTML     = '<span class="choice-emoji">❓</span>';

  resultBadge.className  = 'result-badge';
  resultText.textContent = 'Fais ton choix !';
  chooseLabel.textContent = 'Choisissez votre arme !';

  winnerModal.classList.add('hidden');
  renderHistory();
  setButtonsDisabled(false);
  choiceBtns.forEach(b => b.classList.remove('selected-choice'));

  // Reset / Hide btn in multiplayer (host handles rematch)
  resetBtn.style.display = isMulti ? 'none' : '';

  showScreen(screenGame);
}

// ─── Reset ────────────────────────────────────────────
function resetGame() {
  startGame(state.mode);
}

// ═══════════════════════════════════════════════════════
//  VS AI LOGIC
// ═══════════════════════════════════════════════════════
async function playVsAI(playerChoice) {
  if (state.isPlaying) return;
  state.isPlaying = true;
  setButtonsDisabled(true);

  playerDisplay.className = 'choice-display';
  aiDisplay.className     = 'choice-display';
  resultBadge.className   = 'result-badge thinking';
  resultText.textContent  = 'IA réfléchit…';

  setDisplay(playerDisplay, CHOICES[playerChoice].emoji);
  playerDisplay.classList.add('active');
  aiDisplay.innerHTML = `<span class="choice-emoji">🤔</span>`;

  await sleep(700);

  const aiChoice = getAiChoice();
  const outcome  = getOutcome(playerChoice, aiChoice);

  setDisplay(aiDisplay, CHOICES[aiChoice].emoji);
  aiDisplay.classList.add('active');

  await sleep(300);
  setResultBadge(outcome);

  if (outcome === 'win') {
    playerDisplay.classList.add('winner');
    state.playerScore++;
    updateScoreEl(playerScoreEl, state.playerScore);
    spawnConfetti(40);
  } else if (outcome === 'lose') {
    aiDisplay.classList.add('winner');
    state.opponentScore++;
    updateScoreEl(aiScoreEl, state.opponentScore);
  }

  renderPips();
  addHistory(playerChoice, aiChoice, outcome);
  state.round++;
  roundTextEl.textContent = `Round ${state.round}`;

  // Check match winner
  if (state.playerScore >= WIN_GOAL) { await sleep(500); showWinnerModal(true); return; }
  if (state.opponentScore >= WIN_GOAL) { await sleep(500); showWinnerModal(false); return; }

  await sleep(600);
  setButtonsDisabled(false);
  state.isPlaying = false;
}

// ═══════════════════════════════════════════════════════
//  MULTIPLAYER — PeerJS
// ═══════════════════════════════════════════════════════
function generateRoomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function setConnStatus(status) {
  // status: 'connecting' | 'connected' | 'disconnected'
  connDot.className = 'conn-dot ' + status;
  const labels = {
    connecting:   'Connexion…',
    connected:    'Connecté',
    disconnected: 'Déconnecté',
  };
  connLabel.textContent = labels[status] || status;
}

// ── Send a message to opponent ──
function send(type, payload = {}) {
  if (state.conn && state.conn.open) {
    state.conn.send(JSON.stringify({ type, ...payload }));
  }
}

// ── Handle incoming data ──
function onData(raw) {
  let msg;
  try { msg = JSON.parse(raw); } catch { return; }

  switch (msg.type) {

    case 'HELLO':
      // Opponent sent their pseudo
      state.opponentPseudo = msg.pseudo || 'Adversaire';
      // Host sends back their pseudo + starts game
      if (state.isHost) {
        send('HELLO', { pseudo: state.playerPseudo });
        waitingStatusText.textContent = `${state.opponentPseudo} a rejoint ! Lancement…`;
        setTimeout(() => startGame(MODE.MULTI), 800);
      } else {
        state.opponentPseudo = msg.pseudo;
        // Guest starts game
        setTimeout(() => startGame(MODE.MULTI), 800);
      }
      break;

    case 'CHOICE':
      state.opponentChoice = msg.choice;
      checkBothChosen();
      break;

    case 'REMATCH':
      // Opponent requested rematch
      resetMultiGame();
      break;
  }
}

function checkBothChosen() {
  if (state.myChoice && state.opponentChoice) {
    resolveMultiRound(state.myChoice, state.opponentChoice);
  }
}

// ── PeerJS ICE config (STUN + TURN for NAT traversal) ──
const PEER_CONFIG = {
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
    ],
  },
};

// ── Create Room (Host) ──
async function createRoom() {
  const pseudo = getPseudo();
  state.playerPseudo = pseudo;
  state.isHost = true;

  const code = generateRoomCode();

  // Show waiting UI
  lobbyCreateCard.style.display = 'none';
  lobbyJoinCard.style.display   = 'none';
  waitingPanel.classList.remove('hidden');
  waitingCode.textContent = code;
  waitingStatusText.textContent = 'En attente de votre adversaire…';

  // Init peer with the room code as peer ID + TURN servers
  try {
    state.peer = new Peer('ppc-' + code, PEER_CONFIG);
  } catch (e) {
    alert('Impossible de se connecter. Vérifiez votre connexion Internet.');
    cancelRoom();
    return;
  }

  state.peer.on('open', (id) => {
    console.log('[Host] Peer open:', id);
  });

  state.peer.on('connection', (conn) => {
    state.conn = conn;
    setupConnection(conn);
  });

  state.peer.on('error', (err) => {
    console.error('[Peer error]', err);
    if (err.type === 'unavailable-id') {
      waitingStatusText.textContent = 'Code déjà utilisé, génération d\'un nouveau…';
      setTimeout(createRoom, 500);
    } else {
      waitingStatusText.textContent = '❌ Erreur réseau. Réessayez.';
      waitingStatusText.style.color = 'var(--red)';
    }
  });
}

// ── Join Room (Guest) ──
function joinRoom() {
  const code = roomCodeInput.value.trim();
  if (!/^\d{6}$/.test(code)) {
    roomCodeInput.style.borderColor = 'var(--red)';
    roomCodeInput.focus();
    setTimeout(() => (roomCodeInput.style.borderColor = ''), 1500);
    return;
  }

  const pseudo = getPseudo();
  state.playerPseudo = pseudo;
  state.isHost = false;

  lobbyCreateCard.style.display = 'none';
  lobbyJoinCard.style.display   = 'none';
  waitingPanel.classList.remove('hidden');
  waitingCode.textContent = code;
  waitingStatusText.textContent = 'Connexion en cours…';

  try {
    state.peer = new Peer(PEER_CONFIG);
  } catch {
    alert('Impossible d\'initialiser la connexion. Vérifiez votre connexion Internet.');
    cancelRoom();
    return;
  }

  // Timeout si la connexion ne s'établit pas en 15s
  const joinTimeout = setTimeout(() => {
    if (!state.conn || !state.conn.open) {
      waitingStatusText.textContent = '⏱️ Délai dépassé. Vérifiez le code et réessayez.';
      waitingStatusText.style.color = 'var(--red)';
    }
  }, 15000);

  state.peer.on('open', () => {
    const conn = state.peer.connect('ppc-' + code, {
      reliable: true,
      serialization: 'json',
    });
    state.conn = conn;
    setupConnection(conn, joinTimeout);
  });

  state.peer.on('error', (err) => {
    clearTimeout(joinTimeout);
    console.error('[Peer error]', err);
    if (err.type === 'peer-unavailable') {
      waitingStatusText.textContent = '❌ Code introuvable. L\'hôte a peut-être annulé.';
    } else {
      waitingStatusText.textContent = '❌ Erreur de connexion. Vérifiez le code.';
    }
    waitingStatusText.style.color = 'var(--red)';
  });
}

// ── Setup connection handlers ──
function setupConnection(conn, timeoutId) {
  conn.on('open', () => {
    if (timeoutId) clearTimeout(timeoutId);
    console.log('[Conn] Open');
    setConnStatus('connected');
    waitingStatusText.style.color = '';
    // Exchange pseudos
    send('HELLO', { pseudo: state.playerPseudo });
  });

  conn.on('data', (raw) => onData(raw));

  conn.on('close', () => {
    setConnStatus('disconnected');
    if (!winnerModal.classList.contains('hidden')) return;
    resultText.textContent = '⚠️ Adversaire déconnecté';
    resultBadge.className  = 'result-badge lose';
    setButtonsDisabled(true);
  });

  conn.on('error', (err) => {
    console.error('[Conn error]', err);
    setConnStatus('disconnected');
  });
}

// ── Cancel room ──
function cancelRoom() {
  if (state.peer) { state.peer.destroy(); state.peer = null; }
  state.conn = null;
  lobbyCreateCard.style.display = '';
  lobbyJoinCard.style.display   = '';
  waitingPanel.classList.add('hidden');
  roomCodeInput.value = '';
}

// ─── Copy code ────────────────────────────────────────
copyCodeBtn.addEventListener('click', () => {
  const code = waitingCode.textContent;
  navigator.clipboard.writeText(code).then(() => {
    copyCodeBtn.textContent = '✅ Copié !';
    copyCodeBtn.classList.add('copied');
    setTimeout(() => {
      copyCodeBtn.textContent = '📋 Copier';
      copyCodeBtn.classList.remove('copied');
    }, 2000);
  });
});

// ─── Multiplayer Round ────────────────────────────────
async function playVsPlayer(playerChoice) {
  if (state.isPlaying || state.myChoice) return;

  state.myChoice = playerChoice;
  setButtonsDisabled(true);

  // Highlight chosen button
  choiceBtns.forEach(b => {
    b.classList.toggle('selected-choice', b.dataset.choice === playerChoice);
  });

  // Show player's choice, mask opponent's
  setDisplay(playerDisplay, CHOICES[playerChoice].emoji);
  playerDisplay.classList.add('active');
  aiDisplay.innerHTML = `<span class="choice-emoji">⏳</span>`;

  resultBadge.className  = 'result-badge thinking';
  resultText.textContent = `En attente de ${state.opponentPseudo}…`;

  // Send choice to opponent
  send('CHOICE', { choice: playerChoice });

  // checkBothChosen will be triggered when opponent data arrives
}

async function resolveMultiRound(myChoice, opponentChoice) {
  if (state.isPlaying) return;
  state.isPlaying = true;

  const outcome = getOutcome(myChoice, opponentChoice);

  // Reveal opponent
  setDisplay(aiDisplay, CHOICES[opponentChoice].emoji);
  aiDisplay.classList.add('active');

  await sleep(300);
  setResultBadge(outcome);

  if (outcome === 'win') {
    playerDisplay.classList.add('winner');
    state.playerScore++;
    updateScoreEl(playerScoreEl, state.playerScore);
    spawnConfetti(40);
  } else if (outcome === 'lose') {
    aiDisplay.classList.add('winner');
    state.opponentScore++;
    updateScoreEl(aiScoreEl, state.opponentScore);
  }

  renderPips();
  addHistory(myChoice, opponentChoice, outcome);
  state.round++;
  roundTextEl.textContent = `Round ${state.round}`;

  // Reset per-round state
  state.myChoice       = null;
  state.opponentChoice = null;
  choiceBtns.forEach(b => b.classList.remove('selected-choice'));

  // Check match winner
  if (state.playerScore >= WIN_GOAL) { await sleep(500); showWinnerModal(true); return; }
  if (state.opponentScore >= WIN_GOAL) { await sleep(500); showWinnerModal(false); return; }

  await sleep(700);
  setButtonsDisabled(false);
  state.isPlaying = false;
}

// ─── Rematch (multi) ──────────────────────────────────
function resetMultiGame() {
  state.playerScore = 0;
  state.opponentScore = 0;
  state.round = 1;
  state.history = [];
  state.isPlaying = false;
  state.myChoice = null;
  state.opponentChoice = null;

  labelPlayer.textContent     = state.playerPseudo;
  labelOpponent.textContent   = state.opponentPseudo;
  playerScoreEl.textContent   = '0';
  aiScoreEl.textContent       = '0';
  roundTextEl.textContent     = 'Round 1';
  renderPips();

  playerDisplay.className = 'choice-display';
  aiDisplay.className     = 'choice-display';
  playerDisplay.innerHTML = '<span class="choice-emoji">❓</span>';
  aiDisplay.innerHTML     = '<span class="choice-emoji">❓</span>';

  resultBadge.className  = 'result-badge';
  resultText.textContent = 'Fais ton choix !';
  chooseLabel.textContent = 'Choisissez votre arme !';

  winnerModal.classList.add('hidden');
  renderHistory();
  setButtonsDisabled(false);
  choiceBtns.forEach(b => b.classList.remove('selected-choice'));
}

// ─── Unified play dispatcher ───────────────────────────
function play(playerChoice) {
  if (state.mode === MODE.AI) {
    playVsAI(playerChoice);
  } else {
    playVsPlayer(playerChoice);
  }
}

// ═══════════════════════════════════════════════════════
//  EVENT LISTENERS
// ═══════════════════════════════════════════════════════

// Mode selection
modeAiBtn.addEventListener('click', () => {
  state.playerPseudo  = 'Toi';
  state.opponentPseudo = 'IA';
  startGame(MODE.AI);
});

modeMultiBtn.addEventListener('click', () => showScreen(screenLobby));

// Lobby
lobbyBackBtn.addEventListener('click', () => {
  cancelRoom();
  showScreen(screenMode);
});

btnCreateRoom.addEventListener('click', createRoom);
btnJoinRoom.addEventListener('click', joinRoom);

roomCodeInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') joinRoom();
  // Only allow digits
  if (!/^\d$/.test(e.key) && !['Backspace','Tab','ArrowLeft','ArrowRight','Delete'].includes(e.key)) {
    e.preventDefault();
  }
});

btnCancelRoom.addEventListener('click', () => {
  cancelRoom();
});

// Game
gameBackBtn.addEventListener('click', () => {
  if (state.mode === MODE.MULTI) {
    cancelRoom();
  }
  showScreen(screenMode);
});

// Choice buttons
choiceBtns.forEach(btn => {
  btn.addEventListener('click', () => play(btn.dataset.choice));
});

// Reset (AI only)
resetBtn.addEventListener('click', resetGame);

// Modal
modalRematch.addEventListener('click', () => {
  winnerModal.classList.add('hidden');
  if (state.mode === MODE.MULTI) {
    send('REMATCH');
    resetMultiGame();
  } else {
    resetGame();
  }
});

modalQuit.addEventListener('click', () => {
  winnerModal.classList.add('hidden');
  if (state.mode === MODE.MULTI) cancelRoom();
  showScreen(screenMode);
});

// Keyboard shortcuts (game screen)
document.addEventListener('keydown', e => {
  if (screenGame.classList.contains('hidden')) return;
  const map = { '1': 'rock', '2': 'paper', '3': 'scissors', KeyQ: 'rock', KeyW: 'paper', KeyE: 'scissors' };
  const choice = map[e.key] || map[e.code];
  if (choice) play(choice);
});

// ─── Init ─────────────────────────────────────────────
renderHistory();
