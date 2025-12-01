const tablero = document.getElementById("tablero");
const modalDificultad = document.getElementById("modalDificultad");
const modalStats = document.getElementById("modalStats");
const btnJugar = document.getElementById("btnJugar");
const btnStats = document.getElementById("btnStats");
const resetStats = document.getElementById("resetStats");

const menuPrincipal = document.getElementById("menuPrincipal");
const modalGanador = document.getElementById("modalGanador");
const mensajeTiempo = document.getElementById("mensajeTiempo");
const btnMenu = document.getElementById("btnMenu");
const btnReintentar = document.getElementById("btnReintentar");
const timer = document.getElementById("timer"); // ⏱️ contador

let cartas = [];
let primera = null;
let segunda = null;
let intentos = 0;
let paresEncontrados = 0;
let modoActual = "";
let inicioTiempo, finTiempo;
let tableroBloqueado = false;
let tiempoRestante;
let intervaloTiempo;

// Abrir modales desde menú
btnJugar.onclick = () => {
  menuPrincipal.style.display = "none";
  modalDificultad.style.display = "block";
  document.getElementById("musicaMenu").pause();
};
btnStats.onclick = () => mostrarStats();

// Botones de dificultad
document.querySelectorAll("#modalDificultad button").forEach(btn => {
  btn.onclick = () => iniciarJuego(btn.dataset.modo);
});

// Iniciar juego
function iniciarJuego(modo) {
  modalDificultad.style.display = "none";
  tablero.innerHTML = "";
  intentos = 0;
  paresEncontrados = 0;
  modoActual = modo;
  inicioTiempo = Date.now();
  tableroBloqueado = false;

  // Pausar música de menú y reproducir música de juego
  document.getElementById("musicaMenu").pause();
  const musicaJuego = document.getElementById("musicaJuego");
  musicaJuego.currentTime = 0;
  musicaJuego.play();

  let numPares = modo === "facil" ? 4 :
                 modo === "medio" ? 8 :
                 12;

  const imagenes = [];
  for (let i = 1; i <= numPares; i++) {
    imagenes.push(`imagenes/img${i}.png`);
  }
  cartas = [...imagenes, ...imagenes].sort(() => Math.random() - 0.5);

  cartas.forEach(src => {
    const carta = document.createElement("div");
    carta.classList.add("carta");
    carta.innerHTML = `
      <div class="carta-inner">
        <div class="carta-front"><img src="${src}" width="100%" height="100%"></div>
        <div class="carta-back"></div>
      </div>`;
    carta.dataset.src = src;
    carta.dataset.matched = "false";
    carta.addEventListener("click", () => voltear(carta));
    tablero.appendChild(carta);
  });

  // 🚨 Contrarreloj: 60 segundos
  clearInterval(intervaloTiempo);
  if (modo === "contrarreloj") {
    tiempoRestante = 60;
    timer.style.display = "block";
    timer.textContent = `Tiempo: ${tiempoRestante}s`;

    intervaloTiempo = setInterval(() => {
      tiempoRestante--;
      timer.textContent = `Tiempo: ${tiempoRestante}s`;

      if (tiempoRestante <= 0) {
        clearInterval(intervaloTiempo);
        tableroBloqueado = true;
        mostrarTiempoAgotado(); // 🚨 aquí se llama la nueva función
      }
    }, 1000);
  } else {
    timer.style.display = "none"; // ocultar si no es contrarreloj
  }
}

// Voltear cartas con candado
function voltear(carta) {
  if (tableroBloqueado) return;
  if (carta.dataset.matched === "true") return;
  if (primera && carta === primera.carta) return;
  if (carta.classList.contains("flip")) return;

  carta.classList.add("flip");

  if (!primera) {
    primera = { carta, src: carta.dataset.src };
    return;
  }

  segunda = { carta, src: carta.dataset.src };
  intentos++;
  tableroBloqueado = true;

  if (primera.src === segunda.src) {
    document.getElementById("musicaAcierto").play();
    primera.carta.dataset.matched = "true";
    segunda.carta.dataset.matched = "true";
    paresEncontrados++;
    primera = null;
    segunda = null;
    tableroBloqueado = false;

    if (paresEncontrados === cartas.length / 2) {
      finTiempo = Date.now();
      const tiempo = ((finTiempo - inicioTiempo) / 1000).toFixed(2);
      clearInterval(intervaloTiempo);
      guardarStats(tiempo);
      mostrarGanador(tiempo);
    }
  } else {
    setTimeout(() => {
      primera.carta.classList.remove("flip");
      segunda.carta.classList.remove("flip");
      primera = null;
      segunda = null;
      tableroBloqueado = false;
    }, 800);
  }
}

// Guardar estadísticas
function guardarStats(tiempo) {
  const stats = JSON.parse(localStorage.getItem("stats")) || {};
  if (!stats[modoActual] || intentos < stats[modoActual].intentos) {
    stats[modoActual] = { intentos, tiempo };
  }
  localStorage.setItem("stats", JSON.stringify(stats));
}

// Mostrar estadísticas
function mostrarStats() {
  modalStats.style.display = "block";
  menuPrincipal.style.display = "none";
  const stats = JSON.parse(localStorage.getItem("stats")) || {};
  const tbody = document.querySelector("#tablaStats tbody");
  tbody.innerHTML = "";
  for (const modo in stats) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${modo}</td><td>${stats[modo].tiempo || "-"}</td><td>${stats[modo].intentos}</td>`;
    tbody.appendChild(tr);
  }
  document.getElementById("musicaMenu").pause();
}

// Reset stats
resetStats.onclick = () => {
  localStorage.removeItem("stats");
  mostrarStats();
};

// Modal ganador
function mostrarGanador(tiempo) {
  mensajeTiempo.textContent = `Tu tiempo fue: ${tiempo} segundos`;
  document.getElementById("tituloResultado").textContent = "¡Ganaste! 🎉";
  modalGanador.style.display = "block";

  document.getElementById("musicaJuego").pause();
  const musicaGanador = document.getElementById("musicaGanador");
  musicaGanador.currentTime = 0;
  musicaGanador.play();
}

// 🚨 Función para manejar cuando se acaba el tiempo en contrarreloj
function mostrarTiempoAgotado() {
  const modalGanador = document.getElementById("modalGanador");
  const mensajeTiempo = document.getElementById("mensajeTiempo");
  const tituloResultado = document.getElementById("tituloResultado");

  modalGanador.style.display = "block";
  mensajeTiempo.textContent = "⏰ ¡Se acabó el tiempo!";
  tituloResultado.textContent = "Derrota ⏰";

  // Pausar música de juego
  const musicaJuego = document.getElementById("musicaJuego");
  if (musicaJuego) musicaJuego.pause();

  // Reproducir música de derrota
  const musicaLooser = document.getElementById("musicaLooser"); // ahora apunta a derrota.mp3
  if (musicaLooser) {
    musicaLooser.pause();
    musicaLooser.currentTime = 0;
    musicaLooser.volume = 1;
    musicaLooser.play().catch(err => {
      console.warn("No se pudo reproducir musicaLooser:", err);
    });
  }

  // Bloquear tablero
  tableroBloqueado = true;
}

// Menú y reintento
btnMenu.onclick = () => {
  modalGanador.style.display = "none";
  mostrarMenu();
};

btnReintentar.onclick = () => {
  modalGanador.style.display = "none";
  modalDificultad.style.display = "block";
};

// Cerrar modales
document.querySelectorAll(".cerrar").forEach(btn => {
  btn.onclick = () => {
    const target = btn.dataset.close;
    document.getElementById(target).style.display = "none";
    mostrarMenu();
  };
});

// ❄ Copos de nieve
function crearNieve() {
  const snowflake = document.createElement("div");
  snowflake.classList.add("snowflake");
  snowflake.textContent = "❄";
  snowflake.style.left = Math.random() * window.innerWidth + "px";
  snowflake.style.animationDuration = (Math.random() * 5 + 5) + "s";
  snowflake.style.opacity = Math.random();
  snowflake.style.fontSize = (Math.random() * 10 + 10) + "px";
  document.body.appendChild(snowflake);
  setTimeout(() => snowflake.remove(), 10000);
}
setInterval(crearNieve, 300);

// Mostrar menú con música
function mostrarMenu() {
  menuPrincipal.style.display = "block";
  tablero.innerHTML = "";
  primera = null;
  segunda = null;
  tableroBloqueado = false;

  const musicaMenu = document.getElementById("musicaMenu");
  musicaMenu.currentTime = 0;
  musicaMenu.play();

  document.getElementById("musicaJuego").pause();
  document.getElementById("musicaGanador").pause();
  clearInterval(intervaloTiempo);
  timer.style.display = "none";
}