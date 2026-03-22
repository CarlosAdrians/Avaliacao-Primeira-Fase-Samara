let mongoose = require("mongoose");

//Relacionamento com aluno

let perfilSchema = new mongoose.Schema({
  matricula: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true
  },
  telefone: { 
    type: String, 
    required: true,
    trim: true
  },
  endereco: { 
    type: String, 
    required: true,
    trim: true
  },
  // Relacionamento com o modelo Aluno 1:1 para o video
  aluno: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Aluno",
    required: true
  },
});

module.exports = mongoose.model("Perfil", perfilSchema);