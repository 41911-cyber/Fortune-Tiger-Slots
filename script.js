/* ===================================================
   FORTUNE TIGER SLOTS 3x3 - JAVASCRIPT
   - Tela Inicial com Splash Screen oficial do Tigrinho
   - Modo Turbo com velocidade ultrarrápida
   - Campo para digitar o valor escolhido da aposta
   - Grade 3x3 (3 Linhas x 3 Colunas) com 5 Linhas de Pagamento
   =================================================== */

// Símbolos temáticos inspirados no Fortune Tiger
const SIMBOLOS = ['🐯', '🪙', '🧧', '💎', '🔔', '🍊'];

// Multiplicadores para 3 símbolos iguais em uma linha
const MULTIPLICADORES = {
  '🐯': 50, // Tigre da Sorte (Jackpot: 50x)
  '🪙': 30, // Lingote de Ouro (30x)
  '🧧': 20, // Envelope Vermelho (20x)
  '💎': 15, // Diamante Celestial (15x)
  '🔔': 10, // Sino Dourado (10x)
  '🍊': 5   // Tangerina da Fortuna (5x)
};

const MULTIPLICADOR_DUPLA = 1.5; // Multiplicador para 2 símbolos iguais em uma linha

// 5 Linhas de Pagamento Clássicas do Fortune Tiger 3x3:
// Cada linha é um conjunto de 3 posições [linha, coluna]
const LINHAS_PAGAMENTO = [
  { nome: 'Linha Central', posicoes: [[1, 0], [1, 1], [1, 2]] },
  { nome: 'Linha Superior', posicoes: [[0, 0], [0, 1], [0, 2]] },
  { nome: 'Linha Inferior', posicoes: [[2, 0], [2, 1], [2, 2]] },
  { nome: 'Diagonal Descendente', posicoes: [[0, 0], [1, 1], [2, 2]] },
  { nome: 'Diagonal Ascendente', posicoes: [[2, 0], [1, 1], [0, 2]] }
];

// Estado do Jogo
let saldo = 1000;
let apostaAtual = 10;
let estaGirando = false;
let somAtivo = true;
let turboAtivo = false;

// Matriz atual dos rolos (3 linhas x 3 colunas)
let gradeAtual = [
  ['🐯', '🪙', '🧧'],
  ['🪙', '🐯', '💎'],
  ['🍊', '🧧', '🐯']
];

// Elementos do DOM - Telas
const splashScreen = document.getElementById('splash-screen');
const startGameBtn = document.getElementById('start-game-btn');
const gameContainer = document.getElementById('game-container');
const homeBtn = document.getElementById('home-btn');

// Elementos do DOM - Jogo
const balanceEl = document.getElementById('balance');
const currentBetEl = document.getElementById('current-bet-display');
const lastWinEl = document.getElementById('last-win');
const messageEl = document.getElementById('message-bar');
const spinBtn = document.getElementById('spin-btn');
const spinSubTextEl = document.getElementById('spin-sub-text');
const resetBtn = document.getElementById('reset-btn');
const soundBtn = document.getElementById('sound-btn');
const turboBtn = document.getElementById('turbo-btn');
const turboStatusEl = document.getElementById('turbo-status');

// Elementos do DOM - Aposta
const betInput = document.getElementById('bet-input');
const betMinusBtn = document.getElementById('bet-minus-btn');
const betPlusBtn = document.getElementById('bet-plus-btn');
const betChips = document.querySelectorAll('.bet-chip');

// Colunas dos Rolos
const reelCols = [
  document.getElementById('reel-col-0'),
  document.getElementById('reel-col-1'),
  document.getElementById('reel-col-2')
];

// Células da grade 3x3
const cells = [
  [document.getElementById('cell-0-0'), document.getElementById('cell-0-1'), document.getElementById('cell-0-2')],
  [document.getElementById('cell-1-0'), document.getElementById('cell-1-1'), document.getElementById('cell-1-2')],
  [document.getElementById('cell-2-0'), document.getElementById('cell-2-1'), document.getElementById('cell-2-2')]
];

const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');

