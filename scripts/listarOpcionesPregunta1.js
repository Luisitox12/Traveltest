const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../encuesta.db');
const db = new sqlite3.Database(dbPath);

db.all('SELECT DISTINCT pregunta1 FROM respuestas', [], (err, rows) => {
  if (err) {
    console.error('Error al consultar la base de datos:', err);
  } else {
    console.log('Opciones distintas de pregunta1:');
    rows.forEach(row => {
      console.log(row.pregunta1);
    });
  }
  db.close();
});
