const bcrypt = require('bcrypt');
bcrypt.hash('demopassword', 10).then(console.log);