/* ===================================================
   1. SISTEMA DE SOM SINTETIZADO (Web Audio API)
   =================================================== */
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function tocarSom(tipo) {
  if (!somAtivo) return;
  try {
    const actx = getAudioContext();

    if (tipo === 'click') {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.frequency.setValueAtTime(450, actx.currentTime);
      gain.gain.setValueAtTime(0.08, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.04);
    } 
    else if (tipo === 'bet') {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(540, actx.currentTime);
      gain.gain.setValueAtTime(0.09, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.06);
    }
    else if (tipo === 'turbo') {
      // Efeito sonoro elétrico ao ligar/desligar turbo
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sawtooth';
      const freqInicio = turboAtivo ? 300 : 700;
      const freqFim = turboAtivo ? 900 : 300;
      osc.frequency.setValueAtTime(freqInicio, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freqFim, actx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.12);
    }
    else if (tipo === 'start') {
      // Som festivo de boas-vindas ao clicar em Começar
      const notas = [440, 554.37, 659.25, 880];
      notas.forEach((nota, i) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(nota, actx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.15, actx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + i * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(actx.currentTime + i * 0.08);
        osc.stop(actx.currentTime + i * 0.08 + 0.3);
      });
    }
    else if (tipo === 'stop') {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, actx.currentTime);
      gain.gain.setValueAtTime(0.14, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.07);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.07);
    } 
    else if (tipo === 'win') {
      // Fanfarra alegre com notas chinesas pentatônicas
      const notas = [523.25, 587.33, 659.25, 783.99, 1046.50, 1318.51];
      notas.forEach((nota, i) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(nota, actx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.2, actx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + i * 0.08 + 0.22);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(actx.currentTime + i * 0.08);
        osc.stop(actx.currentTime + i * 0.08 + 0.22);
      });
    }
  } catch (e) {
    console.warn('Áudio não suportado ou bloqueado:', e);
  }
}

/* ===================================================
   2. TRANSIÇÃO: TELA INICIAL (SPLASH SCREEN)
   =================================================== */
function iniciarJogo() {
  tocarSom('start');
  splashScreen.classList.add('fade-out');

  setTimeout(() => {
    splashScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');
  }, 350);
}

function voltarTelaInicial() {
  if (estaGirando) return;
  tocarSom('click');
  gameContainer.classList.add('hidden');
  splashScreen.classList.remove('hidden', 'fade-out');
}

startGameBtn.addEventListener('click', iniciarJogo);
homeBtn.addEventListener('click', voltarTelaInicial);

/* ===================================================
   3. CONTROLE DE APOSTAS COM INPUT DE VALOR
   =================================================== */
function definirAposta(novoValor, emitirSom = true) {
  if (estaGirando) return;

  novoValor = Math.max(1, parseInt(novoValor, 10) || 1);
  apostaAtual = novoValor;

  // Atualiza o input de aposta
  if (betInput.value !== String(apostaAtual)) {
    betInput.value = apostaAtual;
  }

  // Atualiza placar e botão girar
  currentBetEl.textContent = apostaAtual;
  spinSubTextEl.textContent = `APOSTA: ${apostaAtual} 🪙`;

  // Atualiza destaque visual dos botões rápidos
  betChips.forEach(chip => {
    const valorChip = parseInt(chip.getAttribute('data-bet'), 10);
    if (valorChip === apostaAtual) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });

  if (emitirSom) {
    tocarSom('bet');
  }
}

// Ao digitar o valor diretamente no campo input
betInput.addEventListener('input', (e) => {
  const valorDigitado = parseInt(e.target.value, 10);
  if (!isNaN(valorDigitado) && valorDigitado >= 1) {
    definirAposta(valorDigitado, false);
  }
});

betInput.addEventListener('blur', () => {
  if (!betInput.value || parseInt(betInput.value, 10) < 1) {
    definirAposta(10);
  }
});

// Botões de incremento e decremento
betMinusBtn.addEventListener('click', () => {
  if (estaGirando) return;
  let novoValor;
  if (apostaAtual <= 10) {
    novoValor = Math.max(1, apostaAtual - 1);
  } else if (apostaAtual <= 50) {
    novoValor = Math.max(10, apostaAtual - 5);
  } else {
    novoValor = Math.max(10, apostaAtual - 25);
  }
  definirAposta(novoValor);
});

betPlusBtn.addEventListener('click', () => {
  if (estaGirando) return;
  let novoValor;
  if (apostaAtual < 10) {
    novoValor = apostaAtual + 1;
  } else if (apostaAtual < 50) {
    novoValor = apostaAtual + 5;
  } else {
    novoValor = apostaAtual + 25;
  }
  definirAposta(novoValor);
});

