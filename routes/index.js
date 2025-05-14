var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const puppeteer = require('puppeteer');

// Abrir o crear base de datos SQLite
const dbPath = path.resolve(__dirname, '../encuesta.db');
const db = new sqlite3.Database(dbPath);

  db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS respuestas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombreCompleto TEXT,
    fechaActual TEXT,
    agenciaParticipante TEXT,
    pregunta1 TEXT,
    pregunta2 TEXT,
    pregunta3 TEXT,
    pregunta4 TEXT,
    pregunta4_comentarios TEXT,
    pregunta5 TEXT,
    pregunta5_otro TEXT,
    pregunta6 TEXT,
    pregunta7 TEXT,
    pregunta8 TEXT,
    pregunta9 TEXT,
    pregunta10 TEXT,
    pregunta10_comentarios TEXT,
    pregunta11 TEXT,
    pregunta12 TEXT,
    pregunta12_comentarios TEXT,
    pregunta13 TEXT,
    pregunta14 TEXT,
    pregunta14_comentarios TEXT,
    pregunta15 TEXT,
    pregunta16 TEXT,
    pregunta17 TEXT,
    pregunta18 TEXT,
    pregunta18_comentarios TEXT,
    pregunta19 TEXT,
    pregunta19_comentarios TEXT,
    pregunta20 TEXT,
    pregunta21 TEXT,
    pregunta22 TEXT,
    pregunta23 TEXT,
    pregunta24 TEXT,
    pregunta25 TEXT,
    pregunta26 TEXT,
    pregunta26_comentarios TEXT,
    pregunta27 TEXT,
    pregunta27_comentarios TEXT,
    pregunta28 TEXT,
    fechaRegistro TEXT
  )`);
});

// Inserción de datos en la tabla respuestas
  router.post('/submit', function(req, res, next) {
  const r = req.body;
  const fechaRegistro = new Date().toISOString();

  const stmt = db.prepare(`INSERT INTO respuestas (
    nombreCompleto, fechaActual, agenciaParticipante,
    pregunta1, pregunta2, pregunta3, pregunta4, pregunta4_comentarios, pregunta5, pregunta5_otro,
    pregunta6,  pregunta7, pregunta8, pregunta9,
    pregunta10, pregunta10_comentarios, pregunta11, pregunta12, pregunta12_comentarios,
    pregunta13, pregunta14, pregunta14_comentarios, pregunta15, pregunta16, pregunta17,
    pregunta18, pregunta18_comentarios, pregunta19, pregunta19_comentarios, pregunta20,
    pregunta21, pregunta22, pregunta23, pregunta24, pregunta25,
    pregunta26, pregunta26_comentarios, pregunta27, pregunta27_comentarios, pregunta28, fechaRegistro
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  stmt.run(
    r.nombreCompleto, r.fechaActual, r.agenciaParticipante,
    r.pregunta1, r.pregunta2, r.pregunta3, r.pregunta4, r.pregunta4_comentarios, r.pregunta5, r.pregunta5_otro,
    r.pregunta6,  r.pregunta7, r.pregunta8, r.pregunta9,
    r.pregunta10, r.pregunta10_comentarios, r.pregunta11, r.pregunta12, r.pregunta12_comentarios,
    r.pregunta13, r.pregunta14, r.pregunta14_comentarios, r.pregunta15, r.pregunta16, r.pregunta17,
    r.pregunta18, r.pregunta18_comentarios, r.pregunta19, r.pregunta19_comentarios, r.pregunta20,
    r.pregunta21, r.pregunta22, r.pregunta23, r.pregunta24, r.pregunta25,
    r.pregunta26, r.pregunta26_comentarios, r.pregunta27, r.pregunta27_comentarios, r.pregunta28, fechaRegistro,
    function(err) {
      if (err) {
        return next(err);
      }
      res.render('confirmacion');
    }
  );

  stmt.finalize();
});

// Función para renderizar resultados agregados
function renderResultados(req, res, next) {
  const preguntas = [
    'pregunta1', 'pregunta2', 'pregunta3', 'pregunta4', 'pregunta5', 'pregunta6', 'pregunta7',
    'pregunta8', 'pregunta9', 'pregunta10', 'pregunta11', 'pregunta12', 'pregunta13', 'pregunta14',
    'pregunta15', 'pregunta16', 'pregunta17', 'pregunta18', 'pregunta19', 'pregunta20', 'pregunta21',
    'pregunta22', 'pregunta23', 'pregunta24', 'pregunta25', 'pregunta26', 'pregunta27', 'pregunta28'
  ];

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
        'pregunta4_comentarios' AS pregunta, pregunta4_comentarios AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta5' AS pregunta, pregunta5 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta5_otro' AS pregunta, pregunta5_otro AS respuesta FROM respuestas
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
        'pregunta10_comentarios' AS pregunta, pregunta10_comentarios AS respuesta FROM respuestas
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
        'pregunta12_comentarios' AS pregunta, pregunta12_comentarios AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta13' AS pregunta, pregunta13 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta14' AS pregunta, pregunta14 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta14_comentarios' AS pregunta, pregunta14_comentarios AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta15' AS pregunta, pregunta15 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta16' AS pregunta, pregunta16 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta17' AS pregunta, pregunta17 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta18' AS pregunta, pregunta18 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta18_comentarios' AS pregunta, pregunta18_comentarios AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta19' AS pregunta, pregunta19 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta19_comentarios' AS pregunta, pregunta19_comentarios AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta20' AS pregunta, pregunta20 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta21' AS pregunta, pregunta21 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta22' AS pregunta, pregunta22 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta23' AS pregunta, pregunta23 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta24' AS pregunta, pregunta24 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta25' AS pregunta, pregunta25 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta26' AS pregunta, pregunta26 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta26_comentarios' AS pregunta, pregunta26_comentarios AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta27' AS pregunta, pregunta27 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta27_comentarios' AS pregunta, pregunta27_comentarios AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta28' AS pregunta, pregunta28 AS respuesta FROM respuestas
    )
    GROUP BY mes, pregunta, respuesta
    ORDER BY mes ASC, pregunta ASC
  `;

  const totalRespuestasQuery = `
    SELECT 
      strftime('%Y-%m', fechaRegistro) AS mes,
      COUNT(*) AS total
    FROM respuestas
    GROUP BY mes
    ORDER BY mes ASC
  `;

  const comentariosQuery = `
    SELECT 
      nombreCompleto,
      fechaRegistro,
      pregunta4_comentarios,
      pregunta10_comentarios,
      pregunta12_comentarios,
      pregunta14_comentarios,
      pregunta18_comentarios,
      pregunta19_comentarios,
      pregunta26_comentarios,
      pregunta27_comentarios,
      pregunta28_comentarios,
      pregunta5_otro
    FROM respuestas
    ORDER BY fechaRegistro DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return next(err);
    }

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
      // No normalizar opciones para pregunta2, tratar igual que otras preguntas
      let respuestaNormalizada = row.respuesta;
      dataPorPregunta[row.pregunta][row.mes][respuestaNormalizada] = row.total;
      opcionesRespuestaPorPregunta[row.pregunta].add(respuestaNormalizada);
    });

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

    db.all(totalRespuestasQuery, [], (err2, totalRows) => {
      if (err2) {
        return next(err2);
      }

      const totalRespuestasPorMes = {};
      totalRows.forEach(row => {
        totalRespuestasPorMes[row.mes] = row.total;
      });

      db.all(comentariosQuery, [], (err3, comentariosRows) => {
        if (err3) {
          return next(err3);
        }

        res.render('resultados', {
          title: 'Resultados de la Encuesta',
          dataPorPregunta,
          opcionesRespuestaPorPregunta: Object.keys(opcionesRespuestaPorPregunta).reduce((acc, key) => {
            acc[key] = Array.from(opcionesRespuestaPorPregunta[key]);
            return acc;
          }, {}),
          meses,
          totalRespuestasPorMes,
          comentarios: comentariosRows
        });
      });
    });
  });
}

router.get('/resultados', checkAdminAuth, renderResultados);
router.get('/resultados/public', renderResultados);

router.get('/resultados/pdf', async function(req, res, next) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const host = req.headers.host;
    const protocol = req.protocol;
    const url = `${protocol}://${host}/resultados/public`;
    console.log('Generando PDF desde URL pública:', url);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForFunction(() => {
      const bars = document.querySelectorAll('.bar-fill');
      return bars.length > 0 && Array.from(bars).every(bar => bar.offsetWidth > 0);
    }, { timeout: 60000 });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      landscape: false
    });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="resultados.pdf"',
      'Content-Length': pdfBuffer.length
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generando PDF:', error);
    next(error);
  }
});

module.exports = router;

// Usuario administrador local (usuario y contraseña hasheada)
const adminUser = {
  username: process.env.ADMIN_USER || 'admin',
  passwordHash: process.env.ADMIN_PASS_HASH || '$2b$10$7Q9q6Xq6Xq6Xq6Xq6Xq6X.q6Xq6Xq6Xq6Xq6Xq6Xq6Xq6Xq6Xq6Xq' // hash de 'admin123' (ejemplo)
};

// Middleware para proteger rutas de administrador
function checkAdminAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.redirect('/admin/login');
  }
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Encuesta', success_msg: req.flash('success_msg') });
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos
  message: 'Demasiados intentos de inicio de sesión, por favor intente de nuevo más tarde.'
});

// Rutas para login administrador
router.get('/admin/login', function(req, res, next) {
  res.render('login', { error: null });
});

router.post('/admin/login', loginLimiter, async function(req, res, next) {
  const { username, password } = req.body;
  if (username === adminUser.username) {
    const match = await bcrypt.compare(password, adminUser.passwordHash);
    if (match) {
      req.session.isAdmin = true;
      return res.redirect('/resultados');
    }
  }
  res.render('login', { error: 'Usuario o contraseña incorrectos' });
});

router.get('/admin/logout', function(req, res, next) {
  req.session.destroy();
  res.redirect('/');
});

router.post('/submit', function(req, res, next) {
  const r = req.body;
  console.log('Contenido de pregunta10_comentarios:', r.pregunta10_comentarios); // Log para diagnosticar
  const fechaRegistro = new Date().toISOString();

  const stmt = db.prepare(`INSERT INTO respuestas (
    nombreCompleto, fechaActual, agenciaParticipante,
    pregunta1, pregunta2, pregunta3, pregunta4, pregunta4_comentarios, pregunta5, pregunta5_otro,
    pregunta6,  pregunta7, pregunta8, pregunta9,
    pregunta10, pregunta10_comentarios, pregunta11, pregunta12, pregunta12_comentarios,
    pregunta13, pregunta14, pregunta14_comentarios, pregunta15, pregunta16, pregunta17,
    pregunta18, pregunta18_comentarios, pregunta19, pregunta19_comentarios, pregunta20,
    pregunta21, pregunta22, pregunta23, pregunta24, pregunta25,
    pregunta26, pregunta26_comentarios, pregunta27, pregunta27_comentarios, pregunta28, fechaRegistro
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  stmt.run(
    r.nombreCompleto, r.fechaActual, r.agenciaParticipante,
    r.pregunta1, r.pregunta2, r.pregunta3, r.pregunta4, r.pregunta4_comentarios, r.pregunta5, r.pregunta5_otro,
    r.pregunta6,  r.pregunta7, r.pregunta8, r.pregunta9,
    r.pregunta10, r.pregunta10_comentarios, r.pregunta11, r.pregunta12, r.pregunta12_comentarios,
    r.pregunta13, r.pregunta14, r.pregunta14_comentarios, r.pregunta15, r.pregunta16, r.pregunta17,
    r.pregunta18, r.pregunta18_comentarios, r.pregunta19, r.pregunta19_comentarios, r.pregunta20,
    r.pregunta21, r.pregunta22, r.pregunta23, r.pregunta24, r.pregunta25,
    r.pregunta26, r.pregunta26_comentarios,  r.pregunta27, r.pregunta27_comentarios, r.pregunta28, fechaRegistro,
    function(err) {
      if (err) {
        return next(err);
      }
      res.render('confirmacion');
    }
  );

  stmt.finalize();
});

function renderResultados(req, res, next) {
  // Preguntas a procesar
  const preguntas = [
    'pregunta1', 'pregunta2', 'pregunta3', 'pregunta4', 'pregunta5', 'pregunta6', 'pregunta7',
    'pregunta8', 'pregunta9', 'pregunta10', 'pregunta11', 'pregunta12', 'pregunta13', 'pregunta14',
    'pregunta15', 'pregunta16', 'pregunta17', 'pregunta18', 'pregunta19', 'pregunta20', 'pregunta21',
    'pregunta22', 'pregunta23', 'pregunta24', 'pregunta25', 'pregunta26', 'pregunta27', 'pregunta28'
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
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta15' AS pregunta, pregunta15 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta16' AS pregunta, pregunta16 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta17' AS pregunta, pregunta17 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta18' AS pregunta, pregunta18 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta19' AS pregunta, pregunta19 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta20' AS pregunta, pregunta20 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta21' AS pregunta, pregunta21 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta22' AS pregunta, pregunta22 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta23' AS pregunta, pregunta23 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta24' AS pregunta, pregunta24 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta25' AS pregunta, pregunta25 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta26' AS pregunta, pregunta26 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta27' AS pregunta, pregunta27 AS respuesta FROM respuestas
      UNION ALL
      SELECT 
        fechaRegistro,
        'pregunta28' AS pregunta, pregunta28 AS respuesta FROM respuestas
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

  // Nueva consulta para obtener comentarios opcionales y nombre completo
  const comentariosQuery = `
    SELECT 
      nombreCompleto,
      agenciaParticipante,
      fechaRegistro,
      pregunta4_comentarios,
      pregunta10_comentarios,
      pregunta12_comentarios,
      pregunta14_comentarios,
      pregunta18_comentarios,
      pregunta19_comentarios,
      pregunta26_comentarios,
      pregunta27_comentarios,
      pregunta5_otro
    FROM respuestas
    ORDER BY fechaRegistro DESC
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
      // No normalizar opciones para pregunta2, tratar igual que otras preguntas
      let respuestaNormalizada = row.respuesta;
      dataPorPregunta[row.pregunta][row.mes][respuestaNormalizada] = row.total;
      opcionesRespuestaPorPregunta[row.pregunta].add(respuestaNormalizada);
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

    // Nueva consulta para obtener total de participantes
    const totalParticipantesQuery = `SELECT COUNT(DISTINCT id) AS totalParticipantes FROM respuestas`;

    db.get(totalParticipantesQuery, [], (err4, totalParticipantesRow) => {
      if (err4) {
        return next(err4);
      }

      // Obtener comentarios opcionales
      db.all(comentariosQuery, [], (err3, comentariosRows) => {
        if (err3) {
          return next(err3);
        }

        res.render('resultados', {
          title: 'Resultados de la Encuesta',
          dataPorPregunta,
          opcionesRespuestaPorPregunta: Object.keys(opcionesRespuestaPorPregunta).reduce((acc, key) => {
            acc[key] = Array.from(opcionesRespuestaPorPregunta[key]);
            return acc;
          }, {}),
          meses,
          totalRespuestasPorMes,
          totalParticipantes: totalParticipantesRow.totalParticipantes,
          comentarios: comentariosRows
        });
      });
    });
  });
  });
}

// GET route to show survey results aggregated by month with authentication
router.get('/resultados', checkAdminAuth, renderResultados);

// GET route to show survey results aggregated by month without authentication (public)
router.get('/resultados/public', renderResultados);

// Modificar ruta /resultados/pdf para usar la ruta pública sin autenticación
router.get('/resultados/pdf', async function(req, res, next) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const host = req.headers.host;
    const protocol = req.protocol;
    const url = `${protocol}://${host}/resultados/public`;
    console.log('Generando PDF desde URL pública:', url);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    // Esperar que los gráficos y barras estén renderizados
    await page.waitForFunction(() => {
      const bars = document.querySelectorAll('.bar-fill');
      return bars.length > 0 && Array.from(bars).every(bar => bar.offsetWidth > 0);
    }, { timeout: 60000 });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      landscape: false
    });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="resultados.pdf"',
      'Content-Length': pdfBuffer.length
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generando PDF:', error);
    next(error);
  }
});

module.exports = router;
