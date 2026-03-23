const API_URL = "http://localhost:3000/usuarios";

let USUARIO_ATUAL;
let ACAO_SENHA = "login";
let dados = {};
let senhaJaVerificada = false;

let modalInputCallback = null;

function abrirModalInput(titulo, valorInicial = "", min = 1, max = Infinity, callback) {
    const modal = document.getElementById("modalInput");
    const input = document.getElementById("inputModalValor");
    const label = document.getElementById("tituloModalInput");

    label.innerText = titulo;
    input.value = valorInicial;
    input.min = min;
    input.max = max;

    modal.style.display = "flex";
    modalInputCallback = callback;
    input.focus();
}

function fecharModalInput() {
    document.getElementById("modalInput").style.display = "none";
    modalInputCallback = null;
}

function confirmarModalInput() {
    const input = document.getElementById("inputModalValor");
    let valor = parseFloat(input.value);

    if (isNaN(valor) || valor < parseFloat(input.min) || valor > parseFloat(input.max)) {
        mostrarAviso(`Digite um valor válido entre ${input.min} e ${input.max}`);
        return;
    }

    if (modalInputCallback) modalInputCallback(valor);
    fecharModalInput();
}

// =========================
// SELETOR DE USUÁRIO
// =========================
function mostrarSeletor() {
    const modal = document.getElementById("seletorUsuario");
    const lista = document.getElementById("listaUsuarios");

    lista.innerHTML = "";

    const usuarios = document.querySelectorAll(".pfui");

    usuarios.forEach(card => {
        const id = card.id;

        const btn = document.createElement("div");
        btn.classList.add("usuario-btn");
        btn.textContent = id;

        btn.onclick = () => {
            localStorage.setItem("usuario", id);
            location.reload();
        };

        lista.appendChild(btn);
    });

    modal.style.display = "flex";
}

// =========================
// SENHA
// =========================
function abrirModalSenha(tipo) {
    ACAO_SENHA = tipo;

    const modal = document.getElementById("modalSenha");
    const titulo = document.getElementById("tituloSenha");

    if (tipo === "criar") {
        titulo.innerText = "Crie sua senha";
    } else if (tipo === "login") {
        titulo.innerText = "Digite sua senha";
    } else {
        titulo.innerText = "Nova senha";
    }

    modal.style.display = "flex";
}

function fecharModalSenha() {
    document.getElementById("modalSenha").style.display = "none";
    document.getElementById("inputSenha").value = "";
}

function confirmarSenha() {
    const input = document.getElementById("inputSenha");
    const senha = input.value.trim();

    if (!senha) {
        alert("Digite uma senha!");
        return;
    }

    const usuario = USUARIO_ATUAL;
    const dadosUsuario = dados[usuario] || {};

    // =========================
    // CRIAR SENHA
    // =========================
    if (ACAO_SENHA === "criar") {

        atualizarUsuario(
            dadosUsuario.status || "",
            dadosUsuario.descricao || "",
            senha
        );

        fecharModalSenha();
    }

    // =========================
    // LOGIN (via backend com bcrypt)
    // =========================
    else if (ACAO_SENHA === "login") {

        fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome: usuario,
                senha: senha
            })
        })
            .then(function (res) {
                if (!res.ok) {
                    throw new Error("Senha incorreta");
                }

                fecharModalSenha();
            })
            .catch(function () {
                alert("Senha incorreta!");
            });
        const chaveSessao = `senha_verificada_${USUARIO_ATUAL}`;
        sessionStorage.setItem(chaveSessao, "true");
        return;

    }

    // =========================
    // RESET DE SENHA
    // =========================
    else if (ACAO_SENHA === "reset") {

        atualizarUsuario(
            dadosUsuario.status || "",
            dadosUsuario.descricao || "",
            senha
        );

        fecharModalSenha();
    }
}

function verificarSenhaAoEntrar() {
    if (senhaJaVerificada) return;

    const usuario = USUARIO_ATUAL;
    const chaveSessao = `senha_verificada_${usuario}`;
    if (sessionStorage.getItem(chaveSessao)) {
        senhaJaVerificada = true;
        return;
    }

    const dadosUsuario = dados[usuario];

    senhaJaVerificada = true;

    if (!dadosUsuario) {
        abrirModalSenha("criar");
        return;
    }

    if (!dadosUsuario.senha) {
        abrirModalSenha("criar");
    } else {
        abrirModalSenha("login");
    }

    const modalSenha = document.getElementById("modalSenha");
    modalSenha.addEventListener('closeModal', () => {
        sessionStorage.setItem(chaveSessao, "true");
    });
}

// =========================
// ATUALIZAR USUÁRIO
// =========================
async function atualizarUsuario(status, descricao, senha = null, verificarSenha = true) {
    await fetch("http://localhost:3000/usuario", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nome: USUARIO_ATUAL,
            status,
            descricao,
            senha
        })
    });

    await carregarDados();

    // só verifica senha se o parâmetro for true
    if (verificarSenha) {
        verificarSenhaAoEntrar();
    }
}

