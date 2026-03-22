let mongoose = require('mongoose');
// Apaguei tudo para ajeitar a const aluno
//codigoTarefa como id.

let tarefaSchema = new mongoose.Schema({
  codigoTarefa: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true
  },
  titulo: { type: String, required: true },
  concluida: { type: Boolean, default: false },
  aluno: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Aluno",
  },
  disciplinas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Disciplina" }],
});

module.exports = mongoose.model('Tarefa', tarefaSchema);