// Botões rápidos (Chips)
betChips.forEach(chip => {
  chip.addEventListener('click', () => {
    const valor = parseInt(chip.getAttribute('data-bet'), 10);
    definirAposta(valor);
  });
});

/* ===================================================
   4. MODO TURBO (VELOCIDADE ACELERADA)
   =================================================== */
function alternarTurbo() {
  turboAtivo = !turboAtivo;
  
  if (turboAtivo) {
    turboBtn.classList.add('active');
    turboStatusEl.textContent = 'ON';
  } else {
    turboBtn.classList.remove('active');
    turboStatusEl.textContent = 'OFF';
  }

  tocarSom('turbo');
}

turboBtn.addEventListener('click', alternarTurbo);

/* ===================================================
   5. MECÂNICA DE GIRO DO CAÇA-NÍQUEL 3x3
   =================================================== */
function sortearSimbolo() {
  const indice = Math.floor(Math.random() * SIMBOLOS.length);
  return SIMBOLOS[indice];
}

function limparVencedores() {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      cells[r][c].classList.remove('winner');
    }
  }
}

function atualizarExibicaoGrade() {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const symbolSpan = cells[r][c].querySelector('.symbol');
      if (symbolSpan) {
        symbolSpan.textContent = gradeAtual[r][c];
      }
    }
  }
}

function girar() {
  if (estaGirando) return;

  // Validação: Saldo suficiente
  if (saldo < apostaAtual) {
    if (saldo >= 1) {
      messageEl.textContent = `⚠️ Saldo insuficiente para ${apostaAtual} 🪙. Digite um valor menor!`;
      messageEl.className = 'message-bar';
    } else {
      messageEl.textContent = '❌ Moedas esgotadas! Clique em RECOMEÇAR.';
      messageEl.className = 'message-bar';
      resetBtn.classList.remove('hidden');
    }
    return;
  }

  // Deduz aposta
  saldo -= apostaAtual;
  balanceEl.textContent = saldo;
  estaGirando = true;
  spinBtn.disabled = true;
  betMinusBtn.disabled = true;
  betPlusBtn.disabled = true;
  betInput.disabled = true;

  limparVencedores();
  messageEl.className = 'message-bar';
  messageEl.textContent = turboAtivo 
    ? `⚡ TURBO ATIVADO! Girando com aposta de ${apostaAtual}...` 
    : `🐯 Girando com aposta de ${apostaAtual} moedas... Boa sorte!`;

  tocarSom('click');

  // Adiciona classes de giro aos rolos
  const classeGiro = turboAtivo ? 'turbo-spinning' : 'spinning';
  reelCols.forEach(col => col.classList.add(classeGiro));

  // Intervalo de alternância rápida de símbolos
  const intervaloVelocidade = turboAtivo ? 28 : 65;
  const intervaloGiro = setInterval(() => {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const symbolSpan = cells[r][c].querySelector('.symbol');
        if (symbolSpan) {
          symbolSpan.textContent = sortearSimbolo();
        }
      }
    }
    tocarSom('click');
  }, intervaloVelocidade);

  // Tempos de parada para cada coluna (Normal vs Turbo)
  const tempoCol0 = turboAtivo ? 160 : 700;
  const tempoCol1 = turboAtivo ? 300 : 1100;
  const tempoCol2 = turboAtivo ? 440 : 1500;

  // Sorteia os resultados finais para a matriz 3x3
  const resultadoFinal = [
    [sortearSimbolo(), sortearSimbolo(), sortearSimbolo()],
    [sortearSimbolo(), sortearSimbolo(), sortearSimbolo()],
    [sortearSimbolo(), sortearSimbolo(), sortearSimbolo()]
  ];

  // Chance ponderada do Tigrinho dar boas linhas (para diversão equilibrada)
  if (Math.random() < 0.42) {
    // Força uma linha vencedora aleatória
    const linhaEscolhida = LINHAS_PAGAMENTO[Math.floor(Math.random() * LINHAS_PAGAMENTO.length)];
    const simboloVencedor = sortearSimbolo();
    linhaEscolhida.posicoes.forEach(([r, c]) => {
      resultadoFinal[r][c] = simboloVencedor;
    });
  }

  // Parada Coluna 0
  setTimeout(() => {
    reelCols[0].classList.remove('spinning', 'turbo-spinning');
    for (let r = 0; r < 3; r++) {
      gradeAtual[r][0] = resultadoFinal[r][0];
      cells[r][0].querySelector('.symbol').textContent = gradeAtual[r][0];
    }
    tocarSom('stop');
  }, tempoCol0);

  // Parada Coluna 1
  setTimeout(() => {
    reelCols[1].classList.remove('spinning', 'turbo-spinning');
    for (let r = 0; r < 3; r++) {
      gradeAtual[r][1] = resultadoFinal[r][1];
      cells[r][1].querySelector('.symbol').textContent = gradeAtual[r][1];
    }
    tocarSom('stop');
  }, tempoCol1);

  // Parada Coluna 2 e Fim da Rodada
  setTimeout(() => {
    clearInterval(intervaloGiro);
    reelCols[2].classList.remove('spinning', 'turbo-spinning');
    for (let r = 0; r < 3; r++) {
      gradeAtual[r][2] = resultadoFinal[r][2];
      cells[r][2].querySelector('.symbol').textContent = gradeAtual[r][2];
    }
    tocarSom('stop');

    // Analisa todas as 5 linhas da grade 3x3
    verificarResultado3x3(gradeAtual);

    estaGirando = false;
    spinBtn.disabled = false;
    betMinusBtn.disabled = false;
    betPlusBtn.disabled = false;
    betInput.disabled = false;

    if (saldo < 1) {
      resetBtn.classList.remove('hidden');
    }
  }, tempoCol2);
}

