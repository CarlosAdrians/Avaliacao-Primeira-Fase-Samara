let mongoose = require("mongoose");

//Relacionamento com professor e turma.

let professorSchema = new mongoose.Schema({
  registro: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true
  },
  nome: { type: String, required: true },
  idade: { type: Number, required: true },
  disciplinas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Disciplina" }],
  turmas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Turma" }]
});

module.exports = mongoose.model("Professor", professorSchema);