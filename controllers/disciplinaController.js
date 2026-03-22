const Disciplina = require('../models/Disciplina');
const Professor = require('../models/Professor');
const Tarefa = require('../models/tarefa');

const criarDisciplina = async (req, res) => {
  try {
    const { codigo, nome, descricao, dataFim, professores, tarefas } = req.body;

    if (!codigo || !nome) {
      return res.status(400).json({ message: "Código e nome são obrigatórios!" });
    }

    if (typeof codigo !== 'string' || typeof nome !== 'string') {
      return res.status(400).json({ message: "Código e nome devem ser strings!" });
    }

    if (nome.trim().length < 3) {
      return res.status(400).json({ message: "O nome deve ter pelo menos 3 caracteres!" });
    }

    let dataFimValida = null;
    if (dataFim) {
      dataFimValida = new Date(dataFim);
      if (isNaN(dataFimValida.getTime())) {
        return res.status(400).json({ message: "Data de fim inválida!" });
      }
    }

    const disciplinaExistente = await Disciplina.findOne({ codigo: codigo.trim().toUpperCase() });
    if (disciplinaExistente) {
      return res.status(400).json({ message: "A disciplina com código " + codigo.trim().toUpperCase() + " já está cadastrada!" });
    }

    let professoresIds = [];
    if (professores && Array.isArray(professores)) {
      for (let registro of professores) {
        const professor = await Professor.findOne({ registro: registro.trim().toUpperCase() });
        if (!professor) {
          return res.status(400).json({ message: "Professor com registro " + registro.trim().toUpperCase() + " não encontrado!" });
        }
        professoresIds.push(professor._id);
      }
    }

    let tarefasIds = [];
    if (tarefas && Array.isArray(tarefas)) {
      for (let codigoTarefa of tarefas) {
        const tarefa = await Tarefa.findOne({ codigoTarefa: codigoTarefa.trim().toUpperCase() });
        if (!tarefa) {
          return res.status(400).json({ message: "Tarefa com código " + codigoTarefa.trim().toUpperCase() + " não encontrada!" });
        }
        tarefasIds.push(tarefa._id);
      }
    }

    const novaDisciplina = new Disciplina({
      codigo: codigo.trim().toUpperCase(),
      nome: nome.trim(),
      descricao: descricao ? descricao.trim() : "",
      dataInicio: new Date(),
      dataFim: dataFimValida,
      professores: professoresIds,
      tarefas: tarefasIds,
    });

    await novaDisciplina.save();

    for (let profId of professoresIds) {
      await Professor.findByIdAndUpdate(profId, { $push: { disciplinas: novaDisciplina._id } });
    }
    for (let tarefaId of tarefasIds) {
      await Tarefa.findByIdAndUpdate(tarefaId, { $push: { disciplinas: novaDisciplina._id } });
    }

    res.status(201).json({
      message: "A disciplina foi criada com sucesso!",
      disciplina: novaDisciplina,
    });

  } catch (error) {
    console.error("Erro ao criar disciplina:", error);
    res.status(500).json({ message: "Erro interno do servidor!" });
  }
};

const obterTodasDisciplinas = async (req, res) => {
  try {
    const disciplinas = await Disciplina.find()
      .populate('professores')
      .populate('tarefas');

    if (disciplinas.length === 0) {
      return res.status(404).json({ message: "Nenhuma disciplina cadastrada!", disciplinas: [] });
    }

    res.status(200).json(disciplinas);

  } catch (error) {
    console.error("Erro ao obter disciplinas:", error);
    res.status(500).json({ message: "Erro interno do servidor!" });
  }
};

const obterDisciplinaPorCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;

    if (!codigo) {
      return res.status(400).json({ message: "É obrigatório informar o código da disciplina!" });
    }

    if (typeof codigo !== 'string') {
      return res.status(400).json({ message: "O código deve ser uma string!" });
    }

    const disciplina = await Disciplina.findOne({ codigo: codigo.trim().toUpperCase() })
      .populate('professores')
      .populate('tarefas');

    if (!disciplina) {
      return res.status(404).json({ message: "A disciplina com código " + codigo.trim().toUpperCase() + " não foi encontrada!" });
    }

    res.status(200).json(disciplina);
  } catch (error) {
    console.error("Erro ao obter disciplina por código:", error);
    res.status(500).json({ message: "Erro interno do servidor!" });
  }
};

const deletarDisciplina = async (req, res) => {
  try {
    const { codigo } = req.params;

    if (!codigo) {
      return res.status(400).json({ message: "É obrigatório informar o código da disciplina!" });
    }

    if (typeof codigo !== 'string') {
      return res.status(400).json({ message: "O código deve ser uma string!" });
    }

    const disciplina = await Disciplina.findOne({ codigo: codigo.trim().toUpperCase() });
    if (!disciplina) {
      return res.status(404).json({ message: "A disciplina com código " + codigo.trim().toUpperCase() + " não foi encontrada!" });
    }

    await Professor.updateMany(
      { disciplinas: disciplina._id },
      { $pull: { disciplinas: disciplina._id } }
    );

    await Tarefa.updateMany(
      { disciplinas: disciplina._id },
      { $pull: { disciplinas: disciplina._id } }
    );

    await Disciplina.findByIdAndDelete(disciplina._id);

    res.status(200).json({
      message: "A disciplina foi deletada com sucesso!",
      disciplina: {
        codigo: disciplina.codigo,
        nome: disciplina.nome,
        descricao: disciplina.descricao,
      }
    });

  } catch (error) {
    console.error("Erro ao deletar disciplina:", error);
    res.status(500).json({ message: "Erro interno do servidor!" });
  }
};

const editarDisciplina = async (req, res) => {
  try {
    const { codigo } = req.params;
    const { nome, descricao, dataFim, professores, tarefas } = req.body;

    if (!codigo) {
      return res.status(400).json({ message: "É obrigatório informar o código da disciplina!" });
    }

    if (typeof codigo !== 'string') {
      return res.status(400).json({ message: "O código deve ser uma string!" });
    }

    const disciplina = await Disciplina.findOne({ codigo: codigo.trim().toUpperCase() });
    if (!disciplina) {
      return res.status(404).json({ message: "A disciplina com código " + codigo.trim().toUpperCase() + " não foi encontrada!" });
    }

    if (nome !== undefined) {
      if (typeof nome !== 'string') {
        return res.status(400).json({ message: "O nome deve ser uma string!" });
      }
      if (nome.trim().length < 3) {
        return res.status(400).json({ message: "O nome deve ter pelo menos 3 caracteres!" });
      }
    }

    if (descricao !== undefined && typeof descricao !== 'string') {
      return res.status(400).json({ message: "A descrição deve ser uma string!" });
    }

    let dataFimValida = disciplina.dataFim;
    if (dataFim !== undefined) {
      if (dataFim === null) {
        dataFimValida = null;
      } else {
        dataFimValida = new Date(dataFim);
        if (isNaN(dataFimValida.getTime())) {
          return res.status(400).json({ message: "Data de fim inválida!" });
        }
      }
    }

    let professoresIds = disciplina.professores;
    if (professores !== undefined) {
      if (!Array.isArray(professores)) {
        return res.status(400).json({ message: "Professores deve ser um array de registros!" });
      }
      professoresIds = [];
      for (let registro of professores) {
        const professor = await Professor.findOne({ registro: registro.trim().toUpperCase() });
        if (!professor) {
          return res.status(400).json({ message: "Professor com registro " + registro.trim().toUpperCase() + " não encontrado!" });
        }
        professoresIds.push(professor._id);
      }
    }

    let tarefasIds = disciplina.tarefas;
    if (tarefas !== undefined) {
      if (!Array.isArray(tarefas)) {
        return res.status(400).json({ message: "Tarefas deve ser um array de códigos!" });
      }
      tarefasIds = [];
      for (let codigoTarefa of tarefas) {
        const tarefa = await Tarefa.findOne({ codigoTarefa: codigoTarefa.trim().toUpperCase() });
        if (!tarefa) {
          return res.status(400).json({ message: "Tarefa com código " + codigoTarefa.trim().toUpperCase() + " não encontrada!" });
        }
        tarefasIds.push(tarefa._id);
      }
    }

    if (professores !== undefined) {
      const antigos = disciplina.professores;
      const novos = professoresIds;
      for (let id of antigos) {
        if (!novos.includes(id)) {
          await Professor.findByIdAndUpdate(id, { $pull: { disciplinas: disciplina._id } });
        }
      }
      for (let id of novos) {
        if (!antigos.includes(id)) {
          await Professor.findByIdAndUpdate(id, { $push: { disciplinas: disciplina._id } });
        }
      }
    }

    if (tarefas !== undefined) {
      const antigas = disciplina.tarefas;
      const novas = tarefasIds;
      for (let id of antigas) {
        if (!novas.includes(id)) {
          await Tarefa.findByIdAndUpdate(id, { $pull: { disciplinas: disciplina._id } });
        }
      }
      for (let id of novas) {
        if (!antigas.includes(id)) {
          await Tarefa.findByIdAndUpdate(id, { $push: { disciplinas: disciplina._id } });
        }
      }
    }

    const updateData = {};
    if (nome !== undefined) updateData.nome = nome.trim();
    if (descricao !== undefined) updateData.descricao = descricao.trim();
    if (dataFim !== undefined) updateData.dataFim = dataFimValida;
    if (professores !== undefined) updateData.professores = professoresIds;
    if (tarefas !== undefined) updateData.tarefas = tarefasIds;

    const disciplinaAtualizada = await Disciplina.findByIdAndUpdate(
      disciplina._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "A disciplina foi atualizada com sucesso!",
      disciplina: disciplinaAtualizada,
    });

  } catch (error) {
    console.error("Erro ao editar disciplina:", error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Erro interno do servidor!" });
  }
};

module.exports = {
  criarDisciplina,
  obterTodasDisciplinas,
  obterDisciplinaPorCodigo,
  deletarDisciplina,
  editarDisciplina,
};