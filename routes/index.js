
var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Abrir o crear base de datos SQLite
const dbPath = path.resolve(__dirname, '../encuesta.db');
const db = new sqlite3.Database(dbPath);

// Crear tabla si no existe
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS respuestas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipoAtencion TEXT,
    fechaActual TEXT,
    fechaAtencion TEXT,
    nombreCompleto TEXT,
    edadEncuestado INTEGER,
    idIdentificacion TEXT,
    telefono TEXT,
    epsPaciente TEXT,
    pregunta1 TEXT,
    pregunta2 TEXT,
    pregunta3 TEXT,
    pregunta4 TEXT,
    pregunta5 TEXT,
    pregunta6 TEXT,
    pregunta7 TEXT,
    pregunta8 TEXT,
    pregunta9 TEXT,
    pregunta10 TEXT,
    pregunta11 TEXT,
    pregunta12 TEXT,
    pregunta13 TEXT,
    pregunta14 TEXT,
    comentarios TEXT,
    fechaRegistro TEXT
  )`);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Encuesta' });
});

// POST route to receive survey form submission and save to DB
router.post('/submit', function(req, res, next) {
  const r = req.body;
  const fechaRegistro = new Date().toISOString();

  const stmt = db.prepare(`INSERT INTO respuestas (
    tipoAtencion, fechaActual, fechaAtencion, nombreCompleto, edadEncuestado, idIdentificacion, telefono, epsPaciente,
    pregunta1, pregunta2, pregunta3, pregunta4, pregunta5, pregunta6, pregunta7, pregunta8, pregunta9,
    pregunta10, pregunta11, pregunta12, pregunta13, pregunta14, comentarios, fechaRegistro
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  stmt.run(
    r.tipoAtencion, r.fechaActual, r.fechaAtencion, r.nombreCompleto, r.edadEncuestado, r.idIdentificacion, r.telefono, r.epsPaciente,
    r.pregunta1, r.pregunta2, r.pregunta3, r.pregunta4, r.pregunta5, r.pregunta6, r.pregunta7, r.pregunta8, r.pregunta9,
    r.pregunta10, r.pregunta11, r.pregunta12, r.pregunta13, r.pregunta14, r.comentarios, fechaRegistro,
    function(err) {
      if (err) {
        return next(err);
      }
      res.redirect('/resultados');
    }
  );

  stmt.finalize();
});

// GET route to show survey results aggregated by month
router.get('/resultados', function(req, res, next) {
  // Preguntas a procesar
  const preguntas = [
    'pregunta1', 'pregunta2', 'pregunta3', 'pregunta4', 'pregunta5', 'pregunta6', 'pregunta7',
    'pregunta8', 'pregunta9', 'pregunta10', 'pregunta11', 'pregunta12', 'pregunta13', 'pregunta14'
  ];

  // Consulta para contar respuestas por pregunta y mes
  const query = `
    SELECT 
      strftime('%Y-%m', fechaRegistro) AS mes,
      pregunta,
      respuesta,
      COUNT(*) AS total
    FROM (
      SELECT 
        fechaRegistro,
        'pregunta1' AS pregunta, pregunta1 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta2' AS pregunta, pregunta2 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta3' AS pregunta, pregunta3 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta4' AS pregunta, pregunta4 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta5' AS pregunta, pregunta5 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta6' AS pregunta, pregunta6 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta7' AS pregunta, pregunta7 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta8' AS pregunta, pregunta8 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta9' AS pregunta, pregunta9 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta10' AS pregunta, pregunta10 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta11' AS pregunta, pregunta11 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta12' AS pregunta, pregunta12 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta13' AS pregunta, pregunta13 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta14' AS pregunta, pregunta14 AS respuesta FROM respuestas
    )
    GROUP BY mes, pregunta, respuesta
    ORDER BY mes ASC, pregunta ASC
  `;

  // Consulta para total de respuestas por mes
  const totalRespuestasQuery = `
    SELECT 
      strftime('%Y-%m', fechaRegistro) AS mes,
      COUNT(*) AS total
    FROM respuestas
    GROUP BY mes
    ORDER BY mes ASC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return next(err);
    }

    // Organizar datos para la vista
    const dataPorPregunta = {};
    const opcionesRespuestaPorPregunta = {};
    const mesesSet = new Set();

    rows.forEach(row => {
      mesesSet.add(row.mes);
      if (!dataPorPregunta[row.pregunta]) {
        dataPorPregunta[row.pregunta] = {};
        opcionesRespuestaPorPregunta[row.pregunta] = new Set();
      }
      if (!dataPorPregunta[row.pregunta][row.mes]) {
        dataPorPregunta[row.pregunta][row.mes] = {};
      }
      dataPorPregunta[row.pregunta][row.mes][row.respuesta] = row.total;
      opcionesRespuestaPorPregunta[row.pregunta].add(row.respuesta);
    });

    // Asegurar que para cada pregunta y mes todas las opciones tengan un valor, aunque sea 0
    const meses = Array.from(mesesSet).sort();
    Object.keys(dataPorPregunta).forEach(pregunta => {
      meses.forEach(mes => {
        if (!dataPorPregunta[pregunta][mes]) {
          dataPorPregunta[pregunta][mes] = {};
        }
        opcionesRespuestaPorPregunta[pregunta].forEach(opcion => {
          if (!dataPorPregunta[pregunta][mes][opcion]) {
            dataPorPregunta[pregunta][mes][opcion] = 0;
          }
        });
      });
    });

    // Obtener total de respuestas por mes
    db.all(totalRespuestasQuery, [], (err2, totalRows) => {
      if (err2) {
        return next(err2);
      }

      const totalRespuestasPorMes = {};
      totalRows.forEach(row => {
        totalRespuestasPorMes[row.mes] = row.total;
      });

      // Convertir Sets a arrays para la vista
      const opcionesRespuestaPorPreguntaArray = {};
      Object.keys(opcionesRespuestaPorPregunta).forEach(pregunta => {
        opcionesRespuestaPorPreguntaArray[pregunta] = Array.from(opcionesRespuestaPorPregunta[pregunta]);
      });

      res.render('resultados', {
        title: 'Resultados de la Encuesta',
        dataPorPregunta,
        opcionesRespuestaPorPregunta: opcionesRespuestaPorPreguntaArray,
        meses,
        totalRespuestasPorMes
      });
    });
  });
});

module.exports = router;

