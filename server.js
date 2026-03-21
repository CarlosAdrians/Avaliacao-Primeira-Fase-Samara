const app = require('./app');
const database = require('./database/db');

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`http://localhost:${PORT}/`);
});

//Lembrar de conectar isso no github amanha 