/* ===================================================
   6. VERIFICAÇÃO DE VITÓRIAS NAS 5 LINHAS (3x3)
   =================================================== */
function verificarResultado3x3(matriz) {
  let ganhoTotal = 0;
  let linhasVencedoras = [];
  const celulasVencedoras = new Set();

  // Verifica cada uma das 5 linhas de pagamento
  LINHAS_PAGAMENTO.forEach((linha) => {
    const s1 = matriz[linha.posicoes[0][0]][linha.posicoes[0][1]];
    const s2 = matriz[linha.posicoes[1][0]][linha.posicoes[1][1]];
    const s3 = matriz[linha.posicoes[2][0]][linha.posicoes[2][1]];

    // Caso 1: 3 símbolos iguais na linha
    if (s1 === s2 && s2 === s3) {
      const multi = MULTIPLICADORES[s1] || 10;
      // Pagamento proporcional por linha (aposta base dividida pelas 5 linhas)
      const ganhoLinha = Math.max(1, Math.floor((apostaAtual / 5) * multi));
      ganhoTotal += ganhoLinha;
      linhasVencedoras.push(`${linha.nome} (${s1}x3 = ${multi}x)`);

      linha.posicoes.forEach(([r, c]) => celulasVencedoras.add(`${r}-${c}`));
    }
    // Caso 2: 2 símbolos iguais na linha
    else if (s1 === s2 || s2 === s3 || s1 === s3) {
      const ganhoLinha = Math.max(1, Math.floor((apostaAtual / 5) * MULTIPLICADOR_DUPLA));
      ganhoTotal += ganhoLinha;
      linhasVencedoras.push(`${linha.nome} (Par 1.5x)`);

      if (s1 === s2) {
        celulasVencedoras.add(`${linha.posicoes[0][0]}-${linha.posicoes[0][1]}`);
        celulasVencedoras.add(`${linha.posicoes[1][0]}-${linha.posicoes[1][1]}`);
      } else if (s2 === s3) {
        celulasVencedoras.add(`${linha.posicoes[1][0]}-${linha.posicoes[1][1]}`);
        celulasVencedoras.add(`${linha.posicoes[2][0]}-${linha.posicoes[2][1]}`);
      } else if (s1 === s3) {
        celulasVencedoras.add(`${linha.posicoes[0][0]}-${linha.posicoes[0][1]}`);
        celulasVencedoras.add(`${linha.posicoes[2][0]}-${linha.posicoes[2][1]}`);
      }
    }
  });

  // BÔNUS ESPECIAL FORTUNE TIGER: TELA CHEIA (9 símbolos iguais)
  const primeiroSimbolo = matriz[0][0];
  const telaCheia = matriz.every(row => row.every(sym => sym === primeiroSimbolo));
  if (telaCheia) {
    ganhoTotal = ganhoTotal * 10;
    messageEl.textContent = `🔥 TELA CHEIA DO TIGRINHO! MULTIPLICADOR 10x! +${ganhoTotal} MOEDAS! 🔥`;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        celulasVencedoras.add(`${r}-${c}`);
      }
    }
  }

  // Destaca as células vencedoras
  celulasVencedoras.forEach(chave => {
    const [r, c] = chave.split('-').map(Number);
    cells[r][c].classList.add('winner');
  });

  // Atualiza saldo e mensagens
  if (ganhoTotal > 0) {
    saldo += ganhoTotal;
    balanceEl.textContent = saldo;
    lastWinEl.textContent = ganhoTotal;

    if (!telaCheia) {
      if (linhasVencedoras.length > 1) {
        messageEl.textContent = `🎉 MULTI-VITÓRIA! ${linhasVencedoras.length} LINHAS! +${ganhoTotal} MOEDAS!`;
      } else {
        messageEl.textContent = `✨ GANHOU NA ${linhasVencedoras[0]}! +${ganhoTotal} MOEDAS!`;
      }
    }

    messageEl.className = 'message-bar win';
    tocarSom('win');
    dispararConfetes();
  } else {
    lastWinEl.textContent = 0;
    messageEl.textContent = '🐯 O Tigrinho continua com você! Gire novamente!';
    messageEl.className = 'message-bar';
  }
}

