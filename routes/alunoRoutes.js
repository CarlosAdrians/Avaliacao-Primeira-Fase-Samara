const express = require("express");
const router = express.Router();
const alunoController = require("../controllers/alunoController.js");

router.post("/aluno", alunoController.criarAluno);
router.get("/aluno", alunoController.obterTodosAlunos);
router.get("/aluno/:matricula", alunoController.obterAlunoPorMatricula);
router.delete("/aluno/:matricula", alunoController.deletarAluno);
router.put("/aluno/:matricula", alunoController.editarAluno);

module.exports = router;