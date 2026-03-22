let mongoose = require('mongoose');

//Relacionamento com aluno e disciplina.

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
    required: true
  },
  disciplinas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Disciplina" }],
});

module.exports = mongoose.model('Tarefa', tarefaSchema);
