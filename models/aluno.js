let mongoose = require("mongoose");

//Relacionamento com perfil, tarefas e turma.


let alunoSchema = new mongoose.Schema({
  matricula: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true
  },
  nome: { type: String, required: true },
  idade: { type: Number, required: true, min: 15, max: 99 },
  perfil: { type: mongoose.Schema.Types.ObjectId, ref: "Perfil" },
  tarefas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tarefa" }],
  turma: { type: mongoose.Schema.Types.ObjectId, ref: "Turma" }
});


module.exports = mongoose.model("Aluno", alunoSchema);