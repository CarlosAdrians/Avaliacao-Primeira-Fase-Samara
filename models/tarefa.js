// Apaguei tudo para ajeitar a const aluno

let mongoose = require('mongoose');

let tarefaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  concluida: Boolean,
  aluno: { type: mongoose.Schema.Types.ObjectId, ref: 'Aluno' },
  disciplinas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Disciplina' }],
});

module.exports = mongoose.model('Tarefa', tarefaSchema);
