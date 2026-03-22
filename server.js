//Criei o server que nao tinha.

require('dotenv').config();

const app = require('./app');
const database = require('./database/db');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`http://localhost:${PORT}/`);
});

//Conectei no github e no banco de dados.