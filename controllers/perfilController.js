const Perfil = require('../models/perfil');
const Aluno = require('../models/Aluno');

//Funcionando

const criarPerfil = async (req, res) => {
  try {
    const { matricula, telefone, endereco, alunoMatricula } = req.body;

    if (!matricula || !telefone || !endereco || !alunoMatricula) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios!" });
    }

    if (typeof matricula !== 'string' || typeof telefone !== 'string' || typeof endereco !== 'string' || typeof alunoMatricula !== 'string') {
      return res.status(400).json({ message: "Todos os campos devem ser strings!" });
    }

    const perfilExistente = await Perfil.findOne({ matricula: matricula.trim().toUpperCase() });
    if (perfilExistente) {
      return res.status(400).json({ message: "Perfil com matrícula " + matricula.trim().toUpperCase() + " já existe!" });
    }

    const aluno = await Aluno.findOne({ matricula: alunoMatricula.trim().toUpperCase() });
    if (!aluno) {
      return res.status(400).json({ message: "Aluno com matrícula " + alunoMatricula.trim().toUpperCase() + " não encontrado!" });
    }

    if (aluno.perfil) {
      return res.status(400).json({ message: "Aluno já possui um perfil!" });
    }

    const novoPerfil = new Perfil({
      matricula: matricula.trim().toUpperCase(),
      telefone: telefone.trim(),
      endereco: endereco.trim(),
      aluno: aluno._id,
    });

    await novoPerfil.save();

    await Aluno.findByIdAndUpdate(aluno._id, { perfil: novoPerfil._id });

    res.status(201).json({
      message: "Perfil criado com sucesso!",
      perfil: novoPerfil,
    });

  } catch (error) {
    console.error("Erro ao criar perfil:", error);
    res.status(500).json({ message: "Erro interno do servidor!" });
  }
};

const obterTodosPerfis = async (req, res) => {
  try {
    const perfis = await Perfil.find().populate('aluno');

    if (perfis.length === 0) {
      return res.status(404).json({ message: "Nenhum perfil cadastrado!", perfis: [] });
    }

    res.status(200).json(perfis);
  } catch (error) {
    console.error("Erro ao obter perfis:", error);
    res.status(500).json({ message: "Erro interno do servidor!" });
  }
};

const obterPerfilPorMatricula = async (req, res) => {
  try {
    const { matricula } = req.params;

    if (!matricula) {
      return res.status(400).json({ message: "É obrigatório informar a matrícula do perfil!" });
    }

    if (typeof matricula !== 'string') {
      return res.status(400).json({ message: "A matrícula deve ser uma string!" });
    }

    const perfil = await Perfil.findOne({ matricula: matricula.trim().toUpperCase() }).populate('aluno');

    if (!perfil) {
      return res.status(404).json({ message: "Perfil com matrícula " + matricula.trim().toUpperCase() + " não encontrado!" });
    }

    res.status(200).json(perfil);
  } catch (error) {
    console.error("Erro ao obter perfil por matrícula:", error);
    res.status(500).json({ message: "Erro interno do servidor!" });
  }
};

const deletarPerfil = async (req, res) => {
  try {
    const { matricula } = req.params;

    if (!matricula) {
      return res.status(400).json({ message: "É obrigatório informar a matrícula do perfil!" });
    }

    if (typeof matricula !== 'string') {
      return res.status(400).json({ message: "A matrícula deve ser uma string!" });
    }

    const perfil = await Perfil.findOne({ matricula: matricula.trim().toUpperCase() });
    if (!perfil) {
      return res.status(404).json({ message: "Perfil com matrícula " + matricula.trim().toUpperCase() + " não encontrado!" });
    }

    if (perfil.aluno) {
      await Aluno.findByIdAndUpdate(perfil.aluno, { $unset: { perfil: "" } });
    }

    await Perfil.findByIdAndDelete(perfil._id);

    res.status(200).json({
      message: "Perfil deletado com sucesso!",
      perfil: {
        matricula: perfil.matricula,
        telefone: perfil.telefone,
        endereco: perfil.endereco,
      }
    });
  } catch (error) {
    console.error("Erro ao deletar perfil:", error);
    res.status(500).json({ message: "Erro interno do servidor!" });
  }
};

const editarPerfil = async (req, res) => {
  try {
    const { matricula } = req.params;
    const { telefone, endereco } = req.body;

    if (!matricula) {
      return res.status(400).json({ message: "É obrigatório informar a matrícula do perfil!" });
    }

    if (typeof matricula !== 'string') {
      return res.status(400).json({ message: "A matrícula deve ser uma string!" });
    }

    const perfil = await Perfil.findOne({ matricula: matricula.trim().toUpperCase() });
    if (!perfil) {
      return res.status(404).json({ message: "Perfil com matrícula " + matricula.trim().toUpperCase() + " não encontrado!" });
    }

    if (telefone !== undefined && typeof telefone !== 'string') {
      return res.status(400).json({ message: "Telefone deve ser uma string!" });
    }
    if (endereco !== undefined && typeof endereco !== 'string') {
      return res.status(400).json({ message: "Endereço deve ser uma string!" });
    }

    const updateData = {};
    if (telefone !== undefined) updateData.telefone = telefone.trim();
    if (endereco !== undefined) updateData.endereco = endereco.trim();

    const perfilAtualizado = await Perfil.findByIdAndUpdate(
      perfil._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Perfil atualizado com sucesso!",
      perfil: perfilAtualizado,
    });
  } catch (error) {
    console.error("Erro ao editar perfil:", error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Erro interno do servidor!" });
  }
};

module.exports = {
  criarPerfil,
  obterTodosPerfis,
  obterPerfilPorMatricula,
  deletarPerfil,
  editarPerfil,
};