// ===== Sakura Delivery - script.js =====
// Os dados ficam salvos no localStorage do navegador.
// Depois, essa parte pode ser trocada pelo CRUD em C# com banco de dados.

// ---------- Lista de produtos ----------
const produtos = [
  { id: 1, nome: "Combinado 20 peças", categoria: "Combinados", preco: 69.90, imagem: "img/combinado-20.svg", descricao: "Uramaki, niguiri e sashimi variados." },
  { id: 2, nome: "Combinado 40 peças", categoria: "Combinados", preco: 119.90, imagem: "img/combinado-40.svg", descricao: "Ideal para dividir com 2 ou 3 pessoas." },
  { id: 3, nome: "Temaki de salmão", categoria: "Temakis", preco: 29.90, imagem: "img/temaki-salmao.svg", descricao: "Salmão fresco, arroz e cebolinha." },
  { id: 4, nome: "Temaki skin", categoria: "Temakis", preco: 24.90, imagem: "img/temaki-skin.svg", descricao: "Pele de salmão crocante com molho tarê." },
  { id: 5, nome: "Hot roll (10 un.)", categoria: "Hot rolls", preco: 32.90, imagem: "img/hot-roll.svg", descricao: "Empanado, com salmão e cream cheese." },
  { id: 6, nome: "Yakisoba de carne", categoria: "Pratos quentes", preco: 39.90, imagem: "img/yakisoba.svg", descricao: "Macarrão, carne, legumes e molho shoyu." },
  { id: 7, nome: "Guioza (6 un.)", categoria: "Pratos quentes", preco: 22.90, imagem: "img/guioza.svg", descricao: "Pastelzinho japonês de carne de porco." },
  { id: 8, nome: "Chá verde gelado", categoria: "Bebidas", preco: 8.90, imagem: "img/cha-verde.svg", descricao: "Copo de 400 ml." }
];

const TAXA_ENTREGA = 7.00;

// ---------- Funções de apoio ----------
function formatarPreco(valor) {
  return "R$ " + valor.toFixed(2).replace(".", ",");
}

function pegarDados(chave, padrao) {
  const texto = localStorage.getItem(chave);
  if (texto === null) {
    return padrao;
  }
  return JSON.parse(texto);
}

function salvarDados(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor));
}

function mostrarMensagem(id, texto, tipo) {
  const elemento = document.getElementById(id);
  if (elemento) {
    elemento.textContent = texto;
    elemento.className = "mensagem " + tipo;
  }
}

// ---------- Modo claro / escuro ----------
function aplicarTema() {
  const tema = localStorage.getItem("tema");
  const botao = document.getElementById("botao-tema");

  if (tema === "escuro") {
    document.body.classList.add("modo-escuro");
    if (botao) botao.textContent = "Modo claro";
  } else {
    document.body.classList.remove("modo-escuro");
    if (botao) botao.textContent = "Modo escuro";
  }
}

function alternarTema() {
  if (localStorage.getItem("tema") === "escuro") {
    localStorage.setItem("tema", "claro");
  } else {
    localStorage.setItem("tema", "escuro");
  }
  aplicarTema();
}

// ---------- Menu do celular ----------
function alternarMenu() {
  const menu = document.getElementById("menu");
  const botao = document.getElementById("botao-menu");
  menu.classList.toggle("aberto");
  botao.setAttribute("aria-expanded", menu.classList.contains("aberto"));
}

// ---------- Máscaras e campos só com números ----------
// O formato usa # no lugar de cada número. Ex.: "###.###.###-##"
function aplicarMascara(campo, formato) {
  const numeros = campo.value.replace(/\D/g, "");
  let resultado = "";
  let posicao = 0;

  for (let i = 0; i < formato.length; i++) {
    if (posicao >= numeros.length) {
      break;
    }
    if (formato[i] === "#") {
      resultado += numeros[posicao];
      posicao++;
    } else {
      resultado += formato[i];
    }
  }
  campo.value = resultado;
}

