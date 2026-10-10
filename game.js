/* =========================================================
   90 DÍAS EN LOS ENLACES — lógica del juego
   (adaptación web del proyecto Java, ampliada)
   ========================================================= */
"use strict";

/* =========================================================
   1. DATOS DEL JUEGO
   ========================================================= */

/* ---------- Dificultades (clase Jugador) ---------- */
const DIFICULTADES = {
  1: { nombre: "NERD",      emoji: "🤓", energiaMax: 12, costeEstudiar: 6, costeRelajarse: 3, estudio: 6, estres: 3, tiempo: 18 },
  2: { nombre: "MEDIOCRE",  emoji: "😐", energiaMax: 10, costeEstudiar: 7, costeRelajarse: 3, estudio: 5, estres: 4, tiempo: 15 },
  3: { nombre: "FRACASADO", emoji: "💀", energiaMax: 8,  costeEstudiar: 7, costeRelajarse: 4, estudio: 4, estres: 5, tiempo: 12 }
};

const DIAS_TOTALES = 90;
const ESTRES_LIMITE = 20;
const ESTRES_CONTAGIO = 15;  // a partir de aquí el estrés se contagia a las demás asignaturas
const NIVEL_ESCALA = 100;
const ESTRES_ESCALA = 30;
const DIAS_RECUPERACION = 3; // la recuperación es 3 días después del examen
const RENDIMIENTO = [1, 0.6, 0.3]; // 1ª, 2ª y 3ª+ vez que estudias la misma asignatura en un día

const COSTES = { deporte: 4, fiesta: 5, quedar: 3, apuntes: 1 };

/* ---------- Asignaturas y compañeros ---------- */
const ASIGNATURAS = [
  { nombre: "Programación",           clave: "prog", ico: "☕", comp: 0 },
  { nombre: "Bases de Datos",         clave: "bd",   ico: "🗄️", comp: 1 },
  { nombre: "Entornos de Desarrollo", clave: "ed",   ico: "🛠️", comp: 2 }
];

const COMPANEROS = [
  { nombre: "Lucía",  emoji: "👩‍💻", asig: 0, frases: ["Te enseña un truco con los bucles.", "Os pasáis la tarde programando un bot.", "Te habla de su proyecto en Java."] },
  { nombre: "Marcos", emoji: "🧔",  asig: 1, frases: ["Os tomáis algo y te explica los JOIN con servilletas.", "Te cuenta su teoría sobre la normalización.", "Jugáis al futbolín."] },
  { nombre: "Iker",   emoji: "🧑‍🔧", asig: 2, frases: ["Te configura Git en el portátil.", "Os echáis unas partidas online.", "Te enseña sus atajos de Eclipse."] }
];

/* ---------- Calendario ---------- */
// El curso empieza el lunes 15 de septiembre
const INICIO_CURSO = new Date(2025, 8, 15);
const DIAS_SEMANA = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
const MESES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
const FESTIVOS = {
  28: "Día de la Hispanidad",
  48: "Todos los Santos",
  83: "Día de la Constitución",
  85: "La Inmaculada"
};

/* ---------- Clima ----------
   Cada clima modifica lo que consigues con las acciones:
   estudio  → nivel extra al estudiar        estres → estrés extra al estudiar
   energia  → energía máxima del día         relax  → estrés extra que quita relajarse
   deporte  → estrés extra que quita deporte fiesta → estrés extra que quita la fiesta
   siesta   → energía extra de la siesta                                              */
const CLIMAS = {
  soleado:  { nombre: "Soleado",      ico: "☀️", mod: { relax: 1, deporte: 2, fiesta: 1 },
              desc: "Hace un día precioso: el deporte y relajarse rinden más." },
  nublado:  { nombre: "Nublado",      ico: "☁️", mod: { estudio: 1, deporte: -1 },
              desc: "Día gris, perfecto para encerrarse: +1 📚 al estudiar." },
  lluvia:   { nombre: "Lluvia",       ico: "🌧️", mod: { estudio: 1, deporte: -2, fiesta: -2, siesta: 1 },
              desc: "Llueve: +1 📚 al estudiar, pero el deporte y la fiesta rinden menos." },
  tormenta: { nombre: "Tormenta",     ico: "⛈️", mod: { energia: -2, estres: 1, deporte: -3, fiesta: -3, siesta: 2 },
              desc: "Los truenos no te dejan dormir: −2 ⚡ máx. y +1 🔥 al estudiar." },
  nieve:    { nombre: "Nieve",        ico: "❄️", mod: { energia: 2, estudio: -1, relax: 2, deporte: -1 },
              desc: "¡Nieva! Se suspenden las clases: +2 ⚡ máx., pero cuesta concentrarse." },
  viento:   { nombre: "Viento",       ico: "💨", mod: { estudio: -1, estres: 1, deporte: -1 },
              desc: "El viento no para de golpear la ventana: −1 📚 y +1 🔥 al estudiar." },
  niebla:   { nombre: "Niebla",       ico: "🌫️", mod: { estudio: -1, siesta: 2, relax: 1 },
              desc: "Todo está borroso, tú también: −1 📚, pero la siesta da +2 ⚡." },
  calor:    { nombre: "Ola de calor", ico: "🔥", mod: { energia: -2, estres: 1, relax: 1, fiesta: 2 },
              desc: "Hace un calor insoportable: −2 ⚡ máx. y +1 🔥 al estudiar." }
};

// Probabilidad de cada clima según el mes (septiembre = 8 … diciembre = 11)
const CLIMA_POR_MES = {
  8:  [["soleado", 35], ["calor", 25], ["nublado", 15], ["viento", 10], ["lluvia", 10], ["tormenta", 5]],
  9:  [["soleado", 25], ["nublado", 25], ["lluvia", 20], ["viento", 15], ["niebla", 10], ["tormenta", 5]],
  10: [["nublado", 25], ["lluvia", 25], ["niebla", 15], ["viento", 15], ["tormenta", 10], ["soleado", 10]],
  11: [["nieve", 30], ["nublado", 20], ["niebla", 15], ["viento", 15], ["lluvia", 10], ["soleado", 10]]
};

/* ---------- Evaluaciones y banco de preguntas ----------
   Formato: [enunciado, [opción 1, opción 2, opción 3], índice de la correcta]
   En cada examen salen 5 preguntas al azar de las 12 de cada asignatura. */
const EVALUACIONES = {
  30: {
    nombre: "1ª EVALUACIÓN", idx: 0, nivelMinimo: 30,
    banco: {
      prog: [
        ["¿Qué palabra crea un objeto en Java?", ["new", "class", "void"], 0],
        ["¿Tipo para números enteros?", ["double", "int", "String"], 1],
        ["¿Método principal del programa?", ["start", "run", "main"], 2],
        ["¿Estructura que repite mientras la condición sea verdadera?", ["if", "for", "while"], 2],
        ["¿Clase típica para leer por teclado?", ["Input", "Scanner", "Console"], 1],
        ["¿Qué operador compara si dos int son iguales?", ["=", "==", "equals"], 1],
        ["¿Qué tipo de dato guarda true o false?", ["boolean", "bit", "int"], 0],
        ["¿Cómo se escribe un comentario de una línea?", ["#", "//", "<!-- -->"], 1],
        ["¿Qué imprime System.out.println(7 / 2)?", ["3.5", "3", "4"], 1],
        ["¿Qué palabra devuelve un valor desde un método?", ["return", "break", "yield"], 0],
        ["¿Cuál es el índice del primer elemento de un array?", ["1", "0", "-1"], 1],
        ["¿Qué estructura elige entre varios casos según un valor?", ["switch", "while", "try"], 0]
      ],
      bd: [
        ["¿Comando SQL para consultar datos?", ["SELECT", "INSERT", "JOIN"], 0],
        ["¿Comando para insertar datos?", ["UPDATE", "INSERT", "DELETE"], 1],
        ["¿Comando para borrar filas?", ["DROP", "DELETE", "REMOVE"], 1],
        ["¿Comando para crear una tabla?", ["CREATE", "BUILD", "MAKE"], 0],
        ["¿Cláusula para filtrar resultados?", ["ORDER BY", "GROUP BY", "WHERE"], 2],
        ["¿Qué significan las siglas SQL?", ["Structured Query Language", "Simple Query Logic", "System Quality Language"], 0],
        ["¿Cómo se llama cada fila de una tabla?", ["Atributo", "Registro", "Dominio"], 1],
        ["¿Qué identifica de forma única cada fila?", ["Clave primaria", "Clave foránea", "Índice secundario"], 0],
        ["¿Qué símbolo selecciona todas las columnas?", ["%", "*", "#"], 1],
        ["¿Qué operador busca patrones de texto?", ["LIKE", "MATCH", "FIND"], 0],
        ["¿Qué valor representa la ausencia de dato?", ["0", "NULL", "VOID"], 1],
        ["¿Qué diagrama se usa en el diseño conceptual?", ["Entidad-Relación", "Diagrama de Gantt", "Diagrama de secuencia"], 0]
      ],
      ed: [
        ["¿Sistema de control de versiones más usado?", ["Git", "Docker", "Maven"], 0],
        ["¿IDE muy común para Java en clase?", ["Visual Studio", "Eclipse", "Photoshop"], 1],
        ["¿Extensión de los archivos de código Java?", [".class", ".jar", ".java"], 2],
        ["¿Compilador de Java (comando)?", ["java", "javac", "javadoc"], 1],
        ["¿Máquina virtual de Java (siglas)?", ["JDK", "JVM", "JRE"], 1],
        ["¿Qué comando inicia un repositorio Git?", ["git start", "git init", "git new"], 1],
        ["¿Qué comando guarda los cambios en el historial?", ["git save", "git commit", "git push"], 1],
        ["¿Qué comando añade archivos al área de preparación?", ["git add", "git stage-all", "git put"], 0],
        ["¿Qué significa IDE?", ["Integrated Development Environment", "Internal Debug Editor", "Interface Design Engine"], 0],
        ["¿Qué herramienta ejecuta el código paso a paso?", ["Compilador", "Depurador", "Linter"], 1],
        ["¿Qué tipo de archivo genera javac?", [".java", ".class", ".exe"], 1],
        ["¿Qué plataforma web aloja repositorios Git?", ["GitHub", "Gmail", "Gradle"], 0]
      ]
    }
  },
  60: {
    nombre: "2ª EVALUACIÓN", idx: 1, nivelMinimo: 60,
    banco: {
      prog: [
        ["¿Palabra clave para la herencia?", ["implements", "extends", "inherit"], 1],
        ["¿Principio de la POO que oculta los datos?", ["polimorfismo", "herencia", "encapsulación"], 2],
        ["¿Colección dinámica tipo lista?", ["ArrayList", "HashMap", "VectorInt"], 0],
        ["¿Palabra clave para un método de clase?", ["final", "static", "public"], 1],
        ["¿Método para comparar Strings por contenido?", ["==", "equals", "compareToIgnoreCase"], 1],
        ["¿Cómo se llama el método que inicializa un objeto?", ["Constructor", "Inicializador", "Builder"], 0],
        ["¿Qué palabra hace referencia al objeto actual?", ["self", "this", "me"], 1],
        ["¿Qué modificador hace visible un atributo solo en su clase?", ["public", "protected", "private"], 2],
        ["¿Qué anotación indica que se sobrescribe un método?", ["@Override", "@Overload", "@Super"], 0],
        ["¿Qué palabra llama al constructor de la clase padre?", ["parent", "super", "base"], 1],
        ["¿De qué clase heredan todas las clases en Java?", ["Object", "Class", "Main"], 0],
        ["¿Qué colección guarda pares clave-valor?", ["ArrayList", "HashMap", "LinkedList"], 1]
      ],
      bd: [
        ["¿Comando para modificar datos?", ["UPDATE", "MODIFY", "CHANGE"], 0],
        ["¿Restricción para evitar duplicados?", ["NOT NULL", "UNIQUE", "PRIMARY"], 1],
        ["¿Comando para eliminar una tabla?", ["DELETE", "DROP", "REMOVE"], 1],
        ["¿Palabras para declarar la clave primaria?", ["MAIN KEY", "PRIMARY KEY", "INDEX KEY"], 1],
        ["¿Cláusula para ordenar resultados?", ["GROUP BY", "ORDER BY", "SORT"], 1],
        ["¿Qué clave enlaza con la clave primaria de otra tabla?", ["Clave candidata", "Clave foránea", "Clave única"], 1],
        ["¿Qué comando añade una columna a una tabla existente?", ["ALTER TABLE", "UPDATE TABLE", "MODIFY TABLE"], 0],
        ["¿Qué cláusula limita el número de filas en MySQL?", ["TOP", "LIMIT", "MAX"], 1],
        ["¿Qué palabra elimina filas duplicadas en un SELECT?", ["UNIQUE", "DISTINCT", "SINGLE"], 1],
        ["¿Qué restricción impide valores vacíos?", ["NOT NULL", "CHECK", "DEFAULT"], 0],
        ["¿Qué operador filtra entre dos valores?", ["BETWEEN", "RANGE", "WITHIN"], 0],
        ["¿Qué tipo de dato guarda texto de longitud variable?", ["CHAR", "VARCHAR", "TEXTFIX"], 1]
      ],
      ed: [
        ["¿Herramienta de build muy usada en Java?", ["Photoshop", "Maven", "Excel"], 1],
        ["¿Archivo principal de Maven?", ["build.xml", "config.xml", "pom.xml"], 2],
        ["¿Comando Git para subir cambios al remoto?", ["commit", "push", "upload"], 1],
        ["¿Comando Git para bajar y fusionar cambios del remoto?", ["fetch", "clone", "pull"], 2],
        ["¿Comando Git para ver el estado del repo?", ["status", "log", "branch"], 0],
        ["¿Qué comando Git muestra el historial de commits?", ["git log", "git history", "git show-all"], 0],
        ["¿Qué archivo indica a Git qué debe ignorar?", [".gitignore", ".gitconfig", ".ignore"], 0],
        ["¿Qué comando copia un repositorio remoto a tu equipo?", ["git copy", "git clone", "git fork"], 1],
        ["¿Dónde se declaran las dependencias en Maven?", ["pom.xml", "settings.gradle", "package.json"], 0],
        ["¿Qué comando Git une otra rama con la actual?", ["git merge", "git join", "git combine"], 0],
        ["¿Qué diagrama UML muestra clases y sus relaciones?", ["Diagrama de clases", "Diagrama de Gantt", "Diagrama de flujo"], 0],
        ["¿Qué es refactorizar?", ["Mejorar el código sin cambiar su comportamiento", "Añadir funcionalidades nuevas", "Borrar el repositorio"], 0]
      ]
    }
  },
  90: {
    nombre: "3ª EVALUACIÓN", idx: 2, nivelMinimo: 90,
    banco: {
      prog: [
        ["¿Palabra clave para lanzar una excepción?", ["throws", "throw", "try"], 1],
        ["¿Bloque para capturar una excepción?", ["catch", "finally", "capture"], 0],
        ["¿Bloque que siempre se ejecuta?", ["last", "always", "finally"], 2],
        ["¿Palabra clave para una clase abstracta?", ["interface", "virtual", "abstract"], 2],
        ["¿Palabra clave para definir una interfaz?", ["interface", "implements", "extends"], 0],
        ["¿Qué excepción se lanza al dividir un int entre 0?", ["NullPointerException", "ArithmeticException", "IOException"], 1],
        ["¿Qué excepción ocurre al usar una referencia null?", ["NullPointerException", "ClassCastException", "NumberFormatException"], 0],
        ["¿Qué lanza Integer.parseInt(\"hola\")?", ["NumberFormatException", "ParseException", "InputMismatchException"], 0],
        ["¿Qué palabra indica que un método puede lanzar excepciones?", ["throw", "throws", "catch"], 1],
        ["¿Cuántas clases puede extender una clase en Java?", ["Una", "Dos", "Ilimitadas"], 0],
        ["¿Qué palabra impide que una clase se herede?", ["static", "final", "private"], 1],
        ["¿Se puede crear un objeto de una clase abstracta con new?", ["Sí", "No", "Solo si es public"], 1]
      ],
      bd: [
        ["¿Comando para unir tablas?", ["UNION", "JOIN", "LINK"], 1],
        ["¿Tipo de JOIN que trae todo de la tabla izquierda?", ["RIGHT", "INNER", "LEFT"], 2],
        ["¿Función SQL para contar registros?", ["SUM", "COUNT", "TOTAL"], 1],
        ["¿Cláusula para agrupar resultados?", ["GROUP BY", "ORDER BY", "COLLECT"], 0],
        ["¿Proceso que elimina redundancia en las tablas?", ["indexación", "normalización", "relación"], 1],
        ["¿Qué función calcula la media?", ["AVG", "MEAN", "MEDIAN"], 0],
        ["¿Qué cláusula filtra grupos después de un GROUP BY?", ["WHERE", "HAVING", "FILTER"], 1],
        ["¿Qué JOIN devuelve solo las filas que coinciden en ambas tablas?", ["INNER JOIN", "LEFT JOIN", "FULL JOIN"], 0],
        ["¿Qué es una subconsulta?", ["Un SELECT dentro de otra consulta", "Una tabla temporal", "Un índice"], 0],
        ["¿Qué función devuelve el valor más alto?", ["TOP", "MAX", "HIGH"], 1],
        ["¿Cómo se llama una consulta guardada que se usa como tabla?", ["Vista", "Trigger", "Índice"], 0],
        ["¿Qué forma normal elimina los grupos repetitivos?", ["1FN", "2FN", "3FN"], 0]
      ],
      ed: [
        ["¿Framework de tests unitarios más usado en Java?", ["Mockito", "JUnit", "Selenium"], 1],
        ["¿Qué significa CI en desarrollo?", ["Code Integration", "Continuous Integration", "Central Interface"], 1],
        ["¿Comando Git para crear una rama?", ["branch", "fork", "new"], 0],
        ["¿Comando Git clásico para cambiar de rama?", ["switch-to", "move", "checkout"], 2],
        ["¿Herramienta de integración continua muy conocida?", ["Docker", "Jenkins", "Kubernetes"], 1],
        ["¿Qué anotación marca un método de test en JUnit?", ["@Test", "@Check", "@Run"], 0],
        ["¿Qué método de JUnit comprueba que dos valores son iguales?", ["assertEquals", "checkEquals", "verifySame"], 0],
        ["¿Qué prueba verifica una unidad de código aislada?", ["Unitaria", "De integración", "De aceptación"], 0],
        ["¿Qué tipo de prueba se hace sin ver el código?", ["Caja blanca", "Caja negra", "Caja gris"], 1],
        ["¿Qué comando Git deshace un commit creando otro inverso?", ["git revert", "git reset", "git undo"], 0],
        ["¿Qué herramienta crea contenedores de aplicaciones?", ["Docker", "JUnit", "Javadoc"], 0],
        ["¿Qué genera la herramienta javadoc?", ["Documentación HTML", "Bytecode", "Tests"], 0]
      ]
    }
  }
};

/* ---------- Eventos aleatorios simples (EventoAleatorio) ---------- */
const EVENTOS_SIMPLES = [
  { ico: "🔌", txt: "Se fue la luz.",          efecto: "−3 ⚡",                 aplicar: () => sumarEnergia(-3) },
  { ico: "🤝", txt: "Un compañero te ayudó.",   efecto: "+2 📚 en todas",         aplicar: () => afectarAsignaturas(2, 0) },
  { ico: "📢", txt: "Mucho ruido en casa.",     efecto: "+3 🔥 en todas",         aplicar: () => afectarAsignaturas(0, 3) },
  { ico: "🌳", txt: "Saliste a despejarte.",    efecto: "−2 🔥 en todas, −2 ⚡",  aplicar: () => { afectarAsignaturas(0, -2); sumarEnergia(-2); } },
  { ico: "☕", txt: "Te tomaste un buen café.", efecto: "+3 ⚡",                 aplicar: () => sumarEnergia(3) },
  { ico: "📱", txt: "Te distrajiste mucho.",    efecto: "−1 📚 y +2 🔥 en todas", aplicar: () => afectarAsignaturas(-1, 2) }
];

/* ---------- Eventos con elección ----------
   Son funciones porque algunos eligen al azar una asignatura o un compañero. */
const azar = arr => arr[Math.floor(Math.random() * arr.length)];

const EVENTOS_ELECCION = [
  () => ({
    ico: "🎂", titulo: "Cumpleaños de un amigo",
    texto: "Tu amigo de toda la vida celebra su cumpleaños esta noche. Dice que si no vas, no te lo perdona.",
    opciones: [
      { txt: "Ir a la fiesta", hint: "−3 ⚡ · −4 🔥 en todas",
        accion: () => { sumarEnergia(-3); afectarAsignaturas(0, -4); return "Lo pasas genial y desconectas por completo."; } },
      { txt: "Quedarte estudiando", hint: "Tus amigos se enfadarán…",
        accion: () => { estado.manana.enfadados = true; return "Te quedas en casa. Mañana nadie te va a hablar…"; } }
    ]
  }),
  () => {
    const a = azar(estado.asignaturas);
    return {
      ico: "🕵️", titulo: "Un examen filtrado",
      texto: `Alguien ha subido a un grupo el supuesto examen de ${a.nombre} del año pasado.`,
      opciones: [
        { txt: "Mirarlo", hint: "¿+4 📚? Puede ser falso…",
          accion: () => {
            if (Math.random() < 0.65) { a.nivel += 4; return `¡Era real! +4 📚 en ${a.nombre}.`; }
            a.nivel = Math.max(0, a.nivel - 2); a.estres += 2;
            return `Era falso y te ha liado: −2 📚 y +2 🔥 en ${a.nombre}.`;
          } },
        { txt: "Ignorarlo", hint: "Sin efectos",
          accion: () => "Pasas del tema. Tu conciencia está tranquila." }
      ]
    };
  },
  () => ({
    ico: "🎮", titulo: "Sale un videojuego nuevo",
    texto: "Llevas meses esperando este juego y hoy por fin sale a la venta.",
    opciones: [
      { txt: "Viciarte toda la noche", hint: "−5 🔥 en todas · mañana −4 ⚡",
        accion: () => { afectarAsignaturas(0, -5); estado.manana.energia -= 4; return "Ha merecido la pena… pero mañana vas a ser un zombi."; } },
      { txt: "Resistir la tentación", hint: "+1 🔥 en todas",
        accion: () => { afectarAsignaturas(0, 1); return "Lo dejas para las vacaciones. Qué sufrimiento."; } }
    ]
  }),
  () => {
    const a = azar(estado.asignaturas);
    return {
      ico: "👨‍🏫", titulo: "Tutoría voluntaria",
      texto: `El profe de ${a.nombre} ofrece una tutoría hoy por la tarde para resolver dudas.`,
      opciones: [
        { txt: "Ir a la tutoría", hint: `−3 ⚡ · +4 📚 en ${a.nombre}`,
          accion: () => { sumarEnergia(-3); a.nivel += 4; return `Resuelves un montón de dudas: +4 📚 en ${a.nombre}.`; } },
        { txt: "Pasar", hint: "Sin efectos",
          accion: () => "Ya preguntarás en clase… o no." }
      ]
    };
  },
  () => {
    const i = Math.floor(Math.random() * COMPANEROS.length);
    const c = COMPANEROS[i], a = estado.asignaturas[c.asig];
    return {
      ico: c.emoji, titulo: `${c.nombre} necesita ayuda`,
      texto: `${c.nombre} se ha atascado con un ejercicio de ${a.nombre} y te pide que le eches una mano.`,
      opciones: [
        { txt: "Ayudarle", hint: `−2 ⚡ · +1 ❤ · +2 📚 en ${a.nombre}`,
          accion: () => { sumarEnergia(-2); subirAmistad(i, 1); a.nivel += 2; return `Explicándolo tú también lo entiendes mejor. ${c.nombre} te lo agradece.`; } },
        { txt: "Decirle que no puedes", hint: "−1 ❤",
          accion: () => { subirAmistad(i, -1); return `${c.nombre} se queda un poco decepcionado.`; } }
      ]
    };
  },
  () => ({
    ico: "🛋️", titulo: "Tu primo se muda",
    texto: "Tu primo te pide ayuda para subir muebles a un cuarto piso sin ascensor. Promete invitarte a cenar.",
    opciones: [
      { txt: "Ayudarle", hint: "−4 ⚡ · −3 🔥 en todas · mañana +2 ⚡",
        accion: () => { sumarEnergia(-4); afectarAsignaturas(0, -3); estado.manana.energia += 2; return "Acabas destrozado, pero la cena estaba buenísima."; } },
      { txt: "Inventarte una excusa", hint: "+1 🔥 en todas",
        accion: () => { afectarAsignaturas(0, 1); return "Te quedas en casa con remordimientos."; } }
    ]
  })
];

/* ---------- Logros ---------- */
const LOGROS = [
  { id: "primer_aprobado", ico: "✅", nombre: "Primer aprobado",        desc: "Aprueba tu primer examen." },
  { id: "pleno",           ico: "🎯", nombre: "Pleno",                  desc: "Acierta las 5 preguntas de un examen." },
  { id: "matricula",       ico: "💯", nombre: "Matrícula de honor",     desc: "Saca un 10 en un examen." },
  { id: "recuperado",      ico: "🔁", nombre: "Segunda oportunidad",    desc: "Aprueba una recuperación." },
  { id: "amistad_max",     ico: "💞", nombre: "Mejores amigos",         desc: "Llega a la amistad máxima con un compañero." },
  { id: "fiestero",        ico: "🪩", nombre: "Fiestero",               desc: "Sal de fiesta 10 veces en una partida." },
  { id: "meteorologo",     ico: "🌦️", nombre: "Meteorólogo",            desc: "Vive los 8 tipos de clima en una partida." },
  { id: "superviviente",   ico: "🎓", nombre: "Superviviente",          desc: "Supera el curso." },
  { id: "maquina",         ico: "🤖", nombre: "Máquina",                desc: "Supera el curso sin relajarte nunca." },
  { id: "zen",             ico: "🧘", nombre: "Modo zen",               desc: "Supera el curso con 5 o menos de estrés total." },
  { id: "contra_todo",     ico: "💀", nombre: "Contra todo pronóstico", desc: "Supera el curso como FRACASADO." },
  { id: "perfecto",        ico: "👑", nombre: "Expediente perfecto",    desc: "Supera el curso con un 9 o más de media." }
];

/* =========================================================
   2. GUARDADO (localStorage) Y SONIDO
   ========================================================= */
const Guardado = {
  leer(clave, porDefecto) {
    try {
      const v = localStorage.getItem(clave);
      return v === null ? porDefecto : JSON.parse(v);
    } catch (e) { return porDefecto; }
  },
  escribir(clave, valor) {
    try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* sin almacenamiento */ }
  }
};

// Sonidos generados con Web Audio (no hace falta ningún archivo)
const Sonido = {
  ctx: null,
  mute: Guardado.leer("90d_mute", false),
  tono(freq, dur = 0.12, tipo = "square", vol = 0.05, retraso = 0) {
    if (this.mute) return;
    try {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      const t = this.ctx.currentTime + retraso;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = tipo;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    } catch (e) { /* audio no disponible */ }
  },
  click()   { this.tono(520, 0.05); },
  acierto() { this.tono(660, 0.1); this.tono(990, 0.16, "square", 0.05, 0.1); },
  fallo()   { this.tono(180, 0.3, "sawtooth", 0.06); this.tono(120, 0.35, "sawtooth", 0.06, 0.12); },
  evento()  { this.tono(440, 0.08); this.tono(330, 0.12, "square", 0.05, 0.08); },
  logro()   { [523, 659, 784, 1046].forEach((f, i) => this.tono(f, 0.15, "square", 0.05, i * 0.09)); },
  dia()     { this.tono(300, 0.08, "triangle", 0.08); this.tono(600, 0.14, "triangle", 0.08, 0.07); },
  tic()     { this.tono(1200, 0.03, "square", 0.03); },
  trueno()  { this.tono(60, 0.8, "sawtooth", 0.08); this.tono(45, 1, "sawtooth", 0.06, 0.15); }
};

/* =========================================================
   3. ESTADO DE LA PARTIDA
   ========================================================= */
let estado = null;

function nuevoEstado(dif) {
  const cfg = DIFICULTADES[dif];
  return {
    dif, cfg,
    dia: 1,
    energia: cfg.energiaMax,
    bloqueado: true,
    terminado: false,
    asignaturas: ASIGNATURAS.map(a => ({ ...a, nivel: 0, estres: 0 })),
    amistad: COMPANEROS.map(() => 0),
    apuntesUsados: COMPANEROS.map(() => false),
    hoy: null,
    manana: { energia: 0, estres: 0, enfadados: false },
    pendientes: [],                                   // recuperaciones: { asig, evalDia, dia }
    boletin: ASIGNATURAS.map(() => [null, null, null]), // notas por asignatura y evaluación
    logrosPartida: [],
    stats: { estudios: 0, relajaciones: 0, fiestas: 0, deportes: 0, siestas: 0, quedadas: 0,
             aciertos: 0, preguntas: 0, climas: new Set() }
  };
}

/* ---------- Utilidades ---------- */
const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];
const redondear1 = n => Math.round(n * 10) / 10;
const limitar = (n, min, max) => Math.max(min, Math.min(max, n));
const esperar = ms => new Promise(r => setTimeout(r, ms));
const aleatorio = (a, b) => a + Math.random() * (b - a);

function barajar(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function fechaDelDia(dia) {
  const f = new Date(INICIO_CURSO);
  f.setDate(f.getDate() + dia - 1);
  return f;
}

function elegirClima(mes) {
  const tabla = CLIMA_POR_MES[mes] || CLIMA_POR_MES[11];
  let r = Math.random() * tabla.reduce((s, [, p]) => s + p, 0);
  for (const [tipo, p] of tabla) {
    if ((r -= p) < 0) return tipo;
  }
  return tabla[0][0];
}

const esDiaExamen = dia => Boolean(EVALUACIONES[dia]);
const semanaExamenes = (dia = estado.dia) => dia <= DIAS_TOTALES && (dia % 30 === 0 || dia % 30 >= 25);
const climaHoy = () => CLIMAS[estado.hoy.clima];
const mod = clave => climaHoy().mod[clave] || 0;

/* ---------- Valores efectivos de hoy (cambian con el clima, amigos, etc.) ---------- */
function energiaMaxHoy() {
  const h = estado.hoy;
  return Math.max(4, estado.cfg.energiaMax + mod("energia") + (h.finde ? 2 : 0) + (h.festivo ? 2 : 0));
}
function bonusAmistad(i) {
  return Math.floor(estado.amistad[ASIGNATURAS[i].comp] / 2);
}
function gananciaEstudio(i) {
  const base = estado.cfg.estudio + mod("estudio") + bonusAmistad(i);
  const factor = RENDIMIENTO[Math.min(RENDIMIENTO.length - 1, estado.hoy.estudios[i])];
  return Math.max(1, Math.round(base * factor));
}
function estresEstudio() {
  let e = estado.cfg.estres + mod("estres");
  if (semanaExamenes()) e = Math.ceil(e * 1.5);
  return Math.max(1, e);
}
const valorRelax   = () => Math.max(1, 2 + mod("relax"));
const valorDeporte = () => Math.max(0, 3 + mod("deporte"));
const valorFiesta  = () => Math.max(1, 6 + mod("fiesta"));
const valorSiesta  = () => Math.max(1, 3 + mod("siesta"));

/* =========================================================
   4. LÓGICA (equivalente a los métodos Java, ampliada)
   ========================================================= */
function sumarEnergia(n) {
  estado.energia = limitar(estado.energia + n, 0, energiaMaxHoy());
}

function afectarAsignaturas(estudio, estres) {
  estado.asignaturas.forEach(a => {
    a.nivel = Math.max(0, a.nivel + estudio);
    a.estres = Math.max(0, a.estres + estres);
  });
}

function subirAmistad(i, n) {
  estado.amistad[i] = limitar(estado.amistad[i] + n, 0, 5);
  if (estado.amistad[i] === 5) desbloquearLogro("amistad_max");
}

function puede(coste) {
  return !estado.bloqueado && estado.energia >= coste;
}

/* ---------- Acciones ---------- */
function estudiar(i) {
  if (!puede(estado.cfg.costeEstudiar)) return;
  const a = estado.asignaturas[i];
  const nivel = gananciaEstudio(i);
  const estres = estresEstudio();
  estado.energia -= estado.cfg.costeEstudiar;
  a.nivel += nivel;
  a.estres += estres;
  estado.hoy.estudios[i]++;
  estado.stats.estudios++;

  const veces = estado.hoy.estudios[i];
  log(`Estudias ${a.nombre}: +${nivel} nivel, +${estres} estrés.` + (veces > 1 ? ` (vez nº ${veces} hoy, rindes menos)` : ""));
  if (a.estres > ESTRES_LIMITE) log(`⚠ ¡El estrés en ${a.nombre} supera ${ESTRES_LIMITE}!`, "mal");

  Sonido.click();
  const card = $$(".asig")[i];
  flotante(card, `+${nivel} 📚`, "nivel");
  flotante(card, `+${estres} 🔥`, "estres", 250);
  if (a.estres > ESTRES_LIMITE) sacudir(card);
  despuesDeAccion();
}

function relajarse() {
  if (!puede(estado.cfg.costeRelajarse)) return;
  const v = valorRelax();
  estado.energia -= estado.cfg.costeRelajarse;
  afectarAsignaturas(0, -v);
  sumarEnergia(2);
  estado.stats.relajaciones++;
  log(`Te relajas un rato: −${v} estrés en todas, recuperas 2 de energía.`, "bien");
  Sonido.click();
  flotante($("#btn-relajarse"), `−${v} 🔥`, "bien");
  despuesDeAccion();
}

function siesta() {
  if (estado.bloqueado || estado.hoy.siesta || estado.energia >= energiaMaxHoy()) return;
  const v = valorSiesta();
  estado.hoy.siesta = true;
  sumarEnergia(v);
  estado.stats.siestas++;
  log(`Te echas una siesta: +${v} de energía.`, "bien");
  Sonido.click();
  flotante($("#btn-siesta"), `+${v} ⚡`, "bien");
  despuesDeAccion();
}

function deporte() {
  if (!puede(COSTES.deporte)) return;
  const v = valorDeporte();
  estado.energia -= COSTES.deporte;
  afectarAsignaturas(0, -v);
  estado.stats.deportes++;
  log(v > 0 ? `Sales a hacer deporte: −${v} estrés en todas.` : "Intentas hacer deporte, pero con este tiempo no sirve de nada.", v > 0 ? "bien" : "");
  Sonido.click();
  flotante($("#btn-deporte"), `−${v} 🔥`, "bien");
  despuesDeAccion();
}

function fiesta() {
  if (estado.hoy.fiesta || !puede(COSTES.fiesta)) return;
  const v = valorFiesta();
  estado.hoy.fiesta = true;
  estado.energia -= COSTES.fiesta;
  afectarAsignaturas(-1, -v);
  estado.manana.energia -= 3;
  estado.stats.fiestas++;
  log(`¡Noche de fiesta! −${v} estrés y −1 nivel en todas. Mañana tendrás resaca (−3 ⚡).`, "evento");
  Sonido.evento();
  flotante($("#btn-fiesta"), `−${v} 🔥`, "bien");
  if (estado.stats.fiestas >= 10) desbloquearLogro("fiestero");
  despuesDeAccion();
}

function quedar(i) {
  if (estado.hoy.quedada || !puede(COSTES.quedar)) return;
  const c = COMPANEROS[i];
  estado.hoy.quedada = true;
  estado.energia -= COSTES.quedar;
  afectarAsignaturas(0, -2);
  subirAmistad(i, 1);
  estado.stats.quedadas++;
  log(`Quedas con ${c.nombre}. ${azar(c.frases)} (−2 estrés en todas, amistad ${estado.amistad[i]}/5)`, "bien");
  Sonido.click();
  flotante($$(".comp")[i], "+1 ❤", "bien");
  despuesDeAccion();
}

function pedirApuntes(i) {
  if (estado.amistad[i] < 4 || estado.apuntesUsados[i] || !puede(COSTES.apuntes)) return;
  const c = COMPANEROS[i], a = estado.asignaturas[c.asig];
  estado.apuntesUsados[i] = true;
  estado.energia -= COSTES.apuntes;
  a.nivel += 6;
  log(`${c.nombre} te pasa sus apuntes de ${a.nombre}: +6 nivel.`, "bien");
  Sonido.acierto();
  flotante($$(".asig")[c.asig], "+6 📚", "nivel");
  despuesDeAccion();
}

/* ---------- Fin de acción: ¿queda algo que hacer hoy? ---------- */
function hayAccionPosible() {
  const e = estado.energia, h = estado.hoy, cfg = estado.cfg;
  if (!h.siesta && e < energiaMaxHoy()) return true;
  if (e >= cfg.costeEstudiar || e >= cfg.costeRelajarse || e >= COSTES.deporte) return true;
  if (!h.fiesta && e >= COSTES.fiesta) return true;
  if (!h.quedada && e >= COSTES.quedar) return true;
  return COMPANEROS.some((_, i) => estado.amistad[i] >= 4 && !estado.apuntesUsados[i] && e >= COSTES.apuntes);
}

function despuesDeAccion() {
  render();
  if (!estado.bloqueado && !hayAccionPosible()) {
    log("No te queda energía para nada más. A dormir…");
    estado.bloqueado = true;
    render();
    setTimeout(terminarDia, 1000);
  }
}

/* ---------- Ciclo de días ---------- */
async function empezarDia() {
  estado.bloqueado = true;
  const f = fechaDelDia(estado.dia);
  estado.hoy = {
    clima: elegirClima(f.getMonth()),
    finde: f.getDay() === 0 || f.getDay() === 6,
    festivo: FESTIVOS[estado.dia] || null,
    estudios: ASIGNATURAS.map(() => 0),
    siesta: false, fiesta: false, quedada: false
  };
  estado.stats.climas.add(estado.hoy.clima);
  if (estado.stats.climas.size >= Object.keys(CLIMAS).length) desbloquearLogro("meteorologo");

  // Los apuntes se pueden pedir una vez por evaluación
  if (estado.dia === 31 || estado.dia === 61) estado.apuntesUsados = COMPANEROS.map(() => false);

  estado.energia = energiaMaxHoy();
  ponerClima(estado.hoy.clima);
  render();

  await transicionDia();

  const c = climaHoy();
  log(`DÍA ${estado.dia} · ${c.ico} ${c.nombre}`, "dia");
  log(c.desc, "clima");
  if (estado.hoy.clima === "tormenta") Sonido.trueno();
  if (estado.hoy.finde) log("Es fin de semana: +2 de energía máxima.", "bien");
  if (estado.hoy.festivo) {
    afectarAsignaturas(0, -2);
    log(`Festivo (${estado.hoy.festivo}): +2 de energía y −2 estrés en todas.`, "bien");
  }
  if (estado.dia > DIAS_TOTALES) log("Convocatoria extraordinaria: solo te queda aprobar las recuperaciones.", "examen");
  else if (semanaExamenes() && !esDiaExamen(estado.dia)) log("Semana de exámenes: estudiar estresa ×1.5.", "mal");

  // Consecuencias de lo que hiciste ayer
  const m = estado.manana;
  if (m.energia) { sumarEnergia(m.energia); log(`Por lo de ayer: ${m.energia > 0 ? "+" : ""}${m.energia} de energía.`, m.energia > 0 ? "bien" : "mal"); }
  if (m.enfadados) { afectarAsignaturas(0, 3); log("Tus amigos siguen enfadados y no te hablan: +3 estrés en todas.", "mal"); }
  estado.manana = { energia: 0, estres: 0, enfadados: false };

  // Evento del día
  const r = Math.random();
  if (r < 0.22) eventoSimple();
  else if (r < 0.40) await eventoEleccion();
  else log("Evento del día: nada especial hoy.");

  if (esDiaExamen(estado.dia)) {
    mostrarToast("📝", "HOY HAY EXAMEN", `${EVALUACIONES[estado.dia].nombre} al terminar el día`);
  }
  if (estado.pendientes.some(p => p.dia === estado.dia)) {
    mostrarToast("🔁", "HOY HAY RECUPERACIÓN", "Al terminar el día");
  }

  estado.bloqueado = false;
  despuesDeAccion();
}

async function terminarDia() {
  if (!estado || estado.terminado) return;
  estado.bloqueado = true;
  render();

  // El estrés alto se contagia a las demás asignaturas
  const estresadas = estado.asignaturas.filter(a => a.estres > ESTRES_CONTAGIO).length;
  if (estresadas) {
    estado.asignaturas.forEach(a => {
      const otras = estresadas - (a.estres > ESTRES_CONTAGIO ? 1 : 0);
      a.estres += otras;
    });
    log(`El estrés se contagia: ${estresadas} asignatura${estresadas > 1 ? "s" : ""} por encima de ${ESTRES_CONTAGIO} te agobia${estresadas > 1 ? "n" : ""}.`, "mal");
    render();
  }

  const d = estado.dia;

  if (esDiaExamen(d)) {
    await hacerExamenes(d);
  }

  const recuperacionesHoy = estado.pendientes.filter(p => p.dia === d);
  if (recuperacionesHoy.length) {
    estado.pendientes = estado.pendientes.filter(p => p.dia !== d);
    const aprobadas = await hacerRecuperaciones(recuperacionesHoy);
    if (!aprobadas) return mostrarFinal(false);
  }

  if (d >= DIAS_TOTALES && estado.pendientes.length === 0) return mostrarFinal(true);

  estado.dia++;
  empezarDia();
}

/* ---------- Eventos ---------- */
function eventoSimple() {
  const ev = azar(EVENTOS_SIMPLES);
  ev.aplicar();
  log(`Evento del día: ${ev.txt} (${ev.efecto})`, "evento");
  mostrarToast(ev.ico, "EVENTO DEL DÍA", `${ev.txt} <b>${ev.efecto}</b>`);
  Sonido.evento();
  render();
}

function eventoEleccion() {
  const ev = azar(EVENTOS_ELECCION)();
  Sonido.evento();
  return new Promise(resolve => {
    $("#evento-ico").textContent = ev.ico;
    $("#evento-titulo").textContent = ev.titulo;
    $("#evento-texto").textContent = ev.texto;
    const cont = $("#evento-opciones");
    cont.innerHTML = "";
    ev.opciones.forEach((op, k) => {
      const b = document.createElement("button");
      b.className = "evento-opcion";
      b.innerHTML = `<kbd>${k + 1}</kbd><span><b></b><small></small></span>`;
      b.querySelector("b").textContent = op.txt;
      b.querySelector("small").textContent = op.hint;
      b.addEventListener("click", () => {
        Sonido.click();
        const resultado = op.accion();
        log(`${ev.titulo}: ${op.txt}. ${resultado}`, "evento");
        abrirModal("#modal-evento", false);
        render();
        resolve();
      }, { once: true });
      cont.appendChild(b);
    });
    abrirModal("#modal-evento", true);
  });
}

/* =========================================================
   5. EXÁMENES, NOTAS Y RECUPERACIONES
   ========================================================= */
async function hacerExamenes(evalDia) {
  const ev = EVALUACIONES[evalDia];
  log(`=== ${ev.nombre} ===`, "examen");
  abrirModal("#modal-examen", true);

  for (let i = 0; i < estado.asignaturas.length; i++) {
    const { aprobado } = await examenAsignatura(evalDia, i, false);
    if (!aprobado) {
      const diaRec = evalDia + DIAS_RECUPERACION;
      estado.pendientes.push({ asig: i, evalDia, dia: diaRec });
      log(`${estado.asignaturas[i].nombre}: tendrás recuperación el día ${diaRec}.`, "mal");
    }
  }
  abrirModal("#modal-examen", false);
}

async function hacerRecuperaciones(lista) {
  log("=== RECUPERACIONES ===", "examen");
  abrirModal("#modal-examen", true);
  let todas = true;
  for (const p of lista) {
    const { aprobado } = await examenAsignatura(p.evalDia, p.asig, true);
    if (!aprobado) todas = false;
  }
  abrirModal("#modal-examen", false);
  return todas;
}

async function examenAsignatura(evalDia, i, esRecuperacion) {
  const ev = EVALUACIONES[evalDia];
  const a = estado.asignaturas[i];
  $("#examen-eval").textContent = `${esRecuperacion ? "RECUPERACIÓN · " : ""}${ev.nombre} · nivel mínimo ${ev.nivelMinimo}`;
  $("#examen-asig").textContent = `${a.ico} ${a.nombre}`;
  $(".examen").classList.toggle("recuperacion", esRecuperacion);
  pintarPasos(-1, []);

  let nota, emoji, titulo, texto, aciertos = null;

  if (a.estres > ESTRES_LIMITE) {
    nota = 1;
    emoji = "😵‍💫"; titulo = "Te quedaste en blanco";
    texto = `Llegaste con ${a.estres} de estrés (máximo ${ESTRES_LIMITE}). No recuerdas ni tu nombre.`;
  } else if (a.nivel < ev.nivelMinimo) {
    nota = redondear1(a.nivel / ev.nivelMinimo * 4);
    emoji = "📉"; titulo = "No llegabas al nivel";
    texto = `Tienes nivel ${a.nivel} y necesitabas ${ev.nivelMinimo}. Entregas el examen casi en blanco.`;
  } else {
    aciertos = await trivia(ev.banco[a.clave], i);
    if (esRecuperacion) {
      nota = aciertos * 2 - 2;  // más difícil: necesitas 4 aciertos
    } else {
      const bonusNivel = Math.min(2, (a.nivel - ev.nivelMinimo) / 10);
      nota = 1 + aciertos * 1.4 + bonusNivel - (a.estres > ESTRES_CONTAGIO ? 0.5 : 0);
    }
    nota = redondear1(limitar(nota, 0, 10));
    texto = `${aciertos} de 5 respuestas correctas.`;
    if (aciertos === 5) desbloquearLogro("pleno");
  }

  const aprobado = nota >= 5;
  if (esRecuperacion && aprobado) {
    nota = 5;
    texto += " En la recuperación la nota máxima es un 5.";
  }
  if (aciertos !== null) {
    emoji = aprobado ? (nota >= 9 ? "🤩" : "🎉") : "😢";
    titulo = aprobado ? (nota >= 9 ? "¡Sobresaliente!" : "¡Aprobado!") : "Suspenso";
    if (!aprobado) texto += esRecuperacion ? " Necesitabas 4 aciertos." : " Te ha faltado poco.";
  }

  estado.boletin[i][ev.idx] = { nota, rec: esRecuperacion };

  if (aprobado) {
    desbloquearLogro("primer_aprobado");
    if (esRecuperacion) desbloquearLogro("recuperado");
    if (nota >= 10) desbloquearLogro("matricula");
    log(`${a.nombre}: ${nota.toFixed(1)} — ${esRecuperacion ? "recuperada" : "aprobada"}.`, "bien");
  } else {
    log(`${a.nombre}: ${nota.toFixed(1)} — suspensa${esRecuperacion ? " en la recuperación" : ""}.`, "mal");
  }

  aprobado ? Sonido.acierto() : Sonido.fallo();
  await mostrarResultado(aprobado, emoji, titulo, texto, nota);
  return { nota, aprobado };
}

function prepararPregunta([enunciado, opciones, correcta]) {
  const orden = barajar(opciones.map((_, k) => k));
  return { enunciado, opciones: orden.map(k => opciones[k]), correcta: orden.indexOf(correcta) };
}

function trivia(banco, asigIdx) {
  const preguntas = barajar([...banco]).slice(0, 5).map(prepararPregunta);
  const compIdx = ASIGNATURAS[asigIdx].comp;
  const comp = COMPANEROS[compIdx];
  const hayAyuda = estado.amistad[compIdx] >= 3;
  const T = estado.cfg.tiempo;
  let ayudaUsada = false;

  return new Promise(resolve => {
    let k = 0, aciertos = 0;
    const resultados = [];

    const mostrar = () => {
      pintarPasos(k, resultados);
      const p = preguntas[k];
      const body = $("#examen-body");
      body.innerHTML = `
        <div class="pregunta-top">
          <p class="pregunta-num">PREGUNTA ${k + 1} / ${preguntas.length}</p>
          <span class="tiempo-num">${T}</span>
        </div>
        <div class="tiempo"><div class="tiempo-fill"></div></div>
        <p class="pregunta-txt"></p>
        <div class="opciones"></div>
        ${hayAyuda && !ayudaUsada ? `<button class="btn-ayuda">🤫 Pedir ayuda a ${comp.nombre} (una vez por examen)</button>` : ""}`;
      body.querySelector(".pregunta-txt").textContent = p.enunciado;

      const cont = body.querySelector(".opciones");
      const fill = body.querySelector(".tiempo-fill");
      const num = body.querySelector(".tiempo-num");
      let respondida = false;
      let restante = T;

      // Barra de tiempo
      fill.style.transitionDuration = `${T}s`;
      requestAnimationFrame(() => requestAnimationFrame(() => fill.classList.add("corriendo")));
      const reloj = setInterval(() => {
        restante--;
        num.textContent = Math.max(0, restante);
        if (restante <= 3 && restante > 0) { Sonido.tic(); num.classList.add("urgente"); }
        if (restante <= 0) responder(-1);
      }, 1000);

      const botones = p.opciones.map((op, idx) => {
        const b = document.createElement("button");
        b.className = "opcion";
        b.innerHTML = `<span class="letra">${idx + 1}</span><span></span>`;
        b.lastChild.textContent = op;
        b.addEventListener("click", () => responder(idx));
        cont.appendChild(b);
        return b;
      });

      const btnAyuda = body.querySelector(".btn-ayuda");
      if (btnAyuda) btnAyuda.addEventListener("click", () => {
        ayudaUsada = true;
        const incorrectas = botones.filter((b, idx) => idx !== p.correcta && !b.disabled);
        const descartada = azar(incorrectas);
        descartada.disabled = true;
        descartada.classList.add("descartada");
        btnAyuda.remove();
        Sonido.click();
      });

      function responder(idx) {
        if (respondida) return;
        respondida = true;
        clearInterval(reloj);
        fill.style.transition = "none";
        fill.style.width = getComputedStyle(fill).width;
        fill.classList.remove("corriendo");
        botones.forEach(b => b.disabled = true);
        if (btnAyuda) btnAyuda.disabled = true;

        const ok = idx === p.correcta;
        if (idx >= 0) botones[idx].classList.add(ok ? "correcta" : "incorrecta");
        botones[p.correcta].classList.add("correcta");
        if (idx < 0) body.insertAdjacentHTML("beforeend", `<span class="sello">¡TIEMPO!</span>`);

        if (ok) { aciertos++; estado.stats.aciertos++; Sonido.acierto(); } else Sonido.fallo();
        estado.stats.preguntas++;
        resultados.push(ok);
        pintarPasos(k, resultados);

        setTimeout(() => {
          k++;
          if (k < preguntas.length) mostrar();
          else resolve(aciertos);
        }, ok ? 800 : 1500);
      }
    };
    mostrar();
  });
}

function mostrarResultado(aprobado, emoji, titulo, texto, nota) {
  return new Promise(resolve => {
    $("#examen-body").innerHTML = `
      <div class="resultado-asig ${aprobado ? "aprobado" : "suspenso"}">
        <div class="r-emoji">${emoji}</div>
        <div class="r-nota">${nota.toFixed(1)}</div>
        <h3>${titulo}</h3>
        <p>${texto}</p>
        <button class="btn btn-primario">Continuar →</button>
      </div>`;
    $("#examen-body .btn").addEventListener("click", () => { Sonido.click(); resolve(); }, { once: true });
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

function abrirModal(sel, abrir) {
  const m = $(sel);
  m.classList.toggle("abierto", abrir);
  m.setAttribute("aria-hidden", String(!abrir));
}

/* =========================================================
   6. LOGROS Y RÉCORDS
   ========================================================= */
const logrosGuardados = () => new Set(Guardado.leer("90d_logros", []));

function desbloquearLogro(id) {
  const guardados = logrosGuardados();
  if (estado && !estado.logrosPartida.includes(id)) estado.logrosPartida.push(id);
  if (guardados.has(id)) return;
  guardados.add(id);
  Guardado.escribir("90d_logros", [...guardados]);
  const l = LOGROS.find(x => x.id === id);
  colaLogros.push(l);
  if (colaLogros.length === 1) siguienteLogro();
}

const colaLogros = [];
function siguienteLogro() {
  const l = colaLogros[0];
  if (!l) return;
  const t = $("#toast-logro");
  t.innerHTML = `<span class="tl-ico">${l.ico}</span><div><small>🏆 LOGRO DESBLOQUEADO</small><b>${l.nombre}</b><span>${l.desc}</span></div>`;
  t.classList.add("visible");
  Sonido.logro();
  setTimeout(() => {
    t.classList.remove("visible");
    setTimeout(() => { colaLogros.shift(); siguienteLogro(); }, 450);
  }, 3000);
}

function renderInicio() {
  const guardados = logrosGuardados();
  $("#logros-contador").textContent = `${guardados.size}/${LOGROS.length}`;
  $("#logros-grid").innerHTML = LOGROS.map(l => `
    <div class="logro ${guardados.has(l.id) ? "conseguido" : ""}" title="${l.desc}">
      <span class="logro-ico">${guardados.has(l.id) ? l.ico : "🔒"}</span>
      <b>${l.nombre}</b>
      <small>${l.desc}</small>
    </div>`).join("");

  const records = Guardado.leer("90d_records", {});
  $$(".dif-record").forEach(el => {
    const r = records[el.dataset.record];
    el.textContent = r ? `🏆 Récord: ${r.toFixed(2)} de media` : "Sin récord todavía";
  });
}

/* =========================================================
   7. RENDER
   ========================================================= */
function render() {
  const { cfg, dia, energia, hoy } = estado;
  const maxHoy = energiaMaxHoy();

  // Día y calendario
  $("#dia-num").textContent = dia;
  $$(".cal-dia").forEach((c, idx) => {
    const d = idx + 1;
    c.classList.toggle("pasado", d < dia);
    c.classList.toggle("hoy", d === dia);
    c.classList.toggle("recuperacion", estado.pendientes.some(p => p.dia === d));
  });

  // Texto del próximo examen
  const prox = Math.min(DIAS_TOTALES, Math.ceil(dia / 30) * 30);
  const ev = EVALUACIONES[prox];
  const rec = estado.pendientes.length ? Math.min(...estado.pendientes.map(p => p.dia)) : null;
  let txt;
  if (dia > DIAS_TOTALES) txt = `🔁 <b>CONVOCATORIA EXTRAORDINARIA</b> · recuperación el día ${rec}`;
  else if (prox === dia) txt = `📝 <b>¡HOY HAY EXAMEN!</b> ${ev.nombre} · nivel mínimo ${ev.nivelMinimo}`;
  else txt = `Próximo examen: <b>${ev.nombre}</b> en ${prox - dia} día${prox - dia === 1 ? "" : "s"} · nivel mínimo ${ev.nivelMinimo}`;
  if (rec && dia <= DIAS_TOTALES) txt += ` · 🔁 Recuperación el día <b>${rec}</b>`;
  $("#proximo-examen").innerHTML = txt;

  // Clima
  const f = fechaDelDia(dia);
  const c = climaHoy();
  $("#clima-ico").textContent = c.ico;
  $("#clima-fecha").textContent = `${DIAS_SEMANA[f.getDay()]} ${f.getDate()} ${MESES[f.getMonth()]}`;
  $("#clima-nombre").textContent = c.nombre;
  $("#clima-desc").textContent = c.desc;
  const tags = [];
  if (hoy.finde) tags.push(`<span class="tag">Fin de semana +2 ⚡</span>`);
  if (hoy.festivo) tags.push(`<span class="tag">Festivo +2 ⚡</span>`);
  if (semanaExamenes() && !esDiaExamen(dia)) tags.push(`<span class="tag rojo">Semana de exámenes 🔥×1.5</span>`);
  if (esDiaExamen(dia)) tags.push(`<span class="tag rojo">📝 Examen hoy</span>`);
  if (estado.pendientes.some(p => p.dia === dia)) tags.push(`<span class="tag rojo">🔁 Recuperación hoy</span>`);
  $("#clima-tags").innerHTML = tags.join("");

  // Energía
  $("#energia-val").textContent = energia;
  $("#energia-max").textContent = maxHoy;
  const celdas = $("#energia-celdas");
  if (celdas.children.length !== maxHoy) {
    celdas.innerHTML = "";
    for (let k = 0; k < maxHoy; k++) {
      const s = document.createElement("span");
      s.className = "celda";
      celdas.appendChild(s);
    }
  }
  [...celdas.children].forEach((s, k) => s.classList.toggle("llena", k < energia));

  // Asignaturas
  const estresE = estresEstudio();
  estado.asignaturas.forEach((a, i) => {
    const card = $$(".asig")[i];
    card.querySelector(".v-nivel").textContent = a.nivel;
    card.querySelector(".v-estres").textContent = a.estres;
    card.querySelector(".barra-nivel .barra-fill").style.width = Math.min(100, a.nivel / NIVEL_ESCALA * 100) + "%";
    const marca = card.querySelector(".barra-nivel .marca");
    marca.style.left = (ev.nivelMinimo / NIVEL_ESCALA * 100) + "%";
    marca.dataset.txt = "mín " + ev.nivelMinimo;

    const be = card.querySelector(".barra-estres");
    be.querySelector(".barra-fill").style.width = Math.min(100, a.estres / ESTRES_ESCALA * 100) + "%";
    be.classList.toggle("medio", a.estres > 10 && a.estres <= ESTRES_LIMITE);
    be.classList.toggle("alto", a.estres > ESTRES_LIMITE);

    const btn = card.querySelector(".btn-estudiar");
    btn.disabled = !puede(cfg.costeEstudiar);
    btn.querySelector(".be-info").textContent = `+${gananciaEstudio(i)} 📚 · +${estresE} 🔥 · −${cfg.costeEstudiar} ⚡`;
    card.querySelector(".asig-veces").textContent = hoy.estudios[i] ? `Hoy: ${hoy.estudios[i]}×` : "";
  });

  // Acciones
  $("#info-relajarse").textContent = `−${valorRelax()} 🔥 todas · −${cfg.costeRelajarse} +2 ⚡`;
  $("#info-siesta").textContent = hoy.siesta ? "Ya has dormido hoy" : `+${valorSiesta()} ⚡ · 1 vez al día`;
  $("#info-deporte").textContent = `−${valorDeporte()} 🔥 todas · −${COSTES.deporte} ⚡`;
  $("#info-fiesta").textContent = hoy.fiesta ? "Ya has salido hoy" : `−${valorFiesta()} 🔥 −1 📚 todas · −${COSTES.fiesta} ⚡ · resaca`;
  $("#btn-relajarse").disabled = !puede(cfg.costeRelajarse);
  $("#btn-siesta").disabled = estado.bloqueado || hoy.siesta || energia >= maxHoy;
  $("#btn-deporte").disabled = !puede(COSTES.deporte);
  $("#btn-fiesta").disabled = hoy.fiesta || !puede(COSTES.fiesta);
  $("#btn-terminar").disabled = estado.bloqueado;
  $("#btn-terminar").classList.toggle("destacado", !estado.bloqueado && !hayAccionPosible());

  // Compañeros
  COMPANEROS.forEach((comp, i) => {
    const card = $$(".comp")[i];
    const am = estado.amistad[i];
    card.querySelector(".comp-amistad").innerHTML =
      Array.from({ length: 5 }, (_, k) => `<span class="${k < am ? "lleno" : ""}">◆</span>`).join("");
    const perks = [];
    perks.push(am >= 2 ? `+${Math.floor(am / 2)} 📚 al estudiar` : "❤2: +1 📚 al estudiar");
    perks.push(am >= 3 ? "Te sopla en el examen" : "❤3: te sopla en el examen");
    perks.push(am >= 4 ? (estado.apuntesUsados[i] ? "Apuntes ya usados esta evaluación" : "Puede pasarte apuntes") : "❤4: te pasa apuntes");
    card.querySelector(".comp-perks").innerHTML = perks.map(p => `<li>${p}</li>`).join("");
    card.querySelector(".btn-quedar").disabled = hoy.quedada || !puede(COSTES.quedar);
    card.querySelector(".btn-apuntes").disabled = am < 4 || estado.apuntesUsados[i] || !puede(COSTES.apuntes);
  });
}

function construirJuego() {
  $("#perfil").innerHTML = `<span class="p-emoji">${estado.cfg.emoji}</span>${estado.cfg.nombre}`;

  // Calendario
  const cal = $("#calendario");
  cal.innerHTML = "";
  for (let d = 1; d <= DIAS_TOTALES; d++) {
    const c = document.createElement("span");
    c.className = "cal-dia" + (esDiaExamen(d) ? " examen" : "") + (FESTIVOS[d] ? " festivo" : "");
    c.title = esDiaExamen(d) ? `Día ${d} · Examen` : FESTIVOS[d] ? `Día ${d} · ${FESTIVOS[d]}` : `Día ${d}`;
    cal.appendChild(c);
  }

  // Asignaturas
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
      <span class="asig-veces"></span>
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
      <button class="btn-estudiar">Estudiar <kbd>${i + 1}</kbd><small class="be-info"></small></button>`;
    const btn = card.querySelector(".btn-estudiar");
    btn.addEventListener("click", () => estudiar(i));
    btn.addEventListener("mouseenter", () => marcarCoste(estado.cfg.costeEstudiar));
    btn.addEventListener("mouseleave", () => marcarCoste(0));
    cont.appendChild(card);
  });

  // Compañeros
  const comps = $("#companeros");
  comps.innerHTML = "";
  COMPANEROS.forEach((c, i) => {
    const card = document.createElement("article");
    card.className = "comp";
    card.innerHTML = `
      <div class="comp-head">
        <span class="comp-emoji">${c.emoji}</span>
        <div><b class="comp-nombre">${c.nombre}</b><small>Experto en ${ASIGNATURAS[c.asig].nombre}</small></div>
      </div>
      <div class="comp-amistad"></div>
      <ul class="comp-perks"></ul>
      <div class="comp-botones">
        <button class="btn-quedar">Quedar <small>−${COSTES.quedar} ⚡ · −2 🔥</small></button>
        <button class="btn-apuntes">Apuntes <small>−${COSTES.apuntes} ⚡ · +6 📚</small></button>
      </div>`;
    card.querySelector(".btn-quedar").addEventListener("click", () => quedar(i));
    card.querySelector(".btn-apuntes").addEventListener("click", () => pedirApuntes(i));
    comps.appendChild(card);
  });

  $("#log").innerHTML = "";
}

/* ---------- Pequeños efectos visuales ---------- */
function marcarCoste(n) {
  const celdas = [...$("#energia-celdas").children];
  celdas.forEach(c => c.classList.remove("coste"));
  if (!n || !estado || estado.energia < n) return;
  for (let k = estado.energia - n; k < estado.energia; k++) celdas[k].classList.add("coste");
}

function sacudir(el) {
  el.classList.remove("peligro"); void el.offsetWidth; el.classList.add("peligro");
}

function flotante(el, texto, tipo = "", retraso = 0) {
  if (!el) return;
  setTimeout(() => {
    const r = el.getBoundingClientRect();
    const f = document.createElement("span");
    f.className = `flotante ${tipo}`;
    f.textContent = texto;
    f.style.left = `${r.left + r.width / 2 + aleatorio(-30, 30)}px`;
    f.style.top = `${r.top + r.height / 3}px`;
    document.body.appendChild(f);
    f.addEventListener("animationend", () => f.remove());
  }, retraso);
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
function mostrarToast(ico, titulo, html) {
  const t = $("#toast");
  t.innerHTML = `<span class="t-ico">${ico}</span><div><small>${titulo}</small>${html}</div>`;
  t.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("visible"), 3400);
}

/* ---------- Transición entre días (estilo calendario de Persona) ---------- */
function transicionDia() {
  const d = estado.dia, f = fechaDelDia(d), c = climaHoy();
  const tr = $("#transicion");
  $("#tr-semana").textContent = DIAS_SEMANA[f.getDay()];
  $("#tr-fecha").textContent = `${String(f.getDate()).padStart(2, "0")}/${String(f.getMonth() + 1).padStart(2, "0")}`;
  $("#tr-dia").textContent = d > DIAS_TOTALES ? `EXTRA ${d - DIAS_TOTALES}` : `DÍA ${d}`;
  $("#tr-clima").textContent = `${c.ico} ${c.nombre}`;
  const extra = esDiaExamen(d) ? "📝 DÍA DE EXAMEN"
    : estado.pendientes.some(p => p.dia === d) ? "🔁 RECUPERACIÓN"
    : estado.hoy.festivo ? `🎉 ${estado.hoy.festivo}`
    : estado.hoy.finde ? "FIN DE SEMANA"
    : semanaExamenes(d) ? "SEMANA DE EXÁMENES" : "";
  $("#tr-extra").textContent = extra;
  $("#tr-extra").hidden = !extra;

  const n = $("#dia-num");
  n.classList.remove("pop"); void n.offsetWidth; n.classList.add("pop");

  Sonido.dia();
  return new Promise(resolve => {
    tr.classList.remove("saliendo");
    tr.classList.add("activa");
    let hecho = false;
    const cerrar = () => {
      if (hecho) return;
      hecho = true;
      tr.classList.add("saliendo");
      setTimeout(() => { tr.classList.remove("activa", "saliendo"); resolve(); }, 350);
    };
    tr.onclick = cerrar;
    setTimeout(cerrar, 1700);
  });
}

/* ---------- Efectos atmosféricos ---------- */
function ponerClima(tipo) {
  const fx = $("#clima-fx");
  fx.className = `clima-fx ${tipo}`;
  fx.innerHTML = "";
  const crear = (clase, n, fn) => {
    for (let k = 0; k < n; k++) {
      const e = document.createElement("span");
      e.className = clase;
      fn(e, k);
      fx.appendChild(e);
    }
  };
  const gotas = (n, min, max) => crear("gota", n, e => {
    e.style.left = `${aleatorio(-5, 120)}%`;
    e.style.height = `${aleatorio(40, 90)}px`;
    e.style.opacity = aleatorio(0.25, 0.7);
    e.style.animationDuration = `${aleatorio(min, max)}s`;
    e.style.animationDelay = `${-aleatorio(0, 2)}s`;
  });

  switch (tipo) {
    case "lluvia":
      gotas(90, 0.55, 0.9);
      break;
    case "tormenta":
      gotas(160, 0.35, 0.6);
      crear("relampago", 1, () => {});
      break;
    case "nieve":
      crear("copo", 80, e => {
        const s = aleatorio(3, 10);
        e.style.width = e.style.height = `${s}px`;
        e.style.left = `${aleatorio(0, 100)}%`;
        e.style.opacity = aleatorio(0.5, 1);
        e.style.setProperty("--vaiven", `${aleatorio(20, 70)}px`);
        e.style.animationDuration = `${aleatorio(7, 15)}s, ${aleatorio(2, 4)}s`;
        e.style.animationDelay = `${-aleatorio(0, 15)}s, ${-aleatorio(0, 4)}s`;
      });
      break;
    case "viento":
      crear("rafaga", 24, e => {
        e.style.top = `${aleatorio(0, 100)}%`;
        e.style.width = `${aleatorio(80, 280)}px`;
        e.style.animationDuration = `${aleatorio(0.6, 1.4)}s`;
        e.style.animationDelay = `${-aleatorio(0, 2)}s`;
      });
      crear("hoja", 10, (e, k) => {
        e.textContent = ["🍂", "🍁", "🍃"][k % 3];
        e.style.top = `${aleatorio(0, 90)}%`;
        e.style.fontSize = `${aleatorio(16, 30)}px`;
        e.style.animationDuration = `${aleatorio(2.5, 5)}s`;
        e.style.animationDelay = `${-aleatorio(0, 5)}s`;
      });
      break;
    case "niebla":
      crear("bruma", 5, (e, k) => {
        e.style.top = `${k * 22 - 15}%`;
        e.style.animationDuration = `${aleatorio(20, 40)}s`;
        e.style.animationDelay = `${-aleatorio(0, 40)}s`;
      });
      break;
    case "nublado":
      crear("nube", 7, e => {
        e.style.top = `${aleatorio(-8, 30)}%`;
        e.style.width = `${aleatorio(260, 520)}px`;
        e.style.height = `${aleatorio(90, 160)}px`;
        e.style.animationDuration = `${aleatorio(50, 100)}s`;
        e.style.animationDelay = `${-aleatorio(0, 100)}s`;
      });
      break;
    case "soleado":
      crear("sol", 1, () => {});
      break;
    case "calor":
      crear("sol", 1, () => {});
      crear("calima", 1, () => {});
      crear("burbuja-calor", 20, e => {
        e.style.left = `${aleatorio(0, 100)}%`;
        e.style.animationDuration = `${aleatorio(3, 6)}s`;
        e.style.animationDelay = `${-aleatorio(0, 6)}s`;
      });
      break;
  }
}

/* =========================================================
   8. PANTALLAS
   ========================================================= */
function irA(id) {
  $$(".pantalla").forEach(p => p.classList.remove("activa"));
  $(id).classList.add("activa");
  window.scrollTo(0, 0);
}

function mediaFinal() {
  const notas = estado.boletin.flat().map(n => (n ? n.nota : 0));
  return notas.reduce((s, n) => s + n, 0) / notas.length;
}

function mostrarFinal(ganado) {
  estado.terminado = true;
  estado.bloqueado = true;
  ponerClima(ganado ? "soleado" : "lluvia");

  const media = mediaFinal();
  const estresTotal = estado.asignaturas.reduce((s, a) => s + a.estres, 0);

  if (ganado) {
    desbloquearLogro("superviviente");
    if (estado.stats.relajaciones === 0) desbloquearLogro("maquina");
    if (estresTotal <= 5) desbloquearLogro("zen");
    if (estado.dif === 3) desbloquearLogro("contra_todo");
    if (media >= 9) desbloquearLogro("perfecto");
  }

  // Récord (solo si superas el curso)
  let nuevoRecord = false;
  if (ganado) {
    const records = Guardado.leer("90d_records", {});
    if (!records[estado.dif] || media > records[estado.dif]) {
      records[estado.dif] = Math.round(media * 100) / 100;
      Guardado.escribir("90d_records", records);
      nuevoRecord = true;
    }
  }

  $("#final-card").classList.toggle("perdido", !ganado);
  $("#final-emoji").textContent = ganado ? "🎓" : "💀";
  $("#final-titulo").textContent = ganado ? "¡CURSO SUPERADO!" : "GAME OVER";
  $("#final-texto").innerHTML = ganado
    ? `Has sobrevivido a los 90 días como ${estado.cfg.nombre}. Te has ganado el verano.`
      + (nuevoRecord ? `<br><b class="nuevo-record">🏆 ¡NUEVO RÉCORD!</b>` : "")
    : `Suspendiste una recuperación el día ${estado.dia}. Suspender también es aprender… o eso dicen.`;

  // Boletín de notas
  const celda = n => n
    ? `<td class="${n.nota >= 5 ? "ap" : "sus"}">${n.nota.toFixed(1)}${n.rec ? "<sup>R</sup>" : ""}</td>`
    : `<td class="vacia">—</td>`;
  $("#boletin").innerHTML = `
    <h3>Boletín de notas</h3>
    <table>
      <thead><tr><th></th><th>1ª</th><th>2ª</th><th>3ª</th></tr></thead>
      <tbody>
        ${estado.asignaturas.map((a, i) => `<tr><th>${a.ico} ${a.nombre}</th>${estado.boletin[i].map(celda).join("")}</tr>`).join("")}
      </tbody>
      <tfoot><tr><th>MEDIA</th><td colspan="3" class="${media >= 5 ? "ap" : "sus"}">${media.toFixed(2)}</td></tr></tfoot>
    </table>
    <p class="boletin-nota"><sup>R</sup> = aprobada en recuperación (nota máxima 5)</p>`;

  const s = estado.stats;
  const pct = s.preguntas ? Math.round(s.aciertos / s.preguntas * 100) : 0;
  $("#final-stats").innerHTML = `
    <div class="final-stat"><b>${s.estudios}</b><span>sesiones de estudio</span></div>
    <div class="final-stat"><b>${s.relajaciones + s.siestas + s.deportes}</b><span>descansos</span></div>
    <div class="final-stat"><b>${s.fiestas}</b><span>fiestas</span></div>
    <div class="final-stat"><b>${pct}%</b><span>aciertos</span></div>`;

  $("#final-logros").innerHTML = estado.logrosPartida.length
    ? `<h3>Logros de esta partida</h3><div class="fl-lista">${estado.logrosPartida.map(id => {
        const l = LOGROS.find(x => x.id === id);
        return `<span class="fl-logro" title="${l.desc}">${l.ico} ${l.nombre}</span>`;
      }).join("")}</div>`
    : "";

  ganado ? Sonido.logro() : Sonido.fallo();
  irA("#pantalla-final");
}

function iniciar(dif) {
  Sonido.click();
  estado = nuevoEstado(dif);
  construirJuego();
  irA("#pantalla-juego");
  log(`Empiezas el curso como ${estado.cfg.nombre}. ¡Suerte!`, "evento");
  empezarDia();
}

/* =========================================================
   9. EVENTOS DE INTERFAZ
   ========================================================= */
$$(".dif-card").forEach(b => b.addEventListener("click", () => iniciar(Number(b.dataset.dif))));
$("#btn-relajarse").addEventListener("click", relajarse);
$("#btn-siesta").addEventListener("click", siesta);
$("#btn-deporte").addEventListener("click", deporte);
$("#btn-fiesta").addEventListener("click", fiesta);
$("#btn-terminar").addEventListener("click", () => {
  if (estado && !estado.bloqueado) { log("Decides terminar el día."); terminarDia(); }
});
$("#btn-reiniciar").addEventListener("click", () => {
  Sonido.click();
  ponerClima("ninguno");
  renderInicio();
  irA("#pantalla-inicio");
});

// Previsualizar energía que gastan los botones
[["#btn-relajarse", () => estado.cfg.costeRelajarse], ["#btn-deporte", () => COSTES.deporte], ["#btn-fiesta", () => COSTES.fiesta]]
  .forEach(([sel, coste]) => {
    $(sel).addEventListener("mouseenter", () => estado && marcarCoste(coste()));
    $(sel).addEventListener("mouseleave", () => marcarCoste(0));
  });

// Sonido on/off
const btnSonido = $("#btn-sonido");
const pintarSonido = () => { btnSonido.textContent = Sonido.mute ? "🔇" : "🔊"; };
btnSonido.addEventListener("click", () => {
  Sonido.mute = !Sonido.mute;
  Guardado.escribir("90d_mute", Sonido.mute);
  pintarSonido();
  Sonido.click();
});
pintarSonido();

// Atajos de teclado
document.addEventListener("keydown", e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const tecla = e.key.toLowerCase();

  // Evento con elección: 1 / 2
  if ($("#modal-evento").classList.contains("abierto")) {
    const b = $$("#evento-opciones .evento-opcion")[Number(tecla) - 1];
    if (b) { e.preventDefault(); b.click(); }
    return;
  }
  // Examen: 1 / 2 / 3 para responder, Enter para continuar
  if ($("#modal-examen").classList.contains("abierto")) {
    const op = $$("#examen-body .opcion")[Number(tecla) - 1];
    if (op && !op.disabled) { e.preventDefault(); op.click(); }
    const cont = $("#examen-body .btn-primario");
    if (cont && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); cont.click(); }
    return;
  }
  if (!estado || !$("#pantalla-juego").classList.contains("activa")) return;

  if (["1", "2", "3"].includes(tecla)) estudiar(Number(tecla) - 1);
  else if (tecla === "r") relajarse();
  else if (tecla === "s") siesta();
  else if (tecla === "d") deporte();
  else if (tecla === "f") fiesta();
  else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); $("#btn-terminar").click(); }
});

renderInicio();
