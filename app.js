//Criei o app que nao tinha
const express = require ('express');
const app = express();

const alunoRoutes = require('./routes/alunoRoutes');
const disciplinaRoutes = require('./routes/disciplinaRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const professorRoutes = require('./routes/professorRoutes');
const tarefaRoutes = require('./routes/tarefaRoutes');
const turmaRoutes = require('./routes/turmaRoutes');
const authRoutes = require('./routes/authRoutes');

app.use(express.json());

app.use('/api', alunoRoutes);
app.use('/api', disciplinaRoutes);
app.use('/api', perfilRoutes);
app.use('/api', professorRoutes);
app.use('/api', tarefaRoutes);
app.use('/api', turmaRoutes);
app.use('/api', authRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Funcionando!' });
});

module.exports = app;