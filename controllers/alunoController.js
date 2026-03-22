const Aluno = require('../models/Aluno');

//Explicar no video que nao tinha o exports.
//Funcionando

const criarAluno = async (req, res) => {
  try{
    const {matricula, nome, idade} = req.body;

    if (!matricula || !nome || !idade) {
      return res.status(400).json({ message: "É obrigatório preencher todos os campos!" });
    }

    if (typeof matricula !== 'string' || typeof nome !== 'string' || typeof idade !== 'number') {
      return res.status(400).json({ message: "O tipo de dado inserido é inválido!" });
    }

    if (idade < 15 || idade > 99) {
      return res.status(400).json({ message: "A idade deve ser entre 15 e 99 anos!" });
    }

    const alunoExistente = await Aluno.findOne({ matricula: matricula.trim().toUpperCase() });
    if (alunoExistente) {
      return res.status(400).json({ message: "O aluno com matricula " + matricula.trim().toUpperCase() + " já cadastrado!" });
    }

    const novoAluno = new Aluno({
      matricula: matricula.trim().toUpperCase(),
      nome: nome.trim(),
      idade,
    });
    
    await novoAluno.save(); 

    res.status(201).json({
      message: "O aluno foi criado com sucesso!",
      aluno: novoAluno,
    });

  } catch(error){
    console.error("Erro ao criar aluno:", error);
    
    res.status(500).json({ message: "Erro interno do servidor!" });
  };

};

const obterTodosAlunos = async (req, res) => {
  try{
    const alunos = await Aluno.find().populate('perfil');

    if (alunos.length === 0) {
      return res.status(404).json({ message: "Nenhum aluno encontrado!", alunos: [] });
    }

    res.status(200).json(alunos);
  
  } catch(error){
    console.error("Erro ao obter alunos:", error);
    
    res.status(500).json({ message: "Erro interno do servidor!" });
  };
  
};

const obterAlunoPorMatricula = async (req, res) => {
  try{
    const { matricula } = req.params;

    if (!matricula) {
      return res.status(400).json({ message: "É obrigatório informar a matrícula!" });
    }

    if (typeof matricula !== 'string') {
      return res.status(400).json({ message: "A matrícula deve ser uma string!" });
    }

    const aluno = await Aluno.findOne({ matricula: matricula.trim().toUpperCase() }).populate('perfil');
    if (!aluno) {
      return res.status(404).json({ message: "O aluno com matricula " + matricula.trim().toUpperCase() + " não foi encontrado!" });
    }

    res.status(200).json(aluno);
  } catch(error){
    console.error("Erro ao obter aluno por matrícula:", error);
    
    res.status(500).json({ message: "Erro interno do servidor!" });
  };
};

const deletarAluno = async (req, res) => {
  try{
    const { matricula } = req.params;

    if (!matricula) {
      return res.status(400).json({ message: "É obrigatório informar a matrícula!" });
    }

    if (typeof matricula !== 'string') {
      return res.status(400).json({ message: "A matrícula deve ser uma string!" });
    }

    const aluno = await Aluno.findOneAndDelete({ matricula: matricula.trim().toUpperCase() });
    if (!aluno) {
      return res.status(404).json({ message: "O aluno com matricula " + matricula.trim().toUpperCase() + " não foi encontrado!" });
    }

    res.status(200).json({ message: "O aluno foi deletado com sucesso!",
      aluno: {
        matricula: aluno.matricula,
        nome: aluno.nome,
        idade: aluno.idade,
      }
     });

  } catch(error){
    console.error("Erro ao deletar aluno:", error);
    
    res.status(500).json({ message: "Erro interno do servidor!" });

  };
  
};

const editarAluno = async (req, res) => {
  try{
    const { matricula } = req.params;
    const { nome, idade } = req.body;

    if (!matricula) {
      return res.status(400).json({ message: "É obrigatório informar a matrícula!" });
    }

    if (typeof matricula !== 'string') {
      return res.status(400).json({ message: "A matrícula deve ser uma string!" });
    }
    if(nome !== undefined && typeof nome !== 'string'){
      return res.status(400).json({ message: "O nome deve ser uma string!" });
    }

    if (idade !== undefined && typeof idade !== 'number') {
      return res.status(400).json({ message: "A idade deve ser um número!" });
    }

    if (idade < 15 || idade > 99) {
      return res.status(400).json({ message: "A idade deve ser entre 15 e 99 anos!" });
    }

    const updateData = {};
    if (nome !== undefined) updateData.nome = nome.trim();
    if (idade !== undefined) updateData.idade = idade;

    const alunoAtualizado = await Aluno.findOneAndUpdate(
      {matricula: matricula.trim().toUpperCase()},
      updateData,
      { new: true, runValidators: true }
    );

    if (!alunoAtualizado) {
      return res.status(404).json({ message: "O aluno com matricula " + matricula.trim().toUpperCase() + " não foi encontrado!" });
    }

    res.status(200).json({
      message: "O aluno foi atualizado com sucesso!",
      aluno: alunoAtualizado,
    });


  } catch(error){

    console.error("Erro ao editar aluno:", error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({message: error.message});
    }

    res.status(500).json({ message: "Erro interno do servidor!" });

  };

};

module.exports = {
  criarAluno,
  obterTodosAlunos,
  obterAlunoPorMatricula,
  deletarAluno,
  editarAluno,
};