// =========================
// CARREGAR DADOS E ATUALIZAR STATUS
// =========================
async function carregarDados() {
    try {
        const res = await fetch(API_URL);
        dados = await res.json();

        console.log("Dados recebidos:", dados);

        Object.keys(dados).forEach(id => {
            const card = document.getElementById(id);
            if (!card) return;

            const textoDiv = card.querySelector('.texto');
            const descricao = (dados[id].descricao || "").trim();
            const status = (dados[id].status || "").toLowerCase();

            if (textoDiv) {
                textoDiv.textContent = descricao;
            }

            // Limpa classes de status antigas
            card.classList.remove('verde', 'amarelo', 'deFerias');

            // Prioridade: ferias > ocupado > livre
            if (status === "ferias") {
                card.classList.add('deFerias');   // ciano
            } else if (status === "ocupado") {
                card.classList.add('amarelo');    // amarelo
            } else {
                // Se status vazio, considera descrição
                if (descricao.length > 0) {
                    card.classList.add('amarelo'); // ocupado
                } else {
                    card.classList.add('verde');   // livre
                }
            }
        });
    } catch (err) {
        console.error("Erro ao carregar dados:", err);
    }
    verificarSenhaAoEntrar();
}



// =========================
// RECADO
// =========================
function abrirModalRecado() {
    document.getElementById("modalRecado").style.display = "flex";
}

function fecharModalRecado() {
    document.getElementById("modalRecado").style.display = "none";
}

function confirmarRecado() {
    const input = document.getElementById("inputRecado");
    const texto = input.value.trim();

    if (!texto) {
        alert("Digite um recado!");
        return;
    }

    atualizarUsuario("ocupado", texto);

    input.value = "";
    fecharModalRecado();
}

// =========================
// FÉRIAS
// =========================
function confirmarFerias() {
    const input = document.getElementById("inputDataFerias");
    const dataSelecionada = input.value;

    if (!dataSelecionada) {
        alert("Selecione uma data!");
        return;
    }

    const hoje = new Date().toISOString().split("T")[0];

    if (dataSelecionada < hoje) {
        alert("Não pode selecionar data passada!");
        return;
    }

    const [ano, mes, dia] = dataSelecionada.split("-");
    const dataFormatada = `${dia}/${mes}/${ano}`;

    atualizarUsuario("ferias", `Férias / LP até ${dataFormatada}`);

    fecharModalFerias();
}

function fecharModalFerias() {
    document.getElementById("modalDataFerias").style.display = "none";
    document.getElementById("inputDataFerias").value = "";
}

// =========================
// CONTROLE
// =========================
function trocarUsuario() {
    localStorage.removeItem("usuario");
    location.reload();
}

window.onload = async function () {
    const usuarioSalvo = localStorage.getItem("usuario");
    const modal = document.getElementById("seletorUsuario");

    const inputData = document.getElementById("inputDataFerias");
    if (inputData) {
        inputData.min = new Date().toISOString().split("T")[0];
    }

    if (!usuarioSalvo) {
        mostrarSeletor();
        return;
    }

    USUARIO_ATUAL = usuarioSalvo;

    if (modal) {
        modal.style.display = "none";
    }

    await carregarDados();

    verificarSenhaAoEntrar();
};

// =========================
// EVENTOS
// =========================
function mostrarAviso(mensagem) {
    const modal = document.getElementById("modalAviso");
    const texto = document.getElementById("mensagemAviso");

    texto.textContent = mensagem;
    modal.style.display = "flex";
}

function fecharModalAviso() {
    const modal = document.getElementById("modalAviso");
    modal.style.display = "none";
}

document.getElementById('buttonAdicionar')?.addEventListener('click', abrirModalRecado);

document.getElementById('buttonVoltoJa')?.addEventListener('click', function () {
    abrirModalInput("Quanto tempo (minutos)?", "", 1, 180, function (valor) {
        atualizarUsuario("ocupado", `Volto em ${valor} minutos`);
    });
});

document.getElementById('buttonSairAlmocar')?.addEventListener('click', function () {
    abrirModalInput("Quanto tempo (horas)?", "", 1, 3, function (valor) {
        atualizarUsuario("ocupado", `Almoçando. Volto em ${valor}h`);
    });
});

document.getElementById('buttonAteAmanha')?.addEventListener('click', function () {
    const hoje = new Date();

    let texto = (hoje.getDay() === 5)
        ? "Bom fim de semana!"
        : "Até amanhã.";

    atualizarUsuario("livre", texto);
});

document.getElementById('buttonLimpar')?.addEventListener('click', function () {
    atualizarUsuario("livre", "", null, false);
});

document.getElementById('buttonFerias')?.addEventListener('click', function () {
    document.getElementById("modalDataFerias").style.display = "flex";
});

// =========================
// AUTO UPDATE
// =========================
setInterval(carregarDados, 3000);