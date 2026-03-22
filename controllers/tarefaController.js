const Tarefa = require('../models/tarefa');
const Aluno = require('../models/Aluno');
const Disciplina = require('../models/Disciplina');

//Funcionando

const criarTarefa = async (req, res) => {
  try {
    const { codigoTarefa, titulo, aluno, disciplinas } = req.body;

    if (!codigoTarefa || !titulo || !aluno) {
      return res.status(400).json({ message: "Código, título e aluno são obrigatórios!" });
    }

    if (typeof codigoTarefa !== 'string' || typeof titulo !== 'string') {
      return res.status(400).json({ message: "Código e título devem ser strings!" });
    }

    const tarefaExistente = await Tarefa.findOne({ codigoTarefa: codigoTarefa.trim().toUpperCase() });
    if (tarefaExistente) {
      return res.status(400).json({ message: "A tarefa com código " + codigoTarefa.trim().toUpperCase() + " já está cadastrada!" });
    }

    const alunoObj = await Aluno.findOne({ matricula: aluno.trim().toUpperCase() });
    if (!alunoObj) {
      return res.status(400).json({ message: "Aluno com matrícula " + aluno.trim().toUpperCase() + " não encontrado!" });
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

    const novaTarefa = new Tarefa({
      codigoTarefa: codigoTarefa.trim().toUpperCase(),
      titulo: titulo.trim(),
      concluida: false,
      aluno: alunoObj._id,
      disciplinas: disciplinasIds,
    });

    await novaTarefa.save();

    await Aluno.findByIdAndUpdate(alunoObj._id, { $push: { tarefas: novaTarefa._id } });

    for (let id of disciplinasIds) {
      await Disciplina.findByIdAndUpdate(id, { $push: { tarefas: novaTarefa._id } });
    }

    res.status(201).json({
      message: "A tarefa foi criada com sucesso!",
      tarefa: novaTarefa,
    });

  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    res.status(500).json({ message: "Erro interno do servidor!" });
  }
};

const obterTodasTarefas = async (req, res) => {
  try {
    const tarefas = await Tarefa.find()
      .populate('aluno')
      .populate('disciplinas');

    if (tarefas.length === 0) {
      return res.status(404).json({ message: "Nenhuma tarefa cadastrada!", tarefas: [] });
    }

    res.status(200).json(tarefas);

  } catch (error) {
    console.error("Erro ao obter tarefas:", error);
    res.status(500).json({ message: "Erro interno do servidor!" });
  }
};

const obterTarefaPorCodigo = async (req, res) => {
  try {
    const { codigoTarefa } = req.params;

    if (!codigoTarefa) {
      return res.status(400).json({ message: "É obrigatório informar o código da tarefa!" });
    }

    if (typeof codigoTarefa !== 'string') {
      return res.status(400).json({ message: "O código deve ser uma string!" });
    }

    const tarefa = await Tarefa.findOne({ codigoTarefa: codigoTarefa.trim().toUpperCase() })
      .populate('aluno')
      .populate('disciplinas');

    if (!tarefa) {
      return res.status(404).json({ message: "A tarefa com código " + codigoTarefa.trim().toUpperCase() + " não foi encontrada!" });
    }

    res.status(200).json(tarefa);
  } catch (error) {
    console.error("Erro ao obter tarefa por código:", error);
    res.status(500).json({ message: "Erro interno do servidor!" });
  }
};

const deletarTarefa = async (req, res) => {
  try {
    const { codigoTarefa } = req.params;

    if (!codigoTarefa) {
      return res.status(400).json({ message: "É obrigatório informar o código da tarefa!" });
    }

    if (typeof codigoTarefa !== 'string') {
      return res.status(400).json({ message: "O código deve ser uma string!" });
    }

    const tarefa = await Tarefa.findOne({ codigoTarefa: codigoTarefa.trim().toUpperCase() });
    if (!tarefa) {
      return res.status(404).json({ message: "A tarefa com código " + codigoTarefa.trim().toUpperCase() + " não foi encontrada!" });
    }

    if (tarefa.aluno) {
      await Aluno.findByIdAndUpdate(tarefa.aluno, { $pull: { tarefas: tarefa._id } });
    }

    await Disciplina.updateMany(
      { tarefas: tarefa._id },
      { $pull: { tarefas: tarefa._id } }
    );

    await Tarefa.findByIdAndDelete(tarefa._id);

    res.status(200).json({
      message: "A tarefa foi deletada com sucesso!",
      tarefa: {
        codigoTarefa: tarefa.codigoTarefa,
        titulo: tarefa.titulo,
      }
    });

  } catch (error) {
    console.error("Erro ao deletar tarefa:", error);
    res.status(500).json({ message: "Erro interno do servidor!" });
  }
};

const editarTarefa = async (req, res) => {
  try {
    const { codigoTarefa } = req.params;
    const { titulo, concluida, aluno, disciplinas } = req.body;

    if (!codigoTarefa) {
      return res.status(400).json({ message: "É obrigatório informar o código da tarefa!" });
    }

    if (typeof codigoTarefa !== 'string') {
      return res.status(400).json({ message: "O código deve ser uma string!" });
    }

    const tarefa = await Tarefa.findOne({ codigoTarefa: codigoTarefa.trim().toUpperCase() });
    if (!tarefa) {
      return res.status(404).json({ message: "A tarefa com código " + codigoTarefa.trim().toUpperCase() + " não foi encontrada!" });
    }

    if (titulo !== undefined && typeof titulo !== 'string') {
      return res.status(400).json({ message: "O título deve ser uma string!" });
    }

    if (concluida !== undefined && typeof concluida !== 'boolean') {
      return res.status(400).json({ message: "O campo concluída deve ser um booleano!" });
    }

    let novoAlunoId = tarefa.aluno;
    if (aluno !== undefined) {
      const alunoObj = await Aluno.findOne({ matricula: aluno.trim().toUpperCase() });
      if (!alunoObj) {
        return res.status(400).json({ message: "Aluno com matrícula " + aluno.trim().toUpperCase() + " não encontrado!" });
      }
      novoAlunoId = alunoObj._id;
    }

    let novasDisciplinasIds = tarefa.disciplinas;
    if (disciplinas !== undefined) {
      if (!Array.isArray(disciplinas)) {
        return res.status(400).json({ message: "Disciplinas deve ser um array de códigos!" });
      }
      novasDisciplinasIds = [];
      for (let codigo of disciplinas) {
        const disciplina = await Disciplina.findOne({ codigo: codigo.trim().toUpperCase() });
        if (!disciplina) {
          return res.status(400).json({ message: "Disciplina com código " + codigo.trim().toUpperCase() + " não encontrada!" });
        }
        novasDisciplinasIds.push(disciplina._id);
      }
    }

    if (aluno !== undefined && tarefa.aluno !== novoAlunoId) {
      await Aluno.findByIdAndUpdate(tarefa.aluno, { $pull: { tarefas: tarefa._id } });
      await Aluno.findByIdAndUpdate(novoAlunoId, { $push: { tarefas: tarefa._id } });
    }

    if (disciplinas !== undefined) {
      const antigas = tarefa.disciplinas;
      const novas = novasDisciplinasIds;
      for (let id of antigas) {
        if (!novas.includes(id)) {
          await Disciplina.findByIdAndUpdate(id, { $pull: { tarefas: tarefa._id } });
        }
      }
      for (let id of novas) {
        if (!antigas.includes(id)) {
          await Disciplina.findByIdAndUpdate(id, { $push: { tarefas: tarefa._id } });
        }
      }
    }

    const updateData = {};
    if (titulo !== undefined) updateData.titulo = titulo.trim();
    if (concluida !== undefined) updateData.concluida = concluida;
    if (aluno !== undefined) updateData.aluno = novoAlunoId;
    if (disciplinas !== undefined) updateData.disciplinas = novasDisciplinasIds;

    const tarefaAtualizada = await Tarefa.findByIdAndUpdate(
      tarefa._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "A tarefa foi atualizada com sucesso!",
      tarefa: tarefaAtualizada,
    });

  } catch (error) {
    console.error("Erro ao editar tarefa:", error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Erro interno do servidor!" });
  }
};

module.exports = {
  criarTarefa,
  obterTodasTarefas,
  obterTarefaPorCodigo,
  deletarTarefa,
  editarTarefa,
};