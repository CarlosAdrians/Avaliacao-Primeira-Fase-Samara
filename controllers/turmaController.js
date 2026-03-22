const Turma = require('../models/Turma');
const Aluno = require('../models/Aluno');
const Professor = require('../models/professor');

//Funcionando

const criarTurma = async (req, res) => {
  try {
    const { codigoTurma, nome, professor, alunos } = req.body;

    if (!codigoTurma || !nome) {
      return res.status(400).json({ message: "Código e nome são obrigatórios!" });
    }

    if (typeof codigoTurma !== 'string' || typeof nome !== 'string') {
      return res.status(400).json({ message: "Código e nome devem ser strings!" });
    }

    const turmaExistente = await Turma.findOne({ codigoTurma: codigoTurma.trim().toUpperCase() });
    if (turmaExistente) {
      return res.status(400).json({ message: "A turma com código " + codigoTurma.trim().toUpperCase() + " já está cadastrada!" });
    }

    let professorId = null;
    if (professor) {
      const prof = await Professor.findOne({ registro: professor.trim().toUpperCase() });
      if (!prof) {
        return res.status(400).json({ message: "Professor com registro " + professor.trim().toUpperCase() + " não encontrado!" });
      }
      professorId = prof._id;
    }

    let alunosIds = [];
    if (alunos && Array.isArray(alunos)) {
      for (let matricula of alunos) {
        const aluno = await Aluno.findOne({ matricula: matricula.trim().toUpperCase() });
        if (!aluno) {
          return res.status(400).json({ message: "Aluno com matrícula " + matricula.trim().toUpperCase() + " não encontrado!" });
        }
        alunosIds.push(aluno._id);
      }
    }

    const novaTurma = new Turma({
      codigoTurma: codigoTurma.trim().toUpperCase(),
      nome: nome.trim(),
      professor: professorId,
      alunos: alunosIds,
    });

    await novaTurma.save();

    if (professorId) {
      await Professor.findByIdAndUpdate(professorId, { $push: { turmas: novaTurma._id } });
    }

    for (let alunoId of alunosIds) {
      await Aluno.findByIdAndUpdate(alunoId, { turma: novaTurma._id });
    }

    res.status(201).json({
      message: "A turma foi criada com sucesso!",
      turma: novaTurma,
    });

  } catch (error) {
    console.error("Erro ao criar turma:", error);
    res.status(500).json({ message: "Erro interno do servidor!" });
  }
};

const obterTodasTurmas = async (req, res) => {
  try {
    const turmas = await Turma.find()
      .populate('alunos')
      .populate('professor');

    if (turmas.length === 0) {
      return res.status(404).json({ message: "Nenhuma turma cadastrada!", turmas: [] });
    }

    res.status(200).json(turmas);

  } catch (error) {
    console.error("Erro ao obter turmas:", error);
    res.status(500).json({ message: "Erro interno do servidor!" });
  }
};

const obterTurmaPorCodigo = async (req, res) => {
  try {
    const { codigoTurma } = req.params;

    if (!codigoTurma) {
      return res.status(400).json({ message: "É obrigatório informar o código da turma!" });
    }

    if (typeof codigoTurma !== 'string') {
      return res.status(400).json({ message: "O código deve ser uma string!" });
    }

    const turma = await Turma.findOne({ codigoTurma: codigoTurma.trim().toUpperCase() })
      .populate('alunos')
      .populate('professor');

    if (!turma) {
      return res.status(404).json({ message: "A turma com código " + codigoTurma.trim().toUpperCase() + " não foi encontrada!" });
    }

    res.status(200).json(turma);
  } catch (error) {
    console.error("Erro ao obter turma por código:", error);
    res.status(500).json({ message: "Erro interno do servidor!" });
  }
};

const deletarTurma = async (req, res) => {
  try {
    const { codigoTurma } = req.params;

    if (!codigoTurma) {
      return res.status(400).json({ message: "É obrigatório informar o código da turma!" });
    }

    if (typeof codigoTurma !== 'string') {
      return res.status(400).json({ message: "O código deve ser uma string!" });
    }

    const turma = await Turma.findOne({ codigoTurma: codigoTurma.trim().toUpperCase() });
    if (!turma) {
      return res.status(404).json({ message: "A turma com código " + codigoTurma.trim().toUpperCase() + " não foi encontrada!" });
    }

    await Aluno.updateMany(
      { turma: turma._id },
      { $unset: { turma: "" } }
    );

    if (turma.professor) {
      await Professor.findByIdAndUpdate(turma.professor, { $pull: { turmas: turma._id } });
    }

    await Turma.findByIdAndDelete(turma._id);

    res.status(200).json({
      message: "A turma foi deletada com sucesso!",
      turma: {
        codigoTurma: turma.codigoTurma,
        nome: turma.nome,
      }
    });

  } catch (error) {
    console.error("Erro ao deletar turma:", error);
    res.status(500).json({ message: "Erro interno do servidor!" });
  }
};

const editarTurma = async (req, res) => {
  try {
    const { codigoTurma } = req.params;
    const { nome, professor, alunos } = req.body;

    if (!codigoTurma) {
      return res.status(400).json({ message: "É obrigatório informar o código da turma!" });
    }

    if (typeof codigoTurma !== 'string') {
      return res.status(400).json({ message: "O código deve ser uma string!" });
    }

    const turma = await Turma.findOne({ codigoTurma: codigoTurma.trim().toUpperCase() });
    if (!turma) {
      return res.status(404).json({ message: "A turma com código " + codigoTurma.trim().toUpperCase() + " não foi encontrada!" });
    }

    if (nome !== undefined && typeof nome !== 'string') {
      return res.status(400).json({ message: "O nome deve ser uma string!" });
    }

    let novoProfessorId = turma.professor;
    if (professor !== undefined) {
      if (professor === null) {
        novoProfessorId = null;
      } else {
        const prof = await Professor.findOne({ registro: professor.trim().toUpperCase() });
        if (!prof) {
          return res.status(400).json({ message: "Professor com registro " + professor.trim().toUpperCase() + " não encontrado!" });
        }
        novoProfessorId = prof._id;
      }
    }

    let novosAlunosIds = turma.alunos;
    if (alunos !== undefined) {
      if (!Array.isArray(alunos)) {
        return res.status(400).json({ message: "Alunos deve ser um array de matrículas!" });
      }
      novosAlunosIds = [];
      for (let matricula of alunos) {
        const aluno = await Aluno.findOne({ matricula: matricula.trim().toUpperCase() });
        if (!aluno) {
          return res.status(400).json({ message: "Aluno com matrícula " + matricula.trim().toUpperCase() + " não encontrado!" });
        }
        novosAlunosIds.push(aluno._id);
      }
    }

    if (professor !== undefined && turma.professor !== novoProfessorId) {
      if (turma.professor) {
        await Professor.findByIdAndUpdate(turma.professor, { $pull: { turmas: turma._id } });
      }
      if (novoProfessorId) {
        await Professor.findByIdAndUpdate(novoProfessorId, { $push: { turmas: turma._id } });
      }
    }

    if (alunos !== undefined) {
      const alunosAntigos = turma.alunos;
      const alunosNovos = novosAlunosIds;
      for (let id of alunosAntigos) {
        if (!alunosNovos.includes(id)) {
          await Aluno.findByIdAndUpdate(id, { $unset: { turma: "" } });
        }
      }
      for (let id of alunosNovos) {
        if (!alunosAntigos.includes(id)) {
          await Aluno.findByIdAndUpdate(id, { turma: turma._id });
        }
      }
    }

    const updateData = {};
    if (nome !== undefined) updateData.nome = nome.trim();
    if (professor !== undefined) updateData.professor = novoProfessorId;
    if (alunos !== undefined) updateData.alunos = novosAlunosIds;

    const turmaAtualizada = await Turma.findByIdAndUpdate(
      turma._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "A turma foi atualizada com sucesso!",
      turma: turmaAtualizada,
    });

  } catch (error) {
    console.error("Erro ao editar turma:", error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Erro interno do servidor!" });
  }
};

module.exports = {
  criarTurma,
  obterTodasTurmas,
  obterTurmaPorCodigo,
  deletarTurma,
  editarTurma,
};