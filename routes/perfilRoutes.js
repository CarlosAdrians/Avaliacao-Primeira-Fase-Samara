const express = require("express");
const router = express.Router();
const perfilController = require("../controllers/perfilController.js");

router.post("/perfil", perfilController.criarPerfil);
router.get("/perfil", perfilController.obterTodosPerfis);
router.get("/perfil/:matricula", perfilController.obterPerfilPorMatricula);
router.delete("/perfil/:matricula", perfilController.deletarPerfil);
router.put("/perfil/:matricula", perfilController.editarPerfil);

module.exports = router;