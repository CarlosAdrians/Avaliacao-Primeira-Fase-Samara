let mongoose = require("mongoose");

//Relacionamento com professor e turma.

let disciplinaSchema = new mongoose.Schema({
  codigo: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true
  },
  nome: { type: String, required: true },
  descricao: { type: String },
  dataInicio: { type: Date, default: Date.now },
  dataFim: { type: Date },
  tarefas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tarefa" }],
  professores: [{ type: mongoose.Schema.Types.ObjectId, ref: "Professor" }]
});

module.exports = mongoose.model("Disciplina", disciplinaSchema);