function somenteNumeros(campo) {
  campo.value = campo.value.replace(/\D/g, "");
}

function ativarMascaras() {
  const camposComMascara = document.querySelectorAll("[data-mascara]");
  camposComMascara.forEach(function (campo) {
    campo.addEventListener("input", function () {
      aplicarMascara(campo, campo.dataset.mascara);
    });
  });

  const camposNumericos = document.querySelectorAll(".so-numeros");
  camposNumericos.forEach(function (campo) {
    campo.addEventListener("input", function () {
      somenteNumeros(campo);
    });
  });
}

// ---------- Usuário (CRUD no navegador) ----------
function pegarUsuarios() {
  return pegarDados("usuarios", []);
}

function pegarUsuarioLogado() {
  return pegarDados("usuarioLogado", null);
}

// CREATE: cadastrar
function cadastrarUsuario(evento) {
  evento.preventDefault();

  const usuario = {
    nome: document.getElementById("cad-nome").value.trim(),
    cpf: document.getElementById("cad-cpf").value,
    telefone: document.getElementById("cad-telefone").value,
    nascimento: document.getElementById("cad-nascimento").value,
    cep: document.getElementById("cad-cep").value,
    numero: document.getElementById("cad-numero").value,
    endereco: document.getElementById("cad-endereco").value.trim(),
    email: document.getElementById("cad-email").value.trim().toLowerCase(),
    senha: document.getElementById("cad-senha").value
  };
  const confirmar = document.getElementById("cad-confirmar").value;

  if (usuario.cpf.length < 14) {
    mostrarMensagem("mensagem-cadastro", "Digite o CPF completo.", "erro");
    return;
  }
  if (usuario.telefone.length < 15) {
    mostrarMensagem("mensagem-cadastro", "Digite o telefone completo com DDD.", "erro");
    return;
  }
  if (usuario.cep.length < 9) {
    mostrarMensagem("mensagem-cadastro", "Digite o CEP completo.", "erro");
    return;
  }
  if (usuario.senha.length < 6) {
    mostrarMensagem("mensagem-cadastro", "A senha precisa ter pelo menos 6 caracteres.", "erro");
    return;
  }
  if (usuario.senha !== confirmar) {
    mostrarMensagem("mensagem-cadastro", "As senhas não são iguais.", "erro");
    return;
  }

  const usuarios = pegarUsuarios();
  const jaExiste = usuarios.find(function (u) {
    return u.email === usuario.email;
  });
  if (jaExiste) {
    mostrarMensagem("mensagem-cadastro", "Já existe uma conta com esse e-mail.", "erro");
    return;
  }

  usuarios.push(usuario);
  salvarDados("usuarios", usuarios);
  salvarDados("usuarioLogado", usuario);
  mostrarMensagem("mensagem-cadastro", "Conta criada! Indo para o seu perfil...", "sucesso");

  setTimeout(function () {
    window.location.href = "perfil.html";
  }, 1200);
}

// Login pelo pop-up
function abrirLogin() {
  document.getElementById("modal-login").classList.add("aberto");
  document.getElementById("login-email").focus();
}

function fecharLogin() {
  document.getElementById("modal-login").classList.remove("aberto");
}

function fazerLogin(evento) {
  evento.preventDefault();
  const email = document.getElementById("login-email").value.trim().toLowerCase();
  const senha = document.getElementById("login-senha").value;

  const usuario = pegarUsuarios().find(function (u) {
    return u.email === email && u.senha === senha;
  });

  if (!usuario) {
    mostrarMensagem("mensagem-login", "E-mail ou senha incorretos.", "erro");
    return;
  }

  salvarDados("usuarioLogado", usuario);
  fecharLogin();
  atualizarCabecalho();
}

function sair() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}

