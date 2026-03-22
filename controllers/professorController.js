const Professor = require('../models/professor');
const Disciplina = require('../models/Disciplina');
const Turma = require('../models/Turma');

//Funcionando

const criarProfessor = async (req, res) => {
  try {
    const { registro, nome, idade, disciplinas, turmas } = req.body;

    if (!registro || !nome || !idade) {
      return res.status(400).json({ message: "É obrigatório preencher todos os campos!" });
    }

    if (typeof registro !== 'string' || typeof nome !== 'string' || typeof idade !== 'number') {
      return res.status(400).json({ message: "Registro e nome devem ser strings, e idade deve ser um número!" });
    }

    if (idade < 18 || idade > 100) {
      return res.status(400).json({ message: "A idade deve ser entre 18 e 100 anos!" });
    }

    const professorExistente = await Professor.findOne({ registro: registro.trim().toUpperCase() });
    if (professorExistente) {
      return res.status(400).json({ message: "O professor com registro " + registro.trim().toUpperCase() + " já está cadastrado!" });
    }

    let disciplinasIds = [];
    if (disciplinas && Array.isArray(disciplinas)) {
      for (let codigo of disciplinas) {
        const disciplina = await Disciplina.findOne({ codigo: codigo.trim().toUpperCase() });
        if (!disciplina) {
          return res.status(400).json({ message: "Disciplina com código " + codigo.trim().toUpperCase() + " não encontrada!" });
        }
        disciplinasIds.push(disciplina._id);
      }
    }

    let turmasIds = [];
    if (turmas && Array.isArray(turmas)) {
      for (let codigoTurma of turmas) {
        const turma = await Turma.findOne({ codigoTurma: codigoTurma.trim().toUpperCase() });
        if (!turma) {
          return res.status(400).json({ message: "Turma com código " + codigoTurma.trim().toUpperCase() + " não encontrada!" });
        }
        turmasIds.push(turma._id);
      }
    }

    const novoProfessor = new Professor({
      registro: registro.trim().toUpperCase(),
      nome: nome.trim(),
      idade,
      disciplinas: disciplinasIds,
      turmas: turmasIds,
    });

    await novoProfessor.save();

    for (let discId of disciplinasIds) {
      await Disciplina.findByIdAndUpdate(discId, { $push: { professores: novoProfessor._id } });
    }
    for (let turmaId of turmasIds) {
      await Turma.findByIdAndUpdate(turmaId, { $push: { professores: novoProfessor._id } });
    }

    res.status(201).json({
      message: "O professor foi criado com sucesso!",
      professor: novoProfessor,
    });

  } catch (error) {
    console.error("Erro ao criar professor:", error);
    res.status(500).json({ message: "Erro interno do servidor!" });
  }
};

const obterTodosProfessores = async (req, res) => {
  try {
    const professores = await Professor.find()
      .populate('disciplinas')
      .populate('turmas');

    if (professores.length === 0) {
      return res.status(404).json({ message: "Nenhum professor cadastrado!", professores: [] });
    }

    res.status(200).json(professores);

  } catch (error) {
    console.error("Erro ao obter professores:", error);
    res.status(500).json({ message: "Erro interno do servidor!" });
  }
};

const obterProfessorPorRegistro = async (req, res) => {
  try {
    const { registro } = req.params;

    if (!registro) {
      return res.status(400).json({ message: "É obrigatório informar o registro!" });
    }

    if (typeof registro !== 'string') {
      return res.status(400).json({ message: "O registro deve ser uma string!" });
    }

    const professor = await Professor.findOne({ registro: registro.trim().toUpperCase() })
      .populate('disciplinas')
      .populate('turmas');

    if (!professor) {
      return res.status(404).json({ message: "O professor com registro " + registro.trim().toUpperCase() + " não foi encontrado!" });
    }

    res.status(200).json(professor);
  } catch (error) {
    console.error("Erro ao obter professor por registro:", error);
    res.status(500).json({ message: "Erro interno do servidor!" });
  }
};

const deletarProfessor = async (req, res) => {
  try {
    const { registro } = req.params;

    if (!registro) {
      return res.status(400).json({ message: "É obrigatório informar o registro!" });
    }

    if (typeof registro !== 'string') {
      return res.status(400).json({ message: "O registro deve ser uma string!" });
    }

    const professor = await Professor.findOne({ registro: registro.trim().toUpperCase() });
    if (!professor) {
      return res.status(404).json({ message: "O professor com registro " + registro.trim().toUpperCase() + " não foi encontrado!" });
    }

    await Disciplina.updateMany(
      { professores: professor._id },
      { $pull: { professores: professor._id } }
    );

    await Turma.updateMany(
      { professores: professor._id },
      { $pull: { professores: professor._id } }
    );

    await Professor.findByIdAndDelete(professor._id);

    res.status(200).json({
      message: "O professor foi deletado com sucesso!",
      professor: {
        registro: professor.registro,
        nome: professor.nome,
        idade: professor.idade,
      }
    });

  } catch (error) {
    console.error("Erro ao deletar professor:", error);
    res.status(500).json({ message: "Erro interno do servidor!" });
  }
};