/* ===================================================
   7. RECOMEÇAR JOGO (Restaura Saldo)
   =================================================== */
function recomecar() {
  saldo = 1000;
  definirAposta(10);
  balanceEl.textContent = saldo;
  lastWinEl.textContent = 0;
  messageEl.textContent = '🐯 Saldo restaurado! Boa sorte!';
  messageEl.className = 'message-bar';
  resetBtn.classList.add('hidden');
  limparVencedores();
  tocarSom('click');
}

/* ===================================================
   8. ANIMAÇÃO DE CONFETES NO CANVAS
   =================================================== */
let confetes = [];
let animandoConfetes = false;

function redimensionarCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', redimensionarCanvas);
redimensionarCanvas();

function dispararConfetes() {
  confetes = [];
  const cores = ['#ffd700', '#ff0055', '#06d6a0', '#ff9e00', '#ffffff', '#ff3366'];

  for (let i = 0; i < 90; i++) {
    confetes.push({
      x: canvas.width / 2 + (Math.random() * 260 - 130),
      y: canvas.height / 2 - 70,
      raio: Math.random() * 6 + 4,
      cor: cores[Math.floor(Math.random() * cores.length)],
      velocidadeX: (Math.random() - 0.5) * 14,
      velocidadeY: Math.random() * -12 - 4,
      gravidade: 0.35,
      rotacao: Math.random() * 360,
      velRotacao: (Math.random() - 0.5) * 10,
      opacidade: 1
    });
  }

  if (!animandoConfetes) {
    animandoConfetes = true;
    requestAnimationFrame(atualizarConfetes);
  }
}

function atualizarConfetes() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let aindaVisiveis = false;

  confetes.forEach(p => {
    p.velocidadeY += p.gravidade;
    p.x += p.velocidadeX;
    p.y += p.velocidadeY;
    p.rotacao += p.velRotacao;
    p.opacidade -= 0.007;

    if (p.opacidade > 0) {
      aindaVisiveis = true;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotacao * Math.PI) / 180);
      ctx.globalAlpha = Math.max(p.opacidade, 0);
      ctx.fillStyle = p.cor;
      ctx.fillRect(-p.raio, -p.raio, p.raio * 2, p.raio * 1.5);
      ctx.restore();
    }
  });

  if (aindaVisiveis) {
    requestAnimationFrame(atualizarConfetes);
  } else {
    animandoConfetes = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

/* ===================================================
   9. EVENTOS E TECLADO
   =================================================== */
spinBtn.addEventListener('click', girar);
resetBtn.addEventListener('click', recomecar);

// Atalho: Barra de Espaço para girar
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !estaGirando && !gameContainer.classList.contains('hidden')) {
    // Apenas gira se o foco não estiver no input de texto
    if (document.activeElement !== betInput) {
      e.preventDefault();
      girar();
    }
  }
});

// Ativar / Desativar som
soundBtn.addEventListener('click', () => {
  somAtivo = !somAtivo;
  soundBtn.textContent = somAtivo ? '🔊' : '🔇';
  soundBtn.title = somAtivo ? 'Desativar Som' : 'Ativar Som';
});

// Inicialização da grade na tela
atualizarExibicaoGrade();