// READ: mostrar perfil
function mostrarPerfil() {
  const usuario = pegarUsuarioLogado();
  const areaPerfil = document.getElementById("area-perfil");
  const avisoPerfil = document.getElementById("aviso-perfil");

  if (!usuario) {
    areaPerfil.classList.add("oculto");
    avisoPerfil.classList.remove("oculto");
    return;
  }

  document.getElementById("perfil-nome-titulo").textContent = usuario.nome;
  document.getElementById("perfil-avatar").textContent = usuario.nome.charAt(0).toUpperCase();
  document.getElementById("perfil-email-texto").textContent = usuario.email;
  document.getElementById("perfil-nome").value = usuario.nome;
  document.getElementById("perfil-telefone").value = usuario.telefone;
  document.getElementById("perfil-cep").value = usuario.cep;
  document.getElementById("perfil-numero").value = usuario.numero;
  document.getElementById("perfil-endereco").value = usuario.endereco;
}

// UPDATE: salvar alterações
function salvarPerfil(evento) {
  evento.preventDefault();
  const usuario = pegarUsuarioLogado();

  usuario.nome = document.getElementById("perfil-nome").value.trim();
  usuario.telefone = document.getElementById("perfil-telefone").value;
  usuario.cep = document.getElementById("perfil-cep").value;
  usuario.numero = document.getElementById("perfil-numero").value;
  usuario.endereco = document.getElementById("perfil-endereco").value.trim();

  const usuarios = pegarUsuarios();
  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].email === usuario.email) {
      usuarios[i] = usuario;
    }
  }
  salvarDados("usuarios", usuarios);
  salvarDados("usuarioLogado", usuario);
  mostrarMensagem("mensagem-perfil", "Dados salvos.", "sucesso");
  mostrarPerfil();
  atualizarCabecalho();
}

// DELETE: excluir conta
function excluirConta() {
  const confirmou = confirm("Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.");
  if (!confirmou) {
    return;
  }
  const usuario = pegarUsuarioLogado();
  const usuarios = pegarUsuarios().filter(function (u) {
    return u.email !== usuario.email;
  });
  salvarDados("usuarios", usuarios);
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}

// ---------- Cabeçalho ----------
function atualizarCabecalho() {
  const usuario = pegarUsuarioLogado();
  const area = document.getElementById("area-usuario");

  if (usuario && area) {
    const primeiroNome = usuario.nome.split(" ")[0];
    area.innerHTML =
      '<a class="botao" href="perfil.html">Olá, ' + primeiroNome + '</a>' +
      '<button class="botao botao-texto" type="button" onclick="sair()">Sair</button>';
  }

  // contador de itens do carrinho
  let total = 0;
  pegarCarrinho().forEach(function (item) {
    total += item.quantidade;
  });
  document.querySelectorAll(".contador-carrinho").forEach(function (contador) {
    contador.textContent = total;
  });
}

// ---------- Produtos e busca ----------
function criarCartaoProduto(produto) {
  return (
    '<article class="cartao-produto">' +
      '<img src="' + produto.imagem + '" alt="' + produto.nome + '">' +
      '<div class="cartao-produto-info">' +
        '<span class="categoria">' + produto.categoria + '</span>' +
        '<h3>' + produto.nome + '</h3>' +
        '<p class="descricao">' + produto.descricao + '</p>' +
        '<div class="cartao-produto-rodape">' +
          '<span class="preco">' + formatarPreco(produto.preco) + '</span>' +
          '<button class="botao botao-principal" type="button" onclick="adicionarAoCarrinho(' + produto.id + ', this)">Adicionar</button>' +
        '</div>' +
      '</div>' +
    '</article>'
  );
}

function mostrarProdutos(lista, idGrade) {
  const grade = document.getElementById(idGrade);
  if (!grade) return;

  if (lista.length === 0) {
    grade.innerHTML = '<p class="aviso-vazio">Nenhum prato encontrado. Tente outro nome ou escolha "Todos".</p>';
    return;
  }

  let html = "";
  lista.forEach(function (produto) {
    html += criarCartaoProduto(produto);
  });
  grade.innerHTML = html;
}

let categoriaAtual = "Todos";