const editarProfessor = async (req, res) => {
  try {
    const { registro } = req.params;
    const { nome, idade, disciplinas, turmas } = req.body;

    if (!registro) {
      return res.status(400).json({ message: "É obrigatório informar o registro!" });
    }

    if (typeof registro !== 'string') {
      return res.status(400).json({ message: "O registro deve ser uma string!" });
    }

    if (nome !== undefined && typeof nome !== 'string') {
      return res.status(400).json({ message: "O nome deve ser uma string!" });
    }

    if (idade !== undefined && typeof idade !== 'number') {
      return res.status(400).json({ message: "A idade deve ser um número!" });
    }

    if (idade !== undefined && (idade < 18 || idade > 100)) {
      return res.status(400).json({ message: "A idade deve ser entre 18 e 100 anos!" });
    }

    const professor = await Professor.findOne({ registro: registro.trim().toUpperCase() });
    if (!professor) {
      return res.status(404).json({ message: "O professor com registro " + registro.trim().toUpperCase() + " não foi encontrado!" });
    }

    let disciplinasIds = professor.disciplinas;
    if (disciplinas !== undefined) {
      if (!Array.isArray(disciplinas)) {
        return res.status(400).json({ message: "Disciplinas deve ser um array de códigos!" });
      }
      disciplinasIds = [];
      for (let codigo of disciplinas) {
        const disciplina = await Disciplina.findOne({ codigo: codigo.trim().toUpperCase() });
        if (!disciplina) {
          return res.status(400).json({ message: "Disciplina com código " + codigo.trim().toUpperCase() + " não encontrada!" });
        }
        disciplinasIds.push(disciplina._id);
      }
    }

    let turmasIds = professor.turmas;
    if (turmas !== undefined) {
      if (!Array.isArray(turmas)) {
        return res.status(400).json({ message: "Turmas deve ser um array de códigos!" });
      }
      turmasIds = [];
      for (let codigoTurma of turmas) {
        const turma = await Turma.findOne({ codigoTurma: codigoTurma.trim().toUpperCase() });
        if (!turma) {
          return res.status(400).json({ message: "Turma com código " + codigoTurma.trim().toUpperCase() + " não encontrada!" });
        }
        turmasIds.push(turma._id);
      }
    }

    if (disciplinas !== undefined) {
      const disciplinasAntigas = professor.disciplinas;
      const disciplinasNovas = disciplinasIds;
      for (let id of disciplinasAntigas) {
        if (!disciplinasNovas.includes(id)) {
          await Disciplina.findByIdAndUpdate(id, { $pull: { professores: professor._id } });
        }
      }
      for (let id of disciplinasNovas) {
        if (!disciplinasAntigas.includes(id)) {
          await Disciplina.findByIdAndUpdate(id, { $push: { professores: professor._id } });
        }
      }
    }

    if (turmas !== undefined) {
      const turmasAntigas = professor.turmas;
      const turmasNovas = turmasIds;
      for (let id of turmasAntigas) {
        if (!turmasNovas.includes(id)) {
          await Turma.findByIdAndUpdate(id, { $pull: { professores: professor._id } });
        }
      }
      for (let id of turmasNovas) {
        if (!turmasAntigas.includes(id)) {
          await Turma.findByIdAndUpdate(id, { $push: { professores: professor._id } });
        }
      }
    }

    const updateData = {};
    if (nome !== undefined) updateData.nome = nome.trim();
    if (idade !== undefined) updateData.idade = idade;
    if (disciplinas !== undefined) updateData.disciplinas = disciplinasIds;
    if (turmas !== undefined) updateData.turmas = turmasIds;

    const professorAtualizado = await Professor.findByIdAndUpdate(
      professor._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "O professor foi atualizado com sucesso!",
      professor: professorAtualizado,
    });

  } catch (error) {
    console.error("Erro ao editar professor:", error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Erro interno do servidor!" });
  }
};

module.exports = {
  criarProfessor,
  obterTodosProfessores,
  obterProfessorPorRegistro,
  deletarProfessor,
  editarProfessor,
};