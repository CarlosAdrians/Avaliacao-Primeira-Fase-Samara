const express = require("express");
const router = express.Router();
const alunoController = require("../controllers/alunoController.js");
const { autenticar } = require("../middlewares/auth.js");

//coloquei autenticao para criar, deletar e editar aluno. Apresentar no video.

router.post("/aluno", autenticar, alunoController.criarAluno);
router.delete("/aluno/:matricula", autenticar, alunoController.deletarAluno);
router.put("/aluno/:matricula", autenticar, alunoController.editarAluno);

router.get("/aluno", alunoController.obterTodosAlunos);
router.get("/aluno/:matricula", alunoController.obterAlunoPorMatricula);

module.exports = router;