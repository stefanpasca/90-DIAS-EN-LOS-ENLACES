/* =========================================================
   90 DÍAS EN LOS ENLACES — lógica del juego
   (adaptación web del proyecto Java)
   ========================================================= */

/* ---------- Configuración por dificultad (clase Jugador) ---------- */
const DIFICULTADES = {
  1: { nombre: "NERD",      emoji: "🤓", energiaMax: 12, costeEstudiar: 6, costeRelajarse: 3, estudio: 6, estres: 3 },
  2: { nombre: "MEDIOCRE",  emoji: "😐", energiaMax: 10, costeEstudiar: 7, costeRelajarse: 3, estudio: 5, estres: 4 },
  3: { nombre: "FRACASADO", emoji: "💀", energiaMax: 8,  costeEstudiar: 7, costeRelajarse: 4, estudio: 4, estres: 5 }
};

const DIAS_TOTALES = 90;
const ESTRES_LIMITE = 20;
const NIVEL_ESCALA = 100;   // tope visual de la barra de nivel
const ESTRES_ESCALA = 30;   // tope visual de la barra de estrés

/* ---------- Asignaturas ---------- */
const ASIGNATURAS = [
  { nombre: "Programación",            clave: "prog", ico: "☕" },
  { nombre: "Bases de Datos",          clave: "bd",   ico: "🗄️" },
  { nombre: "Entornos de Desarrollo",  clave: "ed",   ico: "🛠️" }
];

/* ---------- Evaluaciones y preguntas (Primera/Segunda/TerceraEvaluacion) ---------- */
const EVALUACIONES = {
  30: {
    nombre: "1ª EVALUACIÓN", nivelMinimo: 30,
    preguntas: {
      prog: [
        ["¿Qué palabra crea un objeto en Java?", ["new", "class", "void"], 0],
        ["¿Tipo para números enteros?", ["double", "int", "String"], 1],
        ["¿Método principal del programa?", ["start", "run", "main"], 2],
        ["¿Estructura que repite mientras la condición sea verdadera?", ["if", "for", "while"], 2],
        ["¿Clase típica para leer por teclado?", ["Input", "Scanner", "Console"], 1]
      ],
      bd: [
        ["¿Comando SQL para consultar datos?", ["SELECT", "INSERT", "JOIN"], 0],
        ["¿Comando para insertar datos?", ["UPDATE", "INSERT", "DELETE"], 1],
        ["¿Comando para borrar filas?", ["DROP", "DELETE", "REMOVE"], 1],
        ["¿Comando para crear una tabla?", ["CREATE", "BUILD", "MAKE"], 0],
        ["¿Cláusula para filtrar resultados?", ["ORDER BY", "GROUP BY", "WHERE"], 2]
      ],
      ed: [
        ["¿Sistema de control de versiones más usado?", ["Git", "Docker", "Maven"], 0],
        ["¿IDE muy común para Java en clase?", ["Visual Studio", "Eclipse", "NetBeans"], 1],
        ["¿Extensión de archivos Java?", [".class", ".jar", ".java"], 2],
        ["¿Compilador de Java (comando)?", ["java", "javac", "javadoc"], 1],
        ["¿Máquina virtual de Java (siglas)?", ["JDK", "JVM", "JRE"], 1]
      ]
    }
  },
  60: {
    nombre: "2ª EVALUACIÓN", nivelMinimo: 60,
    preguntas: {
      prog: [
        ["¿Palabra clave para herencia?", ["implements", "extends", "inherit"], 1],
        ["¿Principio que oculta datos (POO)?", ["polimorfismo", "herencia", "encapsulación"], 2],
        ["¿Colección dinámica tipo lista?", ["ArrayList", "HashMap", "VectorInt"], 0],
        ["¿Palabra clave para método de clase?", ["final", "static", "public"], 1],
        ["¿Método para comparar Strings por contenido?", ["==", "equals", "compareToIgnoreCase"], 1]
      ],
      bd: [
        ["¿Comando para modificar datos?", ["UPDATE", "MODIFY", "CHANGE"], 0],
        ["¿Restricción para evitar duplicados?", ["NOT NULL", "UNIQUE", "PRIMARY"], 1],
        ["¿Comando para eliminar una tabla?", ["DELETE", "DROP", "REMOVE"], 1],
        ["¿Palabra para clave primaria en SQL?", ["KEY", "PRIMARY", "INDEX"], 1],
        ["¿Cláusula para ordenar resultados?", ["GROUP BY", "ORDER BY", "SORT"], 1]
      ],
      ed: [
        ["¿Herramienta de automatización/build muy usada en Java?", ["Gradle", "Maven", "AntBuild"], 1],
        ["¿Archivo principal de Maven (nombre)?", ["build.xml", "config.xml", "pom.xml"], 2],
        ["¿Comando Git para subir cambios al remoto?", ["commit", "push", "upload"], 1],
        ["¿Comando Git para bajar cambios del remoto?", ["fetch", "clone", "pull"], 2],
        ["¿Comando Git para ver estado del repo?", ["status", "log", "branch"], 0]
      ]
    }
  },
  90: {
    nombre: "3ª EVALUACIÓN", nivelMinimo: 90,
    preguntas: {
      prog: [
        ["¿Palabra clave para lanzar una excepción?", ["throws", "throw", "try"], 1],
        ["¿Bloque para capturar una excepción?", ["catch", "finally", "capture"], 0],
        ["¿Bloque que siempre se ejecuta en excepciones?", ["last", "always", "finally"], 2],
        ["¿Palabra clave para clase abstracta?", ["interface", "virtual", "abstract"], 2],
        ["¿Palabra clave para definir una interfaz?", ["interface", "implements", "extends"], 0]
      ],
      bd: [
        ["¿Comando para unir tablas?", ["UNION", "JOIN", "LINK"], 1],
        ["¿Tipo de JOIN que trae todo de la izquierda?", ["RIGHT", "INNER", "LEFT"], 2],
        ["¿Función SQL para contar registros?", ["SUM", "COUNT", "TOTAL"], 1],
        ["¿Cláusula para agrupar resultados?", ["GROUP BY", "ORDER BY", "COLLECT"], 0],
        ["¿Concepto que elimina redundancia en tablas?", ["indexación", "normalización", "relación"], 1]
      ],
      ed: [
        ["¿Framework de tests unitarios en Java?", ["Mockito", "JUnit", "TestNG"], 1],
        ["¿Qué significa CI en desarrollo?", ["Code Integration", "Continuous Integration", "Central Interface"], 1],
        ["¿Comando Git para crear una rama?", ["branch", "fork", "new"], 0],
        ["¿Comando Git para cambiar de rama?", ["switch", "move", "checkout"], 2],
        ["¿Herramienta de integración continua muy conocida?", ["Docker", "Jenkins", "Kubernetes"], 1]
      ]
    }
  }
};

/* ---------- Eventos aleatorios (EventoAleatorio) ---------- */
const EVENTOS = [
  { ico: "🔌", txt: "Se fue la luz.",              efecto: "−3 ⚡",                     aplicar: () => sumarEnergia(-3) },
  { ico: "🤝", txt: "Un compañero te ayudó.",       efecto: "+2 📚 en todas",             aplicar: () => afectarAsignaturas(2, 0) },
  { ico: "📢", txt: "Mucho ruido en casa.",         efecto: "+3 🔥 en todas",             aplicar: () => afectarAsignaturas(0, 3) },
  { ico: "🌳", txt: "Saliste a despejarte.",        efecto: "−2 🔥 en todas, −2 ⚡",      aplicar: () => { afectarAsignaturas(0, -2); sumarEnergia(-2); } },
  { ico: "😴", txt: "Dormiste bien.",               efecto: "+3 ⚡",                      aplicar: () => sumarEnergia(3) },
  { ico: "📱", txt: "Te distrajiste mucho.",        efecto: "−1 📚, +2 🔥 en todas",      aplicar: () => afectarAsignaturas(-1, 2) }
];

/* =========================================================
   ESTADO
   ========================================================= */
let estado = null;

function nuevoEstado(dif) {
  return {
    dif,
    cfg: DIFICULTADES[dif],
    dia: 1,
    energia: DIFICULTADES[dif].energiaMax,
    aprobado: true,
    bloqueado: false,
    asignaturas: ASIGNATURAS.map(a => ({ ...a, nivel: 0, estres: 0 })),
    stats: { estudios: 0, relajaciones: 0, aciertos: 0, preguntas: 0 }
  };
}

/* ---------- Lógica (equivalente a los métodos Java) ---------- */
function sumarEnergia(n) {
  estado.energia = Math.max(0, Math.min(estado.cfg.energiaMax, estado.energia + n));
}

function afectarAsignaturas(estudio, estres) {
  estado.asignaturas.forEach(a => {
    a.nivel = Math.max(0, a.nivel + estudio);
    a.estres = Math.max(0, a.estres + estres);
  });
}

function estudiar(i) {
  if (estado.bloqueado || estado.energia < estado.cfg.costeEstudiar) return;
  estado.energia -= estado.cfg.costeEstudiar;
  const a = estado.asignaturas[i];
  a.nivel += estado.cfg.estudio;
  a.estres += estado.cfg.estres;
  estado.stats.estudios++;
  log(`Estudias ${a.nombre}: +${estado.cfg.estudio} nivel, +${estado.cfg.estres} estrés.`);
  if (a.estres > ESTRES_LIMITE) log(`⚠ ¡El estrés en ${a.nombre} supera ${ESTRES_LIMITE}!`, "mal");
  render();
  sacudir(i);
  comprobarFinDeEnergia();
}

function relajarse() {
  if (estado.bloqueado || estado.energia < estado.cfg.costeRelajarse) return;
  estado.energia -= estado.cfg.costeRelajarse;
  estado.asignaturas.forEach(a => a.estres = Math.max(0, a.estres - 2));
  sumarEnergia(2);
  estado.stats.relajaciones++;
  log("Te relajas un rato: −2 estrés en todas, recuperas 2 de energía.", "bien");
  render();
  comprobarFinDeEnergia();
}

function comprobarFinDeEnergia() {
  // En el Java el día acaba solo cuando la energía llega a 0
  if (estado.energia <= 0) {
    log("Te has quedado sin energía. A dormir…");
    estado.bloqueado = true;
    render();
    setTimeout(terminarDia, 900);
  }
}

function eventoAleatorio() {
  if (Math.random() * 100 >= 35) {
    log("Evento del día: nada especial hoy.");
    return;
  }
  const ev = EVENTOS[Math.floor(Math.random() * EVENTOS.length)];
  ev.aplicar();
  log(`Evento del día: ${ev.txt} (${ev.efecto})`, "evento");
  mostrarToast(ev);
}

function empezarDia() {
  estado.energia = estado.cfg.energiaMax;
  estado.bloqueado = false;
  log(`DÍA ${estado.dia}`, "dia");
  eventoAleatorio();
  render();
  const n = $("#dia-num");
  n.classList.remove("pop"); void n.offsetWidth; n.classList.add("pop");
}

async function terminarDia() {
  estado.bloqueado = true;
  render();

  if (estado.dia % 30 === 0) {
    await hacerExamenes(EVALUACIONES[estado.dia]);
  }

  if (!estado.aprobado) return mostrarFinal(false);
  if (estado.dia >= DIAS_TOTALES) return mostrarFinal(true);

  estado.dia++;
  empezarDia();
}

/* =========================================================
   EXAMEN
   ========================================================= */
async function hacerExamenes(evaluacion) {
  log(`=== ${evaluacion.nombre} ===`, "examen");
  $("#examen-eval").textContent = evaluacion.nombre + ` · nivel mínimo ${evaluacion.nivelMinimo}`;
  abrirModal(true);

  for (const a of estado.asignaturas) {
    $("#examen-asig").textContent = `${a.ico} ${a.nombre}`;
    pintarPasos(-1, []);

    if (a.estres > ESTRES_LIMITE) {
      estado.aprobado = false;
      log(`${a.nombre}: suspendido por estrés alto.`, "mal");
      await mostrarResultado(false, "😵‍💫", "Suspendido por estrés",
        `Llegaste al examen con ${a.estres} de estrés (máximo ${ESTRES_LIMITE}). Te quedaste en blanco.`);
      continue;
    }
    if (a.nivel < evaluacion.nivelMinimo) {
      estado.aprobado = false;
      log(`${a.nombre}: suspendido por nivel bajo.`, "mal");
      await mostrarResultado(false, "📉", "Suspendido por nivel bajo",
        `Tienes nivel ${a.nivel} y necesitabas ${evaluacion.nivelMinimo}. No te dio tiempo a repasar.`);
      continue;
    }

    const aciertos = await trivia(evaluacion.preguntas[a.clave]);
    if (aciertos >= 3) {
      log(`${a.nombre}: ¡aprobado! (${aciertos}/5)`, "bien");
      await mostrarResultado(true, "🎉", "¡Felicidades, has aprobado!", `${aciertos} de 5 respuestas correctas.`);
    } else {
      estado.aprobado = false;
      log(`${a.nombre}: suspendido (${aciertos}/5).`, "mal");
      await mostrarResultado(false, "😢", "Qué pena, has suspendido", `Solo ${aciertos} de 5. Necesitabas al menos 3.`);
    }
  }

  abrirModal(false);
}

function trivia(preguntas) {
  return new Promise(resolve => {
    let i = 0, aciertos = 0;
    const resultados = [];

    const mostrar = () => {
      pintarPasos(i, resultados);
      const [enunciado, opciones, correcta] = preguntas[i];
      const body = $("#examen-body");
      body.innerHTML = `
        <p class="pregunta-num">PREGUNTA ${i + 1} / ${preguntas.length}</p>
        <p class="pregunta-txt"></p>
        <div class="opciones"></div>`;
      body.querySelector(".pregunta-txt").textContent = enunciado;
      const cont = body.querySelector(".opciones");

      opciones.forEach((op, idx) => {
        const b = document.createElement("button");
        b.className = "opcion";
        b.innerHTML = `<span class="letra">${idx + 1}</span><span></span>`;
        b.lastChild.textContent = op;
        b.addEventListener("click", () => {
          cont.querySelectorAll("button").forEach(x => x.disabled = true);
          const ok = idx === correcta;
          b.classList.add(ok ? "correcta" : "incorrecta");
          cont.children[correcta].classList.add("correcta");
          if (ok) aciertos++;
          resultados.push(ok);
          estado.stats.preguntas++;
          if (ok) estado.stats.aciertos++;
          pintarPasos(i, resultados);
          setTimeout(() => {
            i++;
            if (i < preguntas.length) mostrar();
            else resolve(aciertos);
          }, ok ? 750 : 1400);
        });
        cont.appendChild(b);
      });
    };
    mostrar();
  });
}

function mostrarResultado(aprobado, emoji, titulo, texto) {
  return new Promise(resolve => {
    $("#examen-body").innerHTML = `
      <div class="resultado-asig ${aprobado ? "aprobado" : "suspenso"}">
        <div class="r-emoji">${emoji}</div>
        <h3>${titulo}</h3>
        <p>${texto}</p>
        <button class="btn btn-primario">Continuar →</button>
      </div>`;
    $("#examen-body .btn").addEventListener("click", resolve, { once: true });
  });
}

function pintarPasos(actual, resultados) {
  const cont = $("#examen-pasos");
  cont.innerHTML = "";
  for (let k = 0; k < 5; k++) {
    const p = document.createElement("span");
    p.className = "paso";
    if (k < resultados.length) p.classList.add(resultados[k] ? "ok" : "ko");
    else if (k === actual) p.classList.add("actual");
    cont.appendChild(p);
  }
}

function abrirModal(abrir) {
  const m = $("#modal-examen");
  m.classList.toggle("abierto", abrir);
  m.setAttribute("aria-hidden", String(!abrir));
}

/* =========================================================
   RENDER
   ========================================================= */
const $ = sel => document.querySelector(sel);

function render() {
  const { cfg, dia, energia } = estado;

  // Día y calendario
  $("#dia-num").textContent = dia;
  document.querySelectorAll(".cal-dia").forEach((c, idx) => {
    const d = idx + 1;
    c.classList.toggle("pasado", d < dia);
    c.classList.toggle("hoy", d === dia);
  });
  const prox = Math.ceil(dia / 30) * 30;
  const faltan = prox - dia;
  const ev = EVALUACIONES[prox];
  $("#proximo-examen").innerHTML = faltan === 0
    ? `📝 <b>¡HOY HAY EXAMEN!</b> ${ev.nombre} · nivel mínimo ${ev.nivelMinimo} al terminar el día`
    : `Próximo examen: <b>${ev.nombre}</b> en ${faltan} día${faltan === 1 ? "" : "s"} · nivel mínimo ${ev.nivelMinimo}`;

  // Energía
  $("#energia-val").textContent = energia;
  $("#energia-max").textContent = cfg.energiaMax;
  const celdas = $("#energia-celdas");
  if (celdas.children.length !== cfg.energiaMax) {
    celdas.innerHTML = "";
    for (let k = 0; k < cfg.energiaMax; k++) {
      const c = document.createElement("span");
      c.className = "celda";
      celdas.appendChild(c);
    }
  }
  [...celdas.children].forEach((c, k) => c.classList.toggle("llena", k < energia));

  // Asignaturas
  const puedeEstudiar = !estado.bloqueado && energia >= cfg.costeEstudiar;
  estado.asignaturas.forEach((a, i) => {
    const card = document.querySelectorAll(".asig")[i];
    card.querySelector(".v-nivel").textContent = a.nivel;
    card.querySelector(".v-estres").textContent = a.estres;
    card.querySelector(".barra-nivel .barra-fill").style.width = Math.min(100, a.nivel / NIVEL_ESCALA * 100) + "%";
    card.querySelector(".barra-nivel .marca").style.left = (ev.nivelMinimo / NIVEL_ESCALA * 100) + "%";
    card.querySelector(".barra-nivel .marca").dataset.txt = "mín " + ev.nivelMinimo;

    const be = card.querySelector(".barra-estres");
    be.querySelector(".barra-fill").style.width = Math.min(100, a.estres / ESTRES_ESCALA * 100) + "%";
    be.classList.toggle("medio", a.estres > 10 && a.estres <= ESTRES_LIMITE);
    be.classList.toggle("alto", a.estres > ESTRES_LIMITE);

    card.querySelector(".btn-estudiar").disabled = !puedeEstudiar;
  });

  // Botones
  $("#btn-relajarse").disabled = estado.bloqueado || energia < cfg.costeRelajarse;
  $("#btn-terminar").disabled = estado.bloqueado;
  $("#btn-terminar").classList.toggle("destacado",
    !estado.bloqueado && energia < cfg.costeEstudiar && energia < cfg.costeRelajarse);
}

function construirJuego() {
  // Perfil
  $("#perfil").innerHTML = `<span class="p-emoji">${estado.cfg.emoji}</span>${estado.cfg.nombre}`;
  $("#relax-info").textContent = `−${estado.cfg.costeRelajarse} ⚡ +2 ⚡ · −2 🔥 en todas`;

  // Calendario
  const cal = $("#calendario");
  cal.innerHTML = "";
  for (let d = 1; d <= DIAS_TOTALES; d++) {
    const c = document.createElement("span");
    c.className = "cal-dia" + (d % 30 === 0 ? " examen" : "");
    c.title = d % 30 === 0 ? `Día ${d} · Examen` : `Día ${d}`;
    cal.appendChild(c);
  }

  // Tarjetas de asignatura
  const cont = $("#asignaturas");
  cont.innerHTML = "";
  estado.asignaturas.forEach((a, i) => {
    const card = document.createElement("article");
    card.className = "asig";
    card.innerHTML = `
      <div class="asig-head">
        <span class="asig-ico">${a.ico}</span>
        <span class="asig-nombre">${a.nombre}</span>
      </div>
      <div>
        <div class="stat-head"><span>📚 Nivel</span><b class="v-nivel">0</b></div>
        <div class="barra barra-nivel"><div class="barra-fill"></div><span class="marca"></span></div>
      </div>
      <div>
        <div class="stat-head"><span>🔥 Estrés</span><b class="v-estres">0</b></div>
        <div class="barra barra-estres"><div class="barra-fill"></div>
          <span class="marca" style="left:${ESTRES_LIMITE / ESTRES_ESCALA * 100}%" data-txt="límite ${ESTRES_LIMITE}"></span>
        </div>
      </div>
      <button class="btn-estudiar">Estudiar · −${estado.cfg.costeEstudiar} ⚡</button>`;
    card.querySelector(".btn-estudiar").addEventListener("click", () => estudiar(i));

    // Previsualizar coste de energía al pasar el ratón
    const btn = card.querySelector(".btn-estudiar");
    btn.addEventListener("mouseenter", () => marcarCoste(estado.cfg.costeEstudiar));
    btn.addEventListener("mouseleave", () => marcarCoste(0));
    cont.appendChild(card);
  });

  $("#log").innerHTML = "";
}

function marcarCoste(n) {
  const celdas = [...$("#energia-celdas").children];
  celdas.forEach(c => c.classList.remove("coste"));
  if (!n || estado.energia < n) return;
  for (let k = estado.energia - n; k < estado.energia; k++) celdas[k].classList.add("coste");
}

function sacudir(i) {
  const a = estado.asignaturas[i];
  if (a.estres <= ESTRES_LIMITE) return;
  const card = document.querySelectorAll(".asig")[i];
  card.classList.remove("peligro"); void card.offsetWidth; card.classList.add("peligro");
}

function log(texto, tipo = "") {
  const li = document.createElement("li");
  li.textContent = texto;
  if (tipo) li.className = tipo;
  const ol = $("#log");
  ol.appendChild(li);
  ol.scrollTop = ol.scrollHeight;
}

let toastTimer;
function mostrarToast(ev) {
  const t = $("#toast");
  t.innerHTML = `<span class="t-ico">${ev.ico}</span><div><small>EVENTO DEL DÍA</small>${ev.txt} <b>${ev.efecto}</b></div>`;
  t.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("visible"), 3200);
}

/* =========================================================
   PANTALLAS
   ========================================================= */
function irA(id) {
  document.querySelectorAll(".pantalla").forEach(p => p.classList.remove("activa"));
  $(id).classList.add("activa");
  window.scrollTo(0, 0);
}

function mostrarFinal(ganado) {
  const card = $("#final-card");
  card.classList.toggle("perdido", !ganado);
  $("#final-emoji").textContent = ganado ? "🎓" : "💀";
  $("#final-titulo").textContent = ganado ? "¡CURSO SUPERADO!" : "GAME OVER";
  $("#final-texto").textContent = ganado
    ? `Has sobrevivido a los 90 días como ${estado.cfg.nombre}. Las tres evaluaciones, aprobadas. Te has ganado el verano.`
    : `Tu curso terminó el día ${estado.dia}. Suspender también es aprender… o eso dicen.`;
  const pct = estado.stats.preguntas ? Math.round(estado.stats.aciertos / estado.stats.preguntas * 100) : 0;
  $("#final-stats").innerHTML = `
    <div class="final-stat"><b>${estado.stats.estudios}</b><span>sesiones de estudio</span></div>
    <div class="final-stat"><b>${estado.stats.relajaciones}</b><span>veces relajado</span></div>
    <div class="final-stat"><b>${pct}%</b><span>aciertos en exámenes</span></div>`;
  irA("#pantalla-final");
}

function iniciar(dif) {
  estado = nuevoEstado(dif);
  construirJuego();
  irA("#pantalla-juego");
  log(`Empiezas el curso como ${estado.cfg.nombre}. ¡Suerte!`, "evento");
  empezarDia();
}

/* ---------- Eventos de interfaz ---------- */
document.querySelectorAll(".dif-card").forEach(b =>
  b.addEventListener("click", () => iniciar(Number(b.dataset.dif)))
);
$("#btn-relajarse").addEventListener("click", relajarse);
$("#btn-relajarse").addEventListener("mouseenter", () => marcarCoste(estado.cfg.costeRelajarse));
$("#btn-relajarse").addEventListener("mouseleave", () => marcarCoste(0));
$("#btn-terminar").addEventListener("click", () => { if (!estado.bloqueado) { log("Decides terminar el día."); terminarDia(); } });
$("#btn-reiniciar").addEventListener("click", () => irA("#pantalla-inicio"));

// Atajos de teclado: 1-3 estudiar, R relajarse, Espacio/Enter terminar día
document.addEventListener("keydown", e => {
  if (!estado || !$("#pantalla-juego").classList.contains("activa")) return;
  if ($("#modal-examen").classList.contains("abierto")) return;
  if (["1", "2", "3"].includes(e.key)) estudiar(Number(e.key) - 1);
  else if (e.key.toLowerCase() === "r") relajarse();
  else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); $("#btn-terminar").click(); }
});
