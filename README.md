# 🎓 90 Días en los Enlaces

Versión web (HTML, CSS y JavaScript) del juego de consola **90 Días en los Enlaces**, hecho originalmente en Java.

Tienes 90 días para sobrevivir al curso. Cada día gestionas tu energía entre estudiar y relajarte, y cada 30 días te toca examen. Si llegas con demasiado estrés o sin el nivel mínimo… suspendes.

## 🚀 Cómo jugar

No hace falta instalar nada: abre `index.html` en el navegador.

1. Elige tu personaje (dificultad).
2. Cada día empiezas con la energía al máximo y puede ocurrir un **evento aleatorio**.
3. Gasta tu energía:
   - **Estudiar** una asignatura → sube su nivel, pero también su estrés.
   - **Relajarse** → baja 2 de estrés en todas las asignaturas y recuperas 2 de energía.
   - **Terminar día** → pasas al día siguiente (el día también termina solo si te quedas a 0 de energía).
4. Los días **30, 60 y 90** hay examen de las tres asignaturas.

### ⌨️ Atajos de teclado

| Tecla | Acción |
|-------|--------|
| `1` `2` `3` | Estudiar Programación / Bases de Datos / Entornos de Desarrollo |
| `R` | Relajarse |
| `Espacio` / `Enter` | Terminar día |

## 🎭 Dificultades

| Personaje | Dificultad | Energía máx. | Coste estudiar | Coste relajarse | Estudio | Estrés |
|-----------|-----------|:---:|:---:|:---:|:---:|:---:|
| 🤓 NERD | Fácil | 12 | 6 | 3 | +6 | +3 |
| 😐 MEDIOCRE | Normal | 10 | 7 | 3 | +5 | +4 |
| 💀 FRACASADO | Difícil | 8 | 7 | 4 | +4 | +5 |

## 📝 Exámenes

| Evaluación | Día | Nivel mínimo |
|-----------|:---:|:---:|
| 1ª Evaluación | 30 | 30 |
| 2ª Evaluación | 60 | 60 |
| 3ª Evaluación | 90 | 90 |

En cada asignatura:

- Si el **estrés es mayor que 20** → suspendes directamente.
- Si el **nivel es menor que el mínimo** → suspendes directamente.
- Si no, haces un test de **5 preguntas** y apruebas con **3 aciertos o más**.

Un solo suspenso y es **GAME OVER**. Aprueba las tres evaluaciones para superar el curso.

## 🎲 Eventos aleatorios

Cada día hay un 35 % de probabilidad de que pase algo:

| Evento | Efecto |
|--------|--------|
| 🔌 Se fue la luz | −3 energía |
| 🤝 Un compañero te ayudó | +2 estudio en todas |
| 📢 Mucho ruido en casa | +3 estrés en todas |
| 🌳 Saliste a despejarte | −2 estrés en todas, −2 energía |
| 😴 Dormiste bien | +3 energía |
| 📱 Te distrajiste mucho | −1 estudio y +2 estrés en todas |

## 📁 Estructura

```
web/
├── index.html   # Estructura de las pantallas (inicio, juego, examen y final)
├── style.css    # Estilos, animaciones y diseño responsive
├── game.js      # Lógica del juego (adaptada de las clases Java)
└── README.md
```

### Equivalencia con el proyecto Java

| Java | Web (`game.js`) |
|------|-----------------|
| `Jugador` | objeto `estado` + funciones `estudiar()`, `relajarse()`, `sumarEnergia()`… |
| `Asignatura` | array `ASIGNATURAS` |
| `EventoAleatorio` | array `EVENTOS` + `eventoAleatorio()` |
| `PrimeraEvaluacion`, `SegundaEvaluacion`, `TerceraEvaluacion` | objeto `EVALUACIONES` |
| `Pregunta` / `Evaluacion.hacerTrivia()` | `trivia()` con preguntas tipo test |
| `Main` | `iniciar()`, `empezarDia()`, `terminarDia()` |

## 🛠️ Tecnologías

- HTML5
- CSS3 (variables, grid, flexbox, animaciones, `clip-path`, transformaciones)
- JavaScript (sin librerías)
- Fuentes: [Anton](https://fonts.google.com/specimen/Anton), [Archivo Black](https://fonts.google.com/specimen/Archivo+Black) y [Oswald](https://fonts.google.com/specimen/Oswald)
- Estética inspirada en los menús de *Persona 5 Royal* (rojo, negro y blanco, formas inclinadas y tramas de puntos)
