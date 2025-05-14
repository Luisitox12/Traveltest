var express = require('express');
var router = express.Router();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.resolve(__dirname, '../encuesta.db');
const db = new sqlite3.Database(dbPath);

// Middleware to check admin authentication
function checkAdminAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.redirect('/admin/login');
  }
}

// GET route to render the edit database page
router.get('/', checkAdminAuth, (req, res) => {
  res.render('editar-db', { title: 'Editar Base de Datos' });
});

// POST route to delete all data from the database
router.post('/delete', checkAdminAuth, (req, res, next) => {
  const deleteQuery = 'DELETE FROM respuestas';
  db.run(deleteQuery, function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/resultados');
  });
});

module.exports = router;
