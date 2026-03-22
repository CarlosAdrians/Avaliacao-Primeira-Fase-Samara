const express = require("express");
const router = express.Router();
const professorController = require("../controllers/professorController.js");

router.post("/professor", professorController.criarProfessor);
router.get("/professor", professorController.obterTodosProfessores);
router.get("/professor/:registro", professorController.obterProfessorPorRegistro);
router.delete("/professor/:registro", professorController.deletarProfessor);
router.put("/professor/:registro", professorController.editarProfessor);

module.exports = router;