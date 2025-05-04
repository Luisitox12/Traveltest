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
    edadEncuestado INTEGER,
    pregunta1 TEXT,
    pregunta2 TEXT,
    pregunta2_comentarios TEXT,
    pregunta3 TEXT,
    pregunta4 TEXT,
    pregunta5 TEXT,
    pregunta5_otro TEXT,
    pregunta6 TEXT,
    pregunta6_comentarios TEXT,
    pregunta7 TEXT,
    pregunta8 TEXT,
    pregunta8_comentarios TEXT,
    pregunta9 TEXT,
    pregunta10 TEXT,
    pregunta10_comentarios TEXT,
    pregunta11 TEXT,
    pregunta11_comentarios TEXT,
    pregunta12 TEXT,
    pregunta12_comentarios TEXT,
    pregunta13 TEXT,
    pregunta14 TEXT,
    pregunta14_comentarios TEXT,
    pregunta15 TEXT,
    pregunta16 TEXT,
    pregunta17 TEXT,
    pregunta17_comentarios TEXT,
    pregunta18 TEXT,
    pregunta18_comentarios TEXT,
    pregunta19 TEXT,
    pregunta19_comentarios TEXT,
    pregunta20 TEXT,
    pregunta20_comentarios TEXT,
    pregunta21 TEXT,
    pregunta22 TEXT,
    pregunta22_comentarios TEXT,
    pregunta23 TEXT,
    pregunta23_comentarios TEXT,
    pregunta24 TEXT,
    pregunta25 TEXT,
    pregunta26 TEXT,
    pregunta27 TEXT,
    pregunta28 TEXT,
    fechaRegistro TEXT
  )`);
});

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
  const fechaRegistro = new Date().toISOString();

  const stmt = db.prepare(`INSERT INTO respuestas (
    nombreCompleto, fechaActual, edadEncuestado,
    pregunta1, pregunta2, pregunta2_comentarios, pregunta3, pregunta4, pregunta5, pregunta5_otro,
    pregunta6, pregunta6_comentarios, pregunta7, pregunta8, pregunta8_comentarios, pregunta9,
    pregunta10, pregunta10_comentarios, pregunta11, pregunta11_comentarios, pregunta12, pregunta12_comentarios,
    pregunta13, pregunta14, pregunta14_comentarios, pregunta15, pregunta16, pregunta17, pregunta17_comentarios,
    pregunta18, pregunta18_comentarios, pregunta19, pregunta19_comentarios, pregunta20, pregunta20_comentarios,
    pregunta21, pregunta22, pregunta22_comentarios, pregunta23, pregunta23_comentarios, pregunta24, pregunta25,
    pregunta26, pregunta27, pregunta28, fechaRegistro
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  stmt.run(
    r.nombreCompleto, r.fechaActual, r.edadEncuestado,
    r.pregunta1, r.pregunta2, r.pregunta2_comentarios, r.pregunta3, r.pregunta4, r.pregunta5, r.pregunta5_otro,
    r.pregunta6, r.pregunta6_comentarios, r.pregunta7, r.pregunta8, r.pregunta8_comentarios, r.pregunta9,
    r.pregunta10, r.pregunta10_comentarios, r.pregunta11, r.pregunta11_comentarios, r.pregunta12, r.pregunta12_comentarios,
    r.pregunta13, r.pregunta14, r.pregunta14_comentarios, r.pregunta15, r.pregunta16, r.pregunta17, r.pregunta17_comentarios,
    r.pregunta18, r.pregunta18_comentarios, r.pregunta19, r.pregunta19_comentarios, r.pregunta20, r.pregunta20_comentarios,
    r.pregunta21, r.pregunta22, r.pregunta22_comentarios, r.pregunta23, r.pregunta23_comentarios, r.pregunta24, r.pregunta25,
    r.pregunta26, r.pregunta27, r.pregunta28, fechaRegistro,
    function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success_msg', 'Gracias por su apoyo y participación! ✈️🌍');
      res.redirect('/');
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