function filtrarProdutos() {
  const campoBusca = document.getElementById("campo-busca");
  const textoBusca = campoBusca.value.trim().toLowerCase();

  const resultado = produtos.filter(function (produto) {
    const nomeCombina = produto.nome.toLowerCase().includes(textoBusca);
    const categoriaCombina = categoriaAtual === "Todos" || produto.categoria === categoriaAtual;
    return nomeCombina && categoriaCombina;
  });

  mostrarProdutos(resultado, "grade-produtos");
}

function escolherCategoria(botao) {
  categoriaAtual = botao.dataset.categoria;
  document.querySelectorAll(".filtro").forEach(function (b) {
    b.classList.remove("ativo");
  });
  botao.classList.add("ativo");
  filtrarProdutos();
}

function iniciarPaginaProdutos() {
  const campoBusca = document.getElementById("campo-busca");
  if (!campoBusca) return;

  // se a pessoa buscou pelo cabeçalho, o texto vem no endereço (?busca=...)
  const parametros = new URLSearchParams(window.location.search);
  if (parametros.get("busca")) {
    campoBusca.value = parametros.get("busca");
  }

  campoBusca.addEventListener("input", filtrarProdutos);
  filtrarProdutos();
}

// ---------- Carrinho ----------
function pegarCarrinho() {
  return pegarDados("carrinho", []);
}

function adicionarAoCarrinho(idProduto, botao) {
  const carrinho = pegarCarrinho();
  const item = carrinho.find(function (i) {
    return i.id === idProduto;
  });

  if (item) {
    item.quantidade++;
  } else {
    carrinho.push({ id: idProduto, quantidade: 1 });
  }
  salvarDados("carrinho", carrinho);
  atualizarCabecalho();

  if (botao) {
    botao.textContent = "Adicionado";
    setTimeout(function () {
      botao.textContent = "Adicionar";
    }, 1000);
  }
}

function mudarQuantidade(idProduto, valor) {
  let carrinho = pegarCarrinho();
  carrinho.forEach(function (item) {
    if (item.id === idProduto) {
      item.quantidade += valor;
    }
  });
  carrinho = carrinho.filter(function (item) {
    return item.quantidade > 0;
  });
  salvarDados("carrinho", carrinho);
  mostrarCarrinho();
  atualizarCabecalho();
}

function removerDoCarrinho(idProduto) {
  const carrinho = pegarCarrinho().filter(function (item) {
    return item.id !== idProduto;
  });
  salvarDados("carrinho", carrinho);
  mostrarCarrinho();
  atualizarCabecalho();
}

function calcularSubtotal() {
  let subtotal = 0;
  pegarCarrinho().forEach(function (item) {
    const produto = produtos.find(function (p) {
      return p.id === item.id;
    });
    subtotal += produto.preco * item.quantidade;
  });
  return subtotal;
}

function mostrarCarrinho() {
  const lista = document.getElementById("lista-carrinho");
  if (!lista) return;

  const carrinho = pegarCarrinho();
  const resumo = document.getElementById("resumo-carrinho");

  if (carrinho.length === 0) {
    lista.innerHTML = '<p class="aviso-vazio">Seu carrinho está vazio. <a href="produtos.html">Escolha um prato no cardápio</a>.</p>';
    resumo.classList.add("oculto");
    return;
  }

  resumo.classList.remove("oculto");
  let html = "";
  carrinho.forEach(function (item) {
    const produto = produtos.find(function (p) {
      return p.id === item.id;
    });
    html +=
      '<div class="item-carrinho">' +
        '<img src="' + produto.imagem + '" alt="' + produto.nome + '">' +
        '<div class="item-carrinho-info">' +
          '<strong>' + produto.nome + '</strong><br>' +
          '<span>' + formatarPreco(produto.preco) + ' cada</span>' +
        '</div>' +
        '<div class="quantidade">' +
          '<button type="button" aria-label="Diminuir" onclick="mudarQuantidade(' + produto.id + ', -1)">−</button>' +
          '<span>' + item.quantidade + '</span>' +
          '<button type="button" aria-label="Aumentar" onclick="mudarQuantidade(' + produto.id + ', 1)">+</button>' +
        '</div>' +
        '<button class="botao botao-texto" type="button" onclick="removerDoCarrinho(' + produto.id + ')">Remover</button>' +
      '</div>';
  });
  lista.innerHTML = html;

  const subtotal = calcularSubtotal();
  document.getElementById("valor-subtotal").textContent = formatarPreco(subtotal);
  document.getElementById("valor-entrega").textContent = formatarPreco(TAXA_ENTREGA);
  document.getElementById("valor-total").textContent = formatarPreco(subtotal + TAXA_ENTREGA);
}

function finalizarPedido() {
  if (!pegarUsuarioLogado()) {
    mostrarMensagem("mensagem-carrinho", "Entre na sua conta para finalizar o pedido.", "erro");
    abrirLogin();
    return;
  }

  const carrinho = pegarCarrinho();
  const pedidos = pegarDados("pedidos", []);
  const agora = new Date();

  const pedido = {
    numero: 1000 + pedidos.length + 1,
    data: agora.toLocaleDateString("pt-BR") + " " + agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    itens: carrinho,
    pagamento: document.getElementById("forma-pagamento").value,
    total: calcularSubtotal() + TAXA_ENTREGA,
    status: "Em preparo",
    email: pegarUsuarioLogado().email
  };

  pedidos.push(pedido);
  salvarDados("pedidos", pedidos);
  salvarDados("carrinho", []);
  window.location.href = "pedidos.html";
}

// ---------- Pedidos ----------
function mostrarPedidos() {
  const lista = document.getElementById("lista-pedidos");
  if (!lista) return;

  const usuario = pegarUsuarioLogado();
  if (!usuario) {
    lista.innerHTML = '<p class="aviso-vazio">Entre na sua conta para ver seus pedidos.</p>';
    return;
  }

  const busca = document.getElementById("busca-pedido").value.trim();
  const pedidos = pegarDados("pedidos", []).filter(function (p) {
    return p.email === usuario.email && String(p.numero).includes(busca);
  });

  if (pedidos.length === 0) {
    lista.innerHTML = '<p class="aviso-vazio">Nenhum pedido encontrado. <a href="produtos.html">Faça seu primeiro pedido</a>.</p>';
    return;
  }

  let html = "";
  pedidos.reverse().forEach(function (pedido) {
    let quantidadeItens = 0;
    pedido.itens.forEach(function (item) {
      quantidadeItens += item.quantidade;
    });
    html +=
      '<article class="cartao-pedido">' +
        '<div>' +
          '<strong>Pedido #' + pedido.numero + '</strong>' +
          '<p>' + pedido.data + ' • ' + quantidadeItens + ' item(ns) • ' + pedido.pagamento + '</p>' +
        '</div>' +
        '<span class="status">' + pedido.status + '</span>' +
        '<strong>' + formatarPreco(pedido.total) + '</strong>' +
      '</article>';
  });
  lista.innerHTML = html;
}

// ---------- Inicia tudo quando a página carrega ----------
document.addEventListener("DOMContentLoaded", function () {
  aplicarTema();
  ativarMascaras();
  atualizarCabecalho();

  // produtos em destaque da tela inicial (os 4 primeiros)
  mostrarProdutos(produtos.slice(0, 4), "grade-destaques");

  iniciarPaginaProdutos();
  mostrarCarrinho();

  if (document.getElementById("lista-pedidos")) {
    document.getElementById("busca-pedido").addEventListener("input", mostrarPedidos);
    mostrarPedidos();
  }

  if (document.getElementById("area-perfil")) {
    mostrarPerfil();
  }

  // fecha o pop-up clicando fora dele ou apertando Esc
  const modal = document.getElementById("modal-login");
  modal.addEventListener("click", function (evento) {
    if (evento.target === modal) fecharLogin();
  });
  modal.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") fecharLogin();
  });
});
