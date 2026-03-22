const express = require("express");
const router = express.Router();
const disciplinaController = require("../controllers/disciplinaController.js");

router.post("/disciplina", disciplinaController.criarDisciplina);
router.get("/disciplina", disciplinaController.obterTodasDisciplinas);
router.get("/disciplina/:codigo", disciplinaController.obterDisciplinaPorCodigo);
router.delete("/disciplina/:codigo", disciplinaController.deletarDisciplina);
router.put("/disciplina/:codigo", disciplinaController.editarDisciplina);
module.exports = router;