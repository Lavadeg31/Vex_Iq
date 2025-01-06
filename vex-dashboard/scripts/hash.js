const bcrypt = require('bcryptjs');

bcrypt.hash('Amsterdam1!?', 10).then(hash => {
    console.log('Hashed password:', hash);
});