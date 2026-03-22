const express = require("express");
const router = express.Router();
const tarefaController = require("../controllers/tarefaController.js");

router.post("/tarefa", tarefaController.criarTarefa);
router.get("/tarefa", tarefaController.obterTodasTarefas);
router.get("/tarefa/:codigoTarefa", tarefaController.obterTarefaPorCodigo);
router.delete("/tarefa/:codigoTarefa", tarefaController.deletarTarefa);
router.put("/tarefa/:codigoTarefa", tarefaController.editarTarefa);

module.exports = router;
