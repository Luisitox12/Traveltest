const bcrypt = require('bcrypt');

const password = 'Viajespor100.';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error al generar el hash:', err);
    process.exit(1);
  }
  console.log('Hash generado para la contraseña:', hash);
});
