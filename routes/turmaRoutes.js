const express = require("express");
const router = express.Router();
const turmaController = require("../controllers/turmaController.js");

router.post("/turma", turmaController.criarTurma);
router.get("/turma", turmaController.obterTodasTurmas);
router.get("/turma/:codigoTurma", turmaController.obterTurmaPorCodigo);
router.delete("/turma/:codigoTurma", turmaController.deletarTurma);
router.put("/turma/:codigoTurma", turmaController.editarTurma);

module.exports = router;