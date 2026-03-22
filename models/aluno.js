let mongoose = require("mongoose");

//Adicionei matricula e tirei o minimo e maximo de idade daqui para colocar apenas no controller

let alunoSchema = new mongoose.Schema({
  matricula: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true
  },
  nome: { type: String, required: true },
  idade: { type: Number, required: true}, 
  perfil: { type: mongoose.Schema.Types.ObjectId, ref: "Perfil" },
});

module.exports = mongoose.model("Aluno", alunoSchema);