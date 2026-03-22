const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const registrar = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios!' });
    }

    if (typeof email !== 'string' || typeof senha !== 'string') {
      return res.status(400).json({ message: 'Email e senha devem ser strings!' });
    }

    const adminExistente = await Admin.findOne({ email });
    if (adminExistente) {
      return res.status(400).json({ message: 'Email já cadastrado!' });
    }

    const admin = new Admin({ email, senha });
    await admin.save();

    res.status(201).json({
      message: 'Admin criado com sucesso!',
      admin: {
        id: admin._id,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Erro ao registrar admin:', error);
    res.status(500).json({ message: 'Erro interno do servidor!' });
  }
};

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios!' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Credenciais inválidas!' });
    }

    const senhaValida = await admin.compararSenha(senha);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Credenciais inválidas!' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login realizado com sucesso!',
      token,
      admin: {
        id: admin._id,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro interno do servidor!' });
  }
};

module.exports = { 
    registrar, 
    login 
};