const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();
const DB_PATH = path.join(__dirname, "usuarios.json");

// Função para carregar usuários do JSON
function carregarUsuarios() {
  if (!fs.existsSync(DB_PATH)) {
    return {};
  }

  const data = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(data || "{}");
}

// Função para salvar usuários no JSON
function salvarUsuarios() {
  fs.writeFileSync(DB_PATH, JSON.stringify(usuarios, null, 2));
}

// Inicializa usuários
let usuarios = carregarUsuarios();

app.use(cors());
app.use(express.json());

// Rota para listar todos os usuários
app.get("/usuarios", (req, res) => {
  res.json(usuarios);
});

// Rota para criar/atualizar usuário
app.post("/usuario", async (req, res) => {
  try {
    const { nome, status, descricao, senha } = req.body;

    if (!nome) {
      return res.status(400).json({ erro: "Nome é obrigatório" });
    }

    const usuarioExistente = usuarios[nome] || {};
    let senhaFinal = usuarioExistente.senha || null;

    // Se veio senha nova → criptografa
    if (senha) {
      const salt = await bcrypt.genSalt(10);
      senhaFinal = await bcrypt.hash(senha, salt);
    }

    // Atualiza usuário
    usuarios[nome] = {
      nome,
      status: status ?? usuarioExistente.status ?? "",
      descricao: descricao ?? usuarioExistente.descricao ?? "",
      senha: senhaFinal,
      atualizadoEm: new Date()
    };

    // Salva no JSON
    salvarUsuarios();

    res.json({ ok: true });

  } catch (err) {
    console.error("ERRO NO /usuario:", err);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// Rota de login
app.post("/login", async (req, res) => {
  try {
    const { nome, senha } = req.body;

    const usuario = usuarios[nome];

    if (!usuario || !usuario.senha) {
      return res.status(400).json({ erro: "Usuário não encontrado" });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: "Senha incorreta" });
    }

    res.json({ ok: true });

  } catch (err) {
    console.error("ERRO NO /login:", err);
    res.status(500).json({ erro: "Erro interno" });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});