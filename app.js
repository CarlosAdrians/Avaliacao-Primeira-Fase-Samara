const express = require ('express');
const app = express();

const alunoRoutes = require('./routes/alunosRoutes');
const disciplinaRoutes = require('./routes/disciplinasRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const professorRoutes = require('./routes/professoresRoutes');
const tarefaRoutes = require('./routes/tarefasRoutes');
const turmaRoutes = require('./routes/turmasRoutes');

app.use(express.json());

app.use('/api', alunoRoutes);
app.use('/api', disciplinaRoutes);
app.use('/api', perfilRoutes);
app.use('/api', professorRoutes);
app.use('/api', tarefaRoutes);
app.use('/api', turmaRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Funcionando!' });
});

module.exports = app;