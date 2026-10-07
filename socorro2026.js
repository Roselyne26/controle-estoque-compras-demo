const popup = document.getElementById("popup");
const listaRelatorio = document.getElementById("listaRelatorio");
const relatorioCabecalho = document.getElementById("relatorioCabecalho");
const totais = document.getElementById("totais");
const dataInicio = document.getElementById("dataInicio");
const dataFim = document.getElementById("dataFim");
const filtrosDataRelatorio = document.getElementById("filtrosDataRelatorio");
const modalEstoqueBaixo = document.getElementById("modalEstoqueBaixo");
const listaEstoqueBaixo = document.getElementById("listaEstoqueBaixo");
const modalProdutosDashboard = document.getElementById("modalProdutosDashboard");
const listaProdutosDashboard = document.getElementById("listaProdutosDashboard");
const dashRankingResponsaveis = document.getElementById("dashRankingResponsaveis");

const fornNome = document.getElementById("fornNome");
const fornCnpj = document.getElementById("fornCnpj");
const fornContato = document.getElementById("fornContato");
const statusFornecedores = document.getElementById("statusFornecedores");
const btnMaisFornecedores = document.getElementById("btnMaisFornecedores");

const prodNome = document.getElementById("prodNome");
const prodDescricao = document.getElementById("prodDescricao");
const prodUnidade = document.getElementById("prodUnidade");
const prodValor = document.getElementById("prodValor");
const prodMin = document.getElementById("prodMin");
const prodSemEstoque = document.getElementById("prodSemEstoque");
const prodRecorrente = document.getElementById("prodRecorrente");
const prodFornecedor = document.getElementById("prodFornecedor");
const dashMesAno = document.getElementById("dashMesAno");
const statusProdutos = document.getElementById("statusProdutos");
const btnMaisProdutos = document.getElementById("btnMaisProdutos");

const listaAutoProdutos = document.getElementById("listaAutoProdutos");
const listaAutoFornecedores = document.getElementById("listaAutoFornecedores");
const entradaProduto = document.getElementById("entradaProduto");
const entradaQtd = document.getElementById("entradaQtd");
const entradaValor = document.getElementById("entradaValor");
const entradaResp = document.getElementById("entradaResp");
const entradaObs = document.getElementById("entradaObs");
const entradaDevolucao = document.getElementById("entradaDevolucao");
const entradaRegistrarSaida = document.getElementById("entradaRegistrarSaida");
const entradaCamposSaida = document.getElementById("entradaCamposSaida");
const entradaSaidaQtd = document.getElementById("entradaSaidaQtd");
const entradaSaidaResp = document.getElementById("entradaSaidaResp");
const entradaSaidaObs = document.getElementById("entradaSaidaObs");

const saidaProduto = document.getElementById("saidaProduto");
const saidaQtd = document.getElementById("saidaQtd");
const saidaResp = document.getElementById("saidaResp");
const saidaObs = document.getElementById("saidaObs");
const servicoTipo = document.getElementById("servicoTipo");
const servicoCategoria = document.getElementById("servicoCategoria");
const servicoDescricao = document.getElementById("servicoDescricao");
const servicoValor = document.getElementById("servicoValor");
const relatorioTitulo = document.getElementById("relatorioTitulo");
const submenuRelatorios = document.getElementById("submenuRelatorios");
const statusRelatorio = document.getElementById("statusRelatorio");
const btnMaisRelatorio = document.getElementById("btnMaisRelatorio");

const listaFornecedores = document.getElementById("listaFornecedores");

const btnEntrada = document.getElementById("btnRegistrarEntrada");
const btnLogin = document.getElementById("btnLogin");

prodSemEstoque.addEventListener("change", () => {
  prodMin.disabled = prodSemEstoque.checked;
  if (prodSemEstoque.checked) prodMin.value = "0";
});

btnEntrada.addEventListener("click", registrarEntrada);

entradaRegistrarSaida.addEventListener("change", () => {
  entradaCamposSaida.classList.toggle("aberto", entradaRegistrarSaida.checked);
  if (entradaRegistrarSaida.checked) entradaSaidaQtd.focus();
});

async function registrarEntradaAntigaDesativada() {


  const produtoNome = entradaProduto.value.trim();
  const qtd = Number(entradaQtd.value);
  const resp = entradaResp?.value?.trim() || "";
  const obs = entradaObs?.value?.trim() || "";

  if (!produtoNome || qtd <= 0) {
    alert("Preencha corretamente");
    return;
  }

  const produto = await resolverProdutoMovimento(entradaProduto);
  if (!produto) {
    alert("Selecione o produto correto na lista de sugestões.");
    return;
  }
  await atualizarProdutoMemoriaDoFirestore(produto);

  try {
    const baixoAntes = produtoContaEstoqueBaixo(produto);
    await updateDoc(doc(demoRoot(), "produtos", produto._docId), {
      quantidade: increment(qtd)
    });

    const movimento = {
      data: new Date(),
      produtoId: produto._docId,
      produtoNome: getProdutoRotulo(produto),
      qtd,
      tipo: "Entrada",
      fornecedor: produto.fornecedor,
      resp,
      obs,
      valor: produto.valor
    };

    const ref = await addDoc(collection(demoRoot(), "historico"), {
      data: serverTimestamp(),
      produtoId: produto._docId,
      produtoNome: getProdutoRotulo(produto),
      qtd,
      tipo: "Entrada",
      fornecedor: produto.fornecedor,
      resp,
      obs,
      valor: produto.valor
    });

    produto.quantidade += qtd;
    produtosDashboardCache = [];
    estoqueBaixoCache = [];
    const baixoDepois = produtoContaEstoqueBaixo(produto);
    const resumosSincronizados = await sincronizarResumosMovimento(
      movimento,
      baixoAntes !== baixoDepois ? (baixoDepois ? 1 : -1) : 0
    );
    historico.push({ id: ref.id, ...movimento });
    atualizarProdutos();
    atualizarDashboard();

    entradaProduto.value = "";
    entradaProduto.dataset.produtoId = "";
    entradaQtd.value = "";
    if (entradaObs) entradaObs.value = "";

    if (resumosSincronizados) mostrarPopup("Entrada registrada ✅");
  } catch (e) {
    mostrarErroFirebase(e, "Erro ao registrar entrada");
  }
}


console.log("🔥 socorro2026.js carregado");

// 🔥 Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

// 🔐 Authentication
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ☁️ Firestore
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  where,
  limit,
  startAfter,
  increment,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


const firebaseConfig = {
 apiKey: "AIzaSyCwS0sUKfTRz8hdHZvWbZAPlMC7aLZLmZo",
 authDomain: "estoque-demo.firebaseapp.com",
 projectId: "estoque-demo",
 storageBucket: "estoque-demo.firebasestorage.app",
 messagingSenderId: "982988449601",
 appId: "1:982988449601:web:1309659a4c2e582324a3c0"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
let usuarioLogado = null;
function demoRoot() {
 if (!usuarioLogado?.uid) throw new Error("Entre na demo para continuar.");
 return doc(db, "visitantes", usuarioLogado.uid);
}


// ===== DADOS EM MEMÓRIA CARREGADOS DO FIRESTORE =====
let fornecedores = [];
let produtos = [];
let historico = [];
let servicos = [];
let produtoEditandoId = null;
let relatorioAtual = "estoque";
let produtosCarregados = false;
let fornecedoresCarregados = false;
let historicoPeriodoChave = "";
let servicosPeriodoChave = "";
const TAMANHO_PAGINA_LISTA = 10;
const TAMANHO_BUSCA_FIRESTORE = 30;
const TAMANHO_LOTE_RESUMO = 500;
let filtroProdutosAtual = "";
let limiteProdutosAtual = TAMANHO_PAGINA_LISTA;
let filtroFornecedoresAtual = "";
let limiteFornecedoresAtual = TAMANHO_PAGINA_LISTA;
let ultimoProdutoDoc = null;
let ultimoFornecedorDoc = null;
let ultimoHistoricoDoc = null;
let ultimoServicoDoc = null;
let podeBuscarMaisProdutos = true;
let podeBuscarMaisFornecedores = true;
let podeBuscarMaisHistorico = false;
let podeBuscarMaisServicos = false;
let periodoHistoricoAtual = null;
let periodoServicoAtual = null;
let relatorioTemMais = false;
let produtosDashboardCache = [];
let estoqueBaixoCache = [];
let timeoutBuscaFornecedorProduto = null;
let timeoutBuscaProdutoMovimento = null;

function getMesAtualInput() {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
}

function getPeriodoMesSelecionado() {
  if (!dashMesAno.value) {
    dashMesAno.value = getMesAtualInput();
  }

  const [ano, mes] = dashMesAno.value.split("-").map(Number);
  return {
    inicio: new Date(ano, mes - 1, 1, 0, 0, 0),
    fim: new Date(ano, mes, 0, 23, 59, 59)
  };
}

function formatarSimNao(valor) {
  return valor ? "Sim" : "Não";
}

function formatarMoedaBR(valor) {
  return (Number(valor) || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function parseMoedaBR(valor) {
  const texto = String(valor || "").replace(/[^\d,.-]/g, "").trim();
  if (!texto) return 0;
  const normalizado = texto.includes(",")
    ? texto.replace(/\./g, "").replace(",", ".")
    : texto;
  return Number(normalizado) || 0;
}

function formatarNumeroBR(valor, casas = 2) {
  return (Number(valor) || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas
  });
}

function formatarQuantidadeMedia(valor) {
  const numero = Number(valor) || 0;
  const casas = Number.isInteger(numero) ? 0 : 2;
  return numero.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: casas
  });
}

function getChaveMes(data = new Date()) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}

function produtoContaEstoqueBaixo(produto) {
  return !produto.semEstoque && produto.minimo > 0 && produto.quantidade <= produto.minimo;
}

function produtoParaMemoria(id, p) {
  const nome = p.nome || "";
  const descricao = p.descricao || "";
  return {
    _docId: id,
    nome,
    nomeLower: p.nomeLower || nome.trim().toLowerCase(),
    descricao,
    descricaoLower: p.descricaoLower || descricao.trim().toLowerCase(),
    unidade: p.unidade || "",
    valor: Number(p.valor) || 0,
    minimo: Number(p.minimo) || 0,
    semEstoque: !!p.semEstoque,
    recorrente: !!p.recorrente,
    fornecedor: p.fornecedor,
    quantidade: Math.floor(Number(p.quantidade) || 0)
  };
}

function getProdutoRotulo(produto) {
  const partes = [produto.nome, produto.descricao, produto.unidade]
    .map(v => (v || "").trim())
    .filter(Boolean);
  return partes.join(" - ");
}

function inferirUnidadeProduto(texto) {
  const upper = texto.toUpperCase();
  const regras = [
    [/CAIXA|CX\b/, "Caixa"],
    [/PACOTE|PCT\b/, "Pacote"],
    [/FRASCO/, "Frasco"],
    [/GAL[ÃA]O/, "Galão"],
    [/ROLO/, "Rolo"],
    [/KIT/, "Kit"],
    [/\bPAR\b/, "Par"],
    [/ENVELOPE/, "Envelope"],
    [/\bUN\b|UNI|UNIDADE|UNIDADES/, "Unidade"]
  ];
  return regras.find(([regex]) => regex.test(upper))?.[1] || "";
}

function normalizarDescricaoProduto(texto) {
  return texto
    .replace(/\b(\d+)\s*UNI\b/gi, "$1 unidades")
    .replace(/\b(\d+)\s*UN\b/gi, "$1 unidades")
    .replace(/\b(\d+)\s*G\b/gi, "$1 g")
    .replace(/\b(\d+)\s*KG\b/gi, "$1 kg")
    .replace(/\b(\d+)\s*ML\b/gi, "$1 ml")
    .replace(/\b(\d+)\s*L\b/gi, "$1 L")
    .replace(/\bPACOTE\s+(\d+)/gi, "Pacote com $1")
    .replace(/\bCAIXA\s+(\d+)/gi, "Caixa com $1")
    .replace(/\bTAM(?:ANHO)?\s*([PMGG]{1,2})\b/gi, "Tamanho $1")
    .replace(/\s+/g, " ")
    .trim();
}

function interpretarProdutoExistente(nomeOriginal) {
  const original = (nomeOriginal || "").trim();
  if (!original) {
    return { nome: "", descricao: "", unidade: "", revisaoManual: true };
  }

  const partes = original.split(/\s+-\s+/);
  let nome = partes[0].trim();
  let descricao = partes.slice(1).join(" - ").trim();

  const padroesDescricao = [
    /\b\d+\s*(?:G|KG|ML|L|CM|MM|M)\b/i,
    /\b\d+\s*LITROS?\b/i,
    /\b(?:PACOTE|CAIXA|FRASCO|GAL[ÃA]O|ROLO|KIT|PAR|ENVELOPE)\b.*$/i,
    /\bTAM(?:ANHO)?\s*(?:P|M|G|GG)\b/i
  ];

  if (!descricao) {
    for (const regex of padroesDescricao) {
      const match = original.match(regex);
      if (match && match.index > 0) {
        nome = original.slice(0, match.index).trim().replace(/[-,]+$/, "").trim();
        descricao = original.slice(match.index).trim();
        break;
      }
    }
  }

  const unidade = inferirUnidadeProduto(`${descricao} ${original}`) || "Unidade";
  descricao = normalizarDescricaoProduto(descricao);

  const revisaoManual = !descricao || nome.length < 2;
  return {
    nome: revisaoManual ? original : nome,
    descricao: revisaoManual ? "" : descricao,
    unidade,
    revisaoManual
  };
}

function getProdutoPorCampo(input) {
  const id = input.dataset.produtoId;
  if (id) {
    const porId = produtos.find(p => p._docId === id);
    if (porId) return porId;
  }

  const valor = input.value.trim();
  return produtos.find(p => getProdutoRotulo(p) === valor) || null;
}

function vincularProdutoSelecionado(input) {
  const produto = produtos.find(p => getProdutoRotulo(p) === input.value.trim());
  input.dataset.produtoId = produto?._docId || "";
}

async function resolverProdutoMovimento(input) {
  vincularProdutoSelecionado(input);
  let produto = getProdutoPorCampo(input);
  if (produto) return produto;

  await buscarProdutosMovimento(input.value);
  vincularProdutoSelecionado(input);
  produto = getProdutoPorCampo(input);
  return produto;
}

async function atualizarProdutoMemoriaDoFirestore(produto) {
  const snap = await getDoc(doc(demoRoot(), "produtos", produto._docId));
  if (!snap.exists()) return produto;

  const atualizado = produtoParaMemoria(snap.id, snap.data());
  Object.assign(produto, atualizado);
  return produto;
}

async function buscarProdutoPorNome(nome) {
  const nomeLower = nome.trim().toLowerCase();
  let produto = produtos.find(p => p.nomeLower === nomeLower || p.nome.trim().toLowerCase() === nomeLower);
  if (produto) return produto;

  const q = query(
    collection(demoRoot(), "produtos"),
    where("nomeLower", "==", nomeLower),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    const fallback = query(
      collection(demoRoot(), "produtos"),
      where("nome", "==", nome.trim()),
      limit(1)
    );
    const fallbackSnapshot = await getDocs(fallback);
    if (fallbackSnapshot.empty) return null;

    const d = fallbackSnapshot.docs[0];
    produto = produtoParaMemoria(d.id, d.data());
    produtos.push(produto);
    atualizarAutoComplete();
    return produto;
  }

  const d = snapshot.docs[0];
  produto = produtoParaMemoria(d.id, d.data());
  produtos.push(produto);
  atualizarAutoComplete();
  return produto;
}

function getProdutosEstoqueBaixo() {
  return produtos.filter(produtoContaEstoqueBaixo);
}

function baixarCsv(nomeArquivo, csv) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = nomeArquivo;
  a.click();
}

function configurarCabecalhoRelatorioPadrao() {
  relatorioCabecalho.innerHTML = `
    <th>Data</th>
    <th>Produto</th>
    <th>Qtd</th>
    <th>Tipo</th>
    <th>Responsável / Fornecedor</th>
    <th>Valor unit</th>
    <th>Valor total</th>
  `;
}

function configurarCabecalhoRelatorioServicos() {
  relatorioCabecalho.innerHTML = `
    <th>Data</th>
    <th>Tipo</th>
    <th>Categoria</th>
    <th>Valor</th>
  `;
}

function formatarDuracaoEstimada(dias) {
  if (!isFinite(dias) || dias < 0) return "Sem previsão";
  if (dias < 30) return `${Math.ceil(dias)} dias`;
  if (dias < 60) {
    const semanas = Math.max(5, Math.round(dias / 7));
    return `${semanas} semanas`;
  }

  const meses = Math.round(dias / 30);
  return meses === 1 ? "1 mês" : `${meses} meses`;
}

async function garantirResumoEstoque() {
  const ref = doc(demoRoot(), "resumosGerais", "estoque");
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const resumoExistente = snap.data();
    return {
      totalProdutos: Number(resumoExistente.totalProdutos) || 0,
      estoqueBaixo: Number(resumoExistente.estoqueBaixo) || 0
    };
  }

  console.warn("Resumo de estoque não encontrado. Criando resumo inicial uma única vez.");
  return await reconstruirResumoEstoqueManutencao();
}

async function reconstruirResumoEstoqueManutencao() {
  const ref = doc(demoRoot(), "resumosGerais", "estoque");
  let totalProdutos = 0;
  let estoqueBaixo = 0;
  let ultimoDoc = null;

  while (true) {
    const q = ultimoDoc
      ? query(collection(demoRoot(), "produtos"), orderBy("nome"), startAfter(ultimoDoc), limit(TAMANHO_LOTE_RESUMO))
      : query(collection(demoRoot(), "produtos"), orderBy("nome"), limit(TAMANHO_LOTE_RESUMO));
    const snapshot = await getDocs(q);
    if (snapshot.empty) break;

    snapshot.forEach(d => {
      const produto = produtoParaMemoria(d.id, d.data());
      totalProdutos += 1;
      if (produtoContaEstoqueBaixo(produto)) estoqueBaixo += 1;
    });

    ultimoDoc = snapshot.docs[snapshot.docs.length - 1];
    if (snapshot.size < TAMANHO_LOTE_RESUMO) break;
  }

  const resumo = { totalProdutos, estoqueBaixo, atualizadoEm: new Date() };
  await setDoc(ref, resumo);
  return resumo;
}

async function garantirResumoMensal(chaveMes, inicio, fim) {
  const ref = doc(demoRoot(), "resumosMensais", chaveMes);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const resumoExistente = snap.data();
    return {
      totalEntradas: Number(resumoExistente.totalEntradas) || 0,
      totalSaidas: Number(resumoExistente.totalSaidas) || 0
    };
  }

  console.warn(`Resumo mensal ${chaveMes} não encontrado. Criando resumo inicial do mês uma única vez.`);
  return await reconstruirResumoMensalManutencao(chaveMes);
}

async function reconstruirResumoMensalManutencao(chaveMes) {
  const [ano, mes] = chaveMes.split("-").map(Number);
  const inicio = new Date(ano, mes - 1, 1, 0, 0, 0);
  const fim = new Date(ano, mes, 0, 23, 59, 59);
  const ref = doc(demoRoot(), "resumosMensais", chaveMes);
  let totalEntradas = 0;
  let totalSaidas = 0;
  let ultimoDoc = null;

  while (true) {
    const q = ultimoDoc
      ? query(
          collection(demoRoot(), "historico"),
          where("data", ">=", inicio),
          where("data", "<=", fim),
          orderBy("data", "asc"),
          startAfter(ultimoDoc),
          limit(TAMANHO_LOTE_RESUMO)
        )
      : query(
          collection(demoRoot(), "historico"),
          where("data", ">=", inicio),
          where("data", "<=", fim),
          orderBy("data", "asc"),
          limit(TAMANHO_LOTE_RESUMO)
        );

    const snapshot = await getDocs(q);
    if (snapshot.empty) break;

    snapshot.forEach(d => {
      const h = d.data();
      const total = (Number(h.qtd) || 0) * (Number(h.valor) || 0);
      if (h.tipo === "Entrada") totalEntradas += total;
      if (h.tipo === "Saída") totalSaidas += total;
    });

    ultimoDoc = snapshot.docs[snapshot.docs.length - 1];
    if (snapshot.size < TAMANHO_LOTE_RESUMO) break;
  }

  const resumo = { totalEntradas, totalSaidas, atualizadoEm: new Date() };
  await setDoc(ref, resumo);
  return resumo;
}

async function atualizarResumoMensalMovimento(movimento) {
  const chaveMes = getChaveMes(movimento.data);
  const total = (Number(movimento.qtd) || 0) * (Number(movimento.valor) || 0);
  const delta = movimento.tipo === "Entrada"
    ? { totalEntradas: increment(total), totalSaidas: increment(0) }
    : { totalEntradas: increment(0), totalSaidas: increment(total) };

  await setDoc(doc(demoRoot(), "resumosMensais", chaveMes), delta, { merge: true });
}

async function ajustarResumoEstoque(deltaProdutos = 0, deltaBaixo = 0) {
  await setDoc(
    doc(demoRoot(), "resumosGerais", "estoque"),
    {
      totalProdutos: increment(deltaProdutos),
      estoqueBaixo: increment(deltaBaixo),
      atualizadoEm: new Date()
    },
    { merge: true }
  );
}

async function sincronizarResumosMovimento(movimento, deltaBaixo = 0) {
  try {
    await atualizarResumoMensalMovimento(movimento);
    if (deltaBaixo !== 0) {
      await ajustarResumoEstoque(0, deltaBaixo);
    }
    return true;
  } catch (e) {
    console.error(
      "ERRO AO ATUALIZAR RESUMOS: a movimentação foi registrada, mas os documentos de resumo precisam ser sincronizados manualmente.",
      {
        erro: e,
        movimento,
        deltaBaixo,
        resumoMensal: `resumosMensais/${getChaveMes(movimento.data)}`,
        resumoEstoque: "resumosGerais/estoque"
      }
    );
    mostrarErroFirebase(e, "Movimentação registrada, mas o resumo precisa ser sincronizado");
    return false;
  }
}

async function calcularResumoEstoqueReal() {
  let totalProdutos = 0;
  let estoqueBaixo = 0;
  let ultimoDoc = null;

  while (true) {
    const q = ultimoDoc
      ? query(collection(demoRoot(), "produtos"), orderBy("nome"), startAfter(ultimoDoc), limit(TAMANHO_LOTE_RESUMO))
      : query(collection(demoRoot(), "produtos"), orderBy("nome"), limit(TAMANHO_LOTE_RESUMO));
    const snapshot = await getDocs(q);
    if (snapshot.empty) break;

    snapshot.forEach(d => {
      const produto = produtoParaMemoria(d.id, d.data());
      totalProdutos += 1;
      if (produtoContaEstoqueBaixo(produto)) estoqueBaixo += 1;
    });

    ultimoDoc = snapshot.docs[snapshot.docs.length - 1];
    if (snapshot.size < TAMANHO_LOTE_RESUMO) break;
  }

  return { totalProdutos, estoqueBaixo };
}

async function calcularResumoMensalReal(chaveMes) {
  const [ano, mes] = chaveMes.split("-").map(Number);
  const inicio = new Date(ano, mes - 1, 1, 0, 0, 0);
  const fim = new Date(ano, mes, 0, 23, 59, 59);
  let totalEntradas = 0;
  let totalSaidas = 0;
  let ultimoDoc = null;

  while (true) {
    const q = ultimoDoc
      ? query(
          collection(demoRoot(), "historico"),
          where("data", ">=", inicio),
          where("data", "<=", fim),
          orderBy("data", "asc"),
          startAfter(ultimoDoc),
          limit(TAMANHO_LOTE_RESUMO)
        )
      : query(
          collection(demoRoot(), "historico"),
          where("data", ">=", inicio),
          where("data", "<=", fim),
          orderBy("data", "asc"),
          limit(TAMANHO_LOTE_RESUMO)
        );
    const snapshot = await getDocs(q);
    if (snapshot.empty) break;

    snapshot.forEach(d => {
      const h = d.data();
      const total = (Number(h.qtd) || 0) * (Number(h.valor) || 0);
      if (h.tipo === "Entrada") totalEntradas += total;
      if (h.tipo === "Saída") totalSaidas += total;
    });

    ultimoDoc = snapshot.docs[snapshot.docs.length - 1];
    if (snapshot.size < TAMANHO_LOTE_RESUMO) break;
  }

  return { totalEntradas, totalSaidas };
}

async function diagnosticarResumos(chaveMes = getChaveMes()) {
  const [estoqueSnap, mensalSnap, estoqueReal, mensalReal] = await Promise.all([
    getDoc(doc(demoRoot(), "resumosGerais", "estoque")),
    getDoc(doc(demoRoot(), "resumosMensais", chaveMes)),
    calcularResumoEstoqueReal(),
    calcularResumoMensalReal(chaveMes)
  ]);

  const estoqueResumo = estoqueSnap.exists()
    ? {
        totalProdutos: Number(estoqueSnap.data().totalProdutos) || 0,
        estoqueBaixo: Number(estoqueSnap.data().estoqueBaixo) || 0
      }
    : null;
  const mensalResumo = mensalSnap.exists()
    ? {
        totalEntradas: Number(mensalSnap.data().totalEntradas) || 0,
        totalSaidas: Number(mensalSnap.data().totalSaidas) || 0
      }
    : null;

  const resultado = {
    chaveMes,
    estoque: {
      resumo: estoqueResumo,
      real: estoqueReal,
      divergente:
        !estoqueResumo ||
        estoqueResumo.totalProdutos !== estoqueReal.totalProdutos ||
        estoqueResumo.estoqueBaixo !== estoqueReal.estoqueBaixo
    },
    mensal: {
      resumo: mensalResumo,
      real: mensalReal,
      divergente:
        !mensalResumo ||
        Math.abs(mensalResumo.totalEntradas - mensalReal.totalEntradas) > 0.009 ||
        Math.abs(mensalResumo.totalSaidas - mensalReal.totalSaidas) > 0.009
    }
  };

  console.log("Diagnóstico dos resumos:", resultado);
  if (resultado.estoque.divergente || resultado.mensal.divergente) {
    console.warn("Divergência encontrada nos resumos. Rode as funções de reconstrução manual para sincronizar.");
  } else {
    console.log("Resumos consistentes com os dados reais do Firestore.");
  }

  return resultado;
}

async function migrarProdutosDescricao() {
  const relatorio = {
    migradosAutomaticamente: 0,
    revisaoManual: 0,
    exemplos: []
  };
  let ultimoDoc = null;

  while (true) {
    const q = query(
      collection(demoRoot(), "produtos"),
      orderBy("nome"),
      ...(ultimoDoc ? [startAfter(ultimoDoc)] : []),
      limit(TAMANHO_LOTE_RESUMO)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) break;

    for (const d of snapshot.docs) {
      const produto = d.data();
      const nomeOriginal = produto.nome || "";

      if (produto.descricao && produto.unidade && produto.nomeLower && produto.descricaoLower) {
        continue;
      }

      const interpretado = interpretarProdutoExistente(nomeOriginal);
      const dadosAtualizados = {
        nome: interpretado.nome || nomeOriginal,
        descricao: produto.descricao || interpretado.descricao || "",
        unidade: produto.unidade || interpretado.unidade || "",
        nomeLower: (interpretado.nome || nomeOriginal).trim().toLowerCase(),
        descricaoLower: (produto.descricao || interpretado.descricao || "").trim().toLowerCase()
      };

      await updateDoc(doc(demoRoot(), "produtos", d.id), dadosAtualizados);

      if (interpretado.revisaoManual) {
        relatorio.revisaoManual += 1;
        console.warn("Produto precisa de revisão manual:", {
          id: d.id,
          nomeOriginal,
          sugestao: dadosAtualizados
        });
      } else {
        relatorio.migradosAutomaticamente += 1;
      }

      if (relatorio.exemplos.length < 10) {
        relatorio.exemplos.push({
          id: d.id,
          antes: nomeOriginal,
          depois: {
            nome: dadosAtualizados.nome,
            descricao: dadosAtualizados.descricao,
            unidade: dadosAtualizados.unidade
          },
          revisaoManual: interpretado.revisaoManual
        });
      }
    }

    ultimoDoc = snapshot.docs[snapshot.docs.length - 1];
    if (snapshot.size < TAMANHO_LOTE_RESUMO) break;
  }

  console.log("Relatório da migração de produtos:", relatorio);
  return relatorio;
}

/* LOGIN */
async function login() {
 btnLogin.disabled = true;
 btnLogin.textContent = "Abrindo demo…";
 try {
  const credencial = await signInAnonymously(auth);
  usuarioLogado = credencial.user;
  await prepararDadosDemo();
  document.getElementById("loginTela").style.display = "none";
  document.getElementById("sistema").style.display = "flex";
  await mostrarTela("dashboard");
 } catch (e) {
  document.getElementById("loginTela").style.display = "flex";
  document.getElementById("sistema").style.display = "none";
  mostrarErroFirebase(e, "Erro ao abrir a demo");
 } finally {
  btnLogin.disabled = false;
  btnLogin.textContent = "Entrar na demo";
 }
}

async function prepararDadosDemo() {
 const marker = doc(demoRoot(), "config", "inicializacao");
 if ((await getDoc(marker)).exists()) return;
 const batch = writeBatch(db);
 const nomes = ["Papel A4", "Caneta azul", "Pasta organizadora", "Toner", "Etiqueta adesiva", "Envelope"];
 const data = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12);
 for (let i=0; i<nomes.length; i++) {
  const quantidade = [45,8,30,5,60,25][i];
  const valor = [28,3,12,85,15,10][i];
  const nome = nomes[i];
  const id = "exemplo-"+i;
  const fornecedor = "Fornecedor Exemplo";
  batch.set(doc(demoRoot(), "produtos", id), {nome, nomeLower:nome.toLowerCase(), descricao:"Material de escritório", descricaoLower:"material de escritório", unidade:"Unidade", quantidade, valor, minimo:10, semEstoque:false, recorrente:true, fornecedor});
  batch.set(doc(demoRoot(), "historico", "entrada-"+i), {produtoId:id,produtoNome:nome+" - Material de escritório - Unidade",tipo:"Entrada",qtd:quantidade,valor,fornecedor,resp:fornecedor,obs:"Movimentação fictícia",data});
 }
 batch.set(doc(demoRoot(), "fornecedores", "exemplo"), {nome:"Fornecedor Exemplo",nomeLower:"fornecedor exemplo",cnpj:"",contato:"contato@example.com"});
 batch.set(marker, {criadoEm:serverTimestamp()});
 await batch.commit();
}

btnLogin.addEventListener("click", login);
entradaProduto.addEventListener("change", () => vincularProdutoSelecionado(entradaProduto));
saidaProduto.addEventListener("change", () => vincularProdutoSelecionado(saidaProduto));
entradaProduto.addEventListener("input", () => buscarProdutosMovimentoDebounced(entradaProduto.value));
saidaProduto.addEventListener("input", () => buscarProdutosMovimentoDebounced(saidaProduto.value));
prodValor.addEventListener("blur", () => {
  const valor = parseMoedaBR(prodValor.value);
  prodValor.value = valor ? formatarMoedaBR(valor) : "";
});
prodFornecedor.addEventListener("input", () => {
  clearTimeout(timeoutBuscaFornecedorProduto);
  timeoutBuscaFornecedorProduto = setTimeout(() => buscarFornecedoresProduto(prodFornecedor.value), 250);
});
prodFornecedor.addEventListener("change", () => vincularFornecedorSelecionado());


/* TELAS */
async function mostrarTela(id) {
  document.querySelectorAll(".tela").forEach(t => t.style.display = "none");
  document.getElementById(id).style.display = "block";

  if (id === "dashboard") {
    await atualizarDashboard();
  }

  if (id === "produtos") {
  await carregarProdutosFirestore(true);
  await carregarFornecedoresFirestore();
  atualizarProdutos();
  atualizarAutoComplete();
}

  if (id === "fornecedores") {
    await carregarFornecedoresFirestore();
    atualizarFornecedores();
  }

  if (id === "entradas" || id === "saidas") {
    await carregarProdutosFirestore();
    atualizarAutoComplete();
  }

  if (id === "relatorios") {
    listaRelatorio.innerHTML = "";
    totais.innerText = "";
    selecionarRelatorio(relatorioAtual);
  }
}

function alternarMenuRelatorios() {
  submenuRelatorios.classList.toggle("aberto");
}

function abrirRelatorio(tipo) {
  submenuRelatorios.classList.add("aberto");
  mostrarTela("relatorios");
  selecionarRelatorio(tipo);
}

/* POPUP */
function mostrarPopup(msg, tipo = "sucesso") {
  popup.innerText = msg;
  popup.classList.remove("erro", "sucesso");
  popup.classList.add(tipo);
  popup.style.display = "block";
  setTimeout(() => popup.style.display = "none", tipo === "erro" ? 6000 : 2500);
}

function getMensagemErroFirebase(erro) {
  const codigo = erro?.code || "";

  const mensagens = {
    "permission-denied": "Sem permissão para acessar o Firebase.",
    "unavailable": "Firebase indisponível no momento. Verifique a internet e tente novamente.",
    "deadline-exceeded": "A operação demorou demais. Tente novamente.",
    "resource-exhausted": "Limite de uso do Firebase atingido. Tente novamente mais tarde.",
    "unauthenticated": "Sua sessão expirou. Faça login novamente.",
    "not-found": "Registro não encontrado no Firebase.",
    "already-exists": "Esse registro já existe no Firebase.",
    "cancelled": "Operação cancelada no Firebase.",
    "auth/invalid-credential": "E-mail ou senha inválidos.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/too-many-requests": "Muitas tentativas de login. Aguarde e tente novamente.",
    "auth/network-request-failed": "Falha de conexão com o Firebase."
  };

  return mensagens[codigo] || erro?.message || "Erro inesperado ao comunicar com o Firebase.";
}

function mostrarErroFirebase(erro, contexto = "Operação no Firebase") {
  console.error(`${contexto}:`, erro);
  mostrarPopup(`${contexto}: ${getMensagemErroFirebase(erro)}`, "erro");
}

window.addEventListener("unhandledrejection", event => {
  mostrarErroFirebase(event.reason, "Erro inesperado no Firebase");
});

window.addEventListener("error", event => {
  if (event.filename && event.filename.startsWith("chrome-extension://")) return;
  mostrarErroFirebase(event.error || event.message, "Erro inesperado no sistema");
});

/* FORNECEDORES */
async function cadastrarFornecedor() {
  if (!fornNome.value) return;

  const fornecedor = {
    nome: fornNome.value,
    nomeLower: fornNome.value.trim().toLowerCase(),
    cnpj: fornCnpj.value,
    contato: fornContato.value,
    criadoEm: new Date()
  };

  // ☁️ salva na nuvem
  try {
    const ref = await addDoc(collection(demoRoot(), "fornecedores"), fornecedor);
    fornecedores.push({ _docId: ref.id, ...fornecedor });
  } catch (e) {
    mostrarErroFirebase(e, "Erro ao salvar fornecedor");
    return;
  }

atualizarFornecedores();
fornNome.value = fornCnpj.value = fornContato.value = "";
mostrarPopup("Fornecedor salvo ☁️✅");
}

function atualizarFornecedores(filtro = filtroFornecedoresAtual) {
  filtroFornecedoresAtual = filtro;
  listaFornecedores.innerHTML = "";
  atualizarAutoCompleteFornecedores();

  const fornecedoresFiltrados = fornecedores
    .map((f, i) => ({ ...f, _indiceLista: i }))
    .filter(f => {
      const termo = filtro.toLowerCase();
      return (
        f.nome?.toLowerCase().includes(termo) ||
        f.cnpj?.toLowerCase().includes(termo) ||
        f.contato?.toLowerCase().includes(termo)
      );
    });

  listaFornecedores.innerHTML = fornecedoresFiltrados
    .slice(0, limiteFornecedoresAtual)
    .map(f => `
      <tr>
        <td>${f.nome}</td>
        <td>${f.cnpj}</td>
        <td>${f.contato}</td>
        <td><button onclick="editarFornecedor(${f._indiceLista})">Editar</button></td>
      </tr>`)
    .join("");

  const exibidos = Math.min(limiteFornecedoresAtual, fornecedoresFiltrados.length);
  statusFornecedores.innerText = `Mostrando ${exibidos} de ${fornecedoresFiltrados.length}`;
  btnMaisFornecedores.style.display =
    exibidos < fornecedoresFiltrados.length ? "inline-block" : "none";
}

function atualizarAutoCompleteFornecedores(lista = fornecedores) {
  listaAutoFornecedores.innerHTML = "";
  lista.forEach(f => {
    listaAutoFornecedores.innerHTML += `<option value="${f.nome}"></option>`;
  });
}

function vincularFornecedorSelecionado() {
  const fornecedor = fornecedores.find(f => f.nome === prodFornecedor.value.trim());
  prodFornecedor.dataset.fornecedorId = fornecedor?._docId || "";
}

async function buscarFornecedoresProduto(termoDigitado) {
  const termoOriginal = termoDigitado.trim();
  const termo = termoOriginal.toLowerCase();
  if (!termo) {
    atualizarAutoCompleteFornecedores();
    return;
  }

  const encontrados = fornecedores.filter(f =>
    (f.nome || "").toLowerCase().includes(termo)
  );

  try {
    const consultas = [
      query(
        collection(demoRoot(), "fornecedores"),
        where("nomeLower", ">=", termo),
        where("nomeLower", "<=", termo + "\uf8ff"),
        orderBy("nomeLower"),
        limit(10)
      ),
      query(
        collection(demoRoot(), "fornecedores"),
        where("nome", ">=", termoOriginal.toUpperCase()),
        where("nome", "<=", termoOriginal.toUpperCase() + "\uf8ff"),
        orderBy("nome"),
        limit(10)
      )
    ];

    const snapshots = await Promise.all(consultas.map(c => getDocs(c)));
    snapshots.forEach(snapshot => {
      snapshot.forEach(d => {
        if (!encontrados.some(f => f._docId === d.id)) {
          encontrados.push({ _docId: d.id, ...d.data() });
        }
      });
    });
  } catch (e) {
    mostrarErroFirebase(e, "Erro ao buscar fornecedores");
  }

  atualizarAutoCompleteFornecedores(encontrados.slice(0, 10));
}

function filtrarFornecedores(txt) {
  limiteFornecedoresAtual = TAMANHO_PAGINA_LISTA;
  filtroFornecedoresAtual = txt;
  carregarFornecedoresFirestore(true);
}

async function mostrarMaisFornecedores() {
  limiteFornecedoresAtual += TAMANHO_PAGINA_LISTA;
  if (podeBuscarMaisFornecedores && limiteFornecedoresAtual > fornecedores.length) {
    await carregarFornecedoresFirestore(false);
  }
  atualizarFornecedores();
}

function editarFornecedor(i) {
  const f = fornecedores[i];
  fornNome.value = f.nome;
  fornCnpj.value = f.cnpj;
  fornContato.value = f.contato;
  fornecedores.splice(i, 1);
  atualizarFornecedores();
}

/* PRODUTOS */
async function cadastrarProduto() {
  const nome = prodNome.value.trim();
  const descricao = prodDescricao.value.trim();
  const unidade = prodUnidade.value;
  const valor = parseMoedaBR(prodValor.value);
  const semEstoque = prodSemEstoque.checked;
  const recorrente = prodRecorrente.checked;
  const minimo = semEstoque ? 0 : Number(prodMin.value);
  const fornecedor = prodFornecedor.value;

  if (!nome) return;

  if (produtoEditandoId) {
    await updateDoc(doc(demoRoot(), "produtos", produtoEditandoId), {
      nome,
      nomeLower: nome.toLowerCase(),
      descricao,
      descricaoLower: descricao.toLowerCase(),
      unidade,
      valor,
      minimo,
      semEstoque,
      recorrente,
      fornecedor
    });

    const produto = produtos.find(p => p._docId === produtoEditandoId);
    const baixoAntes = produto ? produtoContaEstoqueBaixo(produto) : false;
    if (produto) {
      Object.assign(produto, {
        nome,
        nomeLower: nome.toLowerCase(),
        descricao,
        descricaoLower: descricao.toLowerCase(),
        unidade,
        valor,
        minimo,
        semEstoque,
        recorrente,
        fornecedor
      });
      const baixoDepois = produtoContaEstoqueBaixo(produto);
      if (baixoAntes !== baixoDepois) {
        await ajustarResumoEstoque(0, baixoDepois ? 1 : -1);
      }
    }

    mostrarPopup("Produto atualizado ✅");
    produtoEditandoId = null;
  } else {
    const novoProduto = {
      nome,
      nomeLower: nome.toLowerCase(),
      descricao,
      descricaoLower: descricao.toLowerCase(),
      unidade,
      valor,
      minimo,
      semEstoque,
      recorrente,
      fornecedor,
      quantidade: 0
    };

    const ref = await addDoc(collection(demoRoot(), "produtos"), novoProduto);
    const produtoMemoria = { _docId: ref.id, ...novoProduto };
    produtos.push(produtoMemoria);
    await ajustarResumoEstoque(1, produtoContaEstoqueBaixo(produtoMemoria) ? 1 : 0);

    mostrarPopup("Produto cadastrado ✅");
  }

  atualizarProdutos();
  atualizarAutoComplete();
  estoqueBaixoCache = [];
  produtosDashboardCache = [];

  prodNome.value = "";
  prodDescricao.value = "";
  prodUnidade.value = "";
  prodValor.value = "";
  prodMin.value = "";
  prodSemEstoque.checked = false;
  prodMin.disabled = false;
  prodRecorrente.checked = false;
  prodFornecedor.value = "";
}


function editarProduto(id) {
  const p = produtos.find(p => p._docId === id);
  if (!p) return;

  produtoEditandoId = p._docId; // 🔥 ISSO É O SEGREDO

  prodNome.value = p.nome;
  prodDescricao.value = p.descricao || "";
  prodUnidade.value = p.unidade || "";
  prodValor.value = formatarMoedaBR(p.valor);
  prodMin.value = p.minimo;
  prodSemEstoque.checked = !!p.semEstoque;
  prodMin.disabled = !!p.semEstoque;
  prodRecorrente.checked = !!p.recorrente;
  prodFornecedor.value = p.fornecedor;
}

function filtrarProdutos(txt) {
  limiteProdutosAtual = TAMANHO_PAGINA_LISTA;
  filtroProdutosAtual = txt;
  carregarProdutosFirestore(true);
}

async function mostrarMaisProdutos() {
  limiteProdutosAtual += TAMANHO_PAGINA_LISTA;
  if (podeBuscarMaisProdutos && limiteProdutosAtual > produtos.length) {
    await carregarProdutosFirestore(false);
  }
  atualizarProdutos();
}

/* AUTOCOMPLETE */
function atualizarAutoComplete() {
  renderizarAutoCompleteProdutos(produtos);
}

function renderizarAutoCompleteProdutos(lista) {
  listaAutoProdutos.innerHTML = "";

  lista.forEach(p => {
    const estoque = `Estoque: ${p.quantidade}`;
    listaAutoProdutos.innerHTML += `<option value="${getProdutoRotulo(p)}" label="${estoque}"></option>`;
  });
}

function buscarProdutosMovimentoDebounced(termo) {
  clearTimeout(timeoutBuscaProdutoMovimento);
  timeoutBuscaProdutoMovimento = setTimeout(() => buscarProdutosMovimento(termo), 300);
}

async function buscarProdutosMovimento(termoDigitado) {
  const termo = termoDigitado.trim().toLowerCase();
  if (termo.length < 2) {
    atualizarAutoComplete();
    return;
  }

  const encontrados = produtos.filter(p =>
    (p.nome || "").toLowerCase().includes(termo) ||
    (p.descricao || "").toLowerCase().includes(termo) ||
    getProdutoRotulo(p).toLowerCase().includes(termo)
  );

  try {
    const snapshots = await Promise.all([
      getDocs(query(
        collection(demoRoot(), "produtos"),
        where("nomeLower", ">=", termo),
        where("nomeLower", "<=", termo + "\uf8ff"),
        orderBy("nomeLower"),
        limit(10)
      )),
      getDocs(query(
        collection(demoRoot(), "produtos"),
        where("descricaoLower", ">=", termo),
        where("descricaoLower", "<=", termo + "\uf8ff"),
        orderBy("descricaoLower"),
        limit(10)
      ))
    ]);

    snapshots.forEach(snapshot => {
      snapshot.forEach(d => {
        let produto = produtos.find(p => p._docId === d.id);
        if (!produto) {
          produto = produtoParaMemoria(d.id, d.data());
          produtos.push(produto);
        }
        if (!encontrados.some(p => p._docId === produto._docId)) {
          encontrados.push(produto);
        }
      });
    });
  } catch (e) {
    mostrarErroFirebase(e, "Erro ao buscar produtos");
  }

  renderizarAutoCompleteProdutos(encontrados.slice(0, 12));
}

function atualizarProdutos(filtro = filtroProdutosAtual) {
  filtroProdutosAtual = filtro;
  const tabela = document.getElementById("listaProdutos");
  tabela.innerHTML = "";

  const termo = filtroProdutosAtual.toLowerCase();
  const produtosFiltrados = produtos
    .filter(p =>
      !termo ||
      p.nome.toLowerCase().includes(termo) ||
      (p.descricao || "").toLowerCase().includes(termo) ||
      (p.fornecedor || "").toLowerCase().includes(termo)
    );

  tabela.innerHTML = produtosFiltrados
    .slice(0, limiteProdutosAtual)
    .map(p => `
        <tr>
          <td>${p.nome}</td>
          <td>${p.descricao || ""}</td>
          <td>${p.unidade || ""}</td>
          <td>${p.quantidade}</td>
          <td>${formatarMoedaBR(p.valor)}</td>
          <td>${p.semEstoque ? "Sem estoque" : p.minimo}</td>
          <td>${formatarSimNao(p.recorrente)}</td>
          <td>${p.fornecedor || ""}</td>
          <td>
          <button class="btn-edit" onclick="editarProduto('${p._docId}')">Editar</button>
          </td>
        </tr>
      `)
    .join("");

  const exibidos = Math.min(limiteProdutosAtual, produtosFiltrados.length);
  statusProdutos.innerText = `Mostrando ${exibidos} de ${produtosFiltrados.length}`;
  btnMaisProdutos.style.display =
    exibidos < produtosFiltrados.length ? "inline-block" : "none";
}
window.atualizarProdutos = atualizarProdutos;

/* ENTRADAS */
async function registrarEntrada() {
  const produtoNome = entradaProduto.value.trim();
  const qtd = Number(entradaQtd.value);
  const obs = entradaObs?.value?.trim() || "";
  const devolucao = entradaDevolucao.checked;
  const registrarSaidaAutomatica = entradaRegistrarSaida.checked;
  const qtdSaida = Number(entradaSaidaQtd.value);
  const respSaida = entradaSaidaResp.value.trim();
  const obsSaida = entradaSaidaObs.value.trim();

  if (!produtoNome || qtd <= 0) {
    alert("Preencha corretamente");
    return;
  }

  if (registrarSaidaAutomatica && (qtdSaida <= 0 || !respSaida)) {
    alert("Informe a quantidade e o responsável pela saída automática.");
    return;
  }

  const produto = await resolverProdutoMovimento(entradaProduto);
  if (!produto) {
    alert("Selecione o produto correto na lista de sugestões.");
    return;
  }
  await atualizarProdutoMemoriaDoFirestore(produto);

  if (registrarSaidaAutomatica && qtdSaida > produto.quantidade + qtd) {
    alert("Estoque insuficiente para registrar a saída automática.");
    return;
  }

  const movimento = {
    data: new Date(), produtoId: produto._docId, produtoNome: getProdutoRotulo(produto),
    qtd, tipo: "Entrada", fornecedor: produto.fornecedor, resp: produto.fornecedor,
    obs, valor: devolucao ? 0 : produto.valor, devolucao
  };
  const movimentoSaida = registrarSaidaAutomatica ? {
    data: new Date(), produtoId: produto._docId, produtoNome: getProdutoRotulo(produto),
    qtd: qtdSaida, tipo: "Saída", resp: respSaida, obs: obsSaida, valor: produto.valor,
    recorrente: !!produto.recorrente, semEstoque: !!produto.semEstoque, saidaAutomatica: true
  } : null;

  try {
    const baixoAntes = produtoContaEstoqueBaixo(produto);
    const entradaRef = doc(collection(demoRoot(), "historico"));
    const saidaRef = movimentoSaida ? doc(collection(demoRoot(), "historico")) : null;
    const batch = writeBatch(db);
    batch.update(doc(demoRoot(), "produtos", produto._docId), {
      quantidade: increment(qtd - (movimentoSaida?.qtd || 0))
    });
    batch.set(entradaRef, { ...movimento, data: serverTimestamp() });
    if (movimentoSaida) batch.set(saidaRef, { ...movimentoSaida, data: serverTimestamp() });
    await batch.commit();

    produto.quantidade += qtd - (movimentoSaida?.qtd || 0);
    produtosDashboardCache = [];
    estoqueBaixoCache = [];
    const baixoDepois = produtoContaEstoqueBaixo(produto);
    const deltaBaixo = baixoAntes !== baixoDepois ? (baixoDepois ? 1 : -1) : 0;
    await sincronizarResumosMovimento(movimento, movimentoSaida ? 0 : deltaBaixo);
    if (movimentoSaida) await sincronizarResumosMovimento(movimentoSaida, deltaBaixo);
    historico.push({ id: entradaRef.id, ...movimento });
    if (movimentoSaida) historico.push({ id: saidaRef.id, ...movimentoSaida });
    atualizarProdutos();
    atualizarDashboard();

    entradaProduto.value = "";
    entradaProduto.dataset.produtoId = "";
    entradaQtd.value = "";
    entradaObs.value = "";
    entradaDevolucao.checked = false;
    entradaRegistrarSaida.checked = false;
    entradaCamposSaida.classList.remove("aberto");
    entradaSaidaQtd.value = "";
    entradaSaidaResp.value = "";
    entradaSaidaObs.value = "";
    mostrarPopup(movimentoSaida ? "Entrada e saída registradas ✅" : "Entrada registrada ✅");
  } catch (e) {
    mostrarErroFirebase(e, "Erro ao registrar entrada");
  }
}


/* SAÍDAS */
async function registrarSaida() {
  const produtoNome = saidaProduto.value;
  const qtd = Number(saidaQtd.value);
  const resp = saidaResp.value.trim();
  const obs = saidaObs.value.trim();

  if (!produtoNome || qtd <= 0) {
    alert("Preencha corretamente");
    return;
  }

  if (!resp) {
    alert("Informe o nome da pessoa responsável pela saída.");
    saidaResp.focus();
    return;
  }

  const produto = await resolverProdutoMovimento(saidaProduto);
  if (!produto) {
    alert("Selecione o produto correto na lista de sugestões.");
    return;
  }
  await atualizarProdutoMemoriaDoFirestore(produto);

  const baixoAntes = produtoContaEstoqueBaixo(produto);

  if (produto.quantidade < qtd) {
    alert("Estoque insuficiente");
    return;
  }

  await updateDoc(doc(demoRoot(), "produtos", produto._docId), {
    quantidade: increment(-qtd)
  });

  const movimento = {
    data: new Date(),
    produtoId: produto._docId,
    produtoNome: getProdutoRotulo(produto),
    qtd,
    tipo: "Saída",
    resp,
    obs,
    valor: produto.valor,
    recorrente: !!produto.recorrente,
    semEstoque: !!produto.semEstoque
  };

  const ref = await addDoc(collection(demoRoot(), "historico"), {
    data: serverTimestamp(),
    produtoId: produto._docId,
    produtoNome: getProdutoRotulo(produto),
    qtd,
    tipo: "Saída",
    resp,
    obs,
    valor: produto.valor,
    recorrente: !!produto.recorrente,
    semEstoque: !!produto.semEstoque
  });

  produto.quantidade -= qtd;
  produtosDashboardCache = [];
  estoqueBaixoCache = [];
  const baixoDepois = produtoContaEstoqueBaixo(produto);
  const resumosSincronizados = await sincronizarResumosMovimento(
    movimento,
    baixoAntes !== baixoDepois ? (baixoDepois ? 1 : -1) : 0
  );
  historico.push({ id: ref.id, ...movimento });
  atualizarProdutos();
  atualizarDashboard();

  saidaProduto.value = "";
  saidaProduto.dataset.produtoId = "";
  saidaQtd.value = "";
  saidaResp.value = "";
  saidaObs.value = "";

  if (resumosSincronizados) mostrarPopup("Saída registrada ✅");
}

/* SERVIÇOS */
async function registrarServico() {
  const tipo = servicoTipo.value;
  const categoria = servicoCategoria.value;
  const descricao = servicoDescricao.value.trim();
  const valor = Number(servicoValor.value);

  if (!tipo || !categoria || valor <= 0) {
    alert("Preencha tipo, categoria e valor corretamente");
    return;
  }

  try {
    const novoServico = {
      data: new Date(),
      tipo,
      categoria,
      descricao,
      valor
    };

    const ref = await addDoc(collection(demoRoot(), "servicos"), {
      data: serverTimestamp(),
      tipo,
      categoria,
      descricao,
      valor
    });

    servicos.push({ id: ref.id, ...novoServico });

    servicoTipo.value = "";
    servicoCategoria.value = "";
    servicoDescricao.value = "";
    servicoValor.value = "";

    mostrarPopup("Serviço registrado ✅");
  } catch (e) {
    mostrarErroFirebase(e, "Erro ao registrar serviço");
  }
}

/* DASHBOARD */
async function atualizarDashboard() {

  const periodo = getPeriodoMesSelecionado();
  const chaveMes = getChaveMes(periodo.inicio);
  const resumoEstoque = await garantirResumoEstoque();
  const resumoMes = await garantirResumoMensal(chaveMes, periodo.inicio, periodo.fim);

  document.getElementById("dashTotalProdutos").innerText = Number(resumoEstoque.totalProdutos) || 0;

  document.getElementById("dashEntradas").innerText =
    formatarMoedaBR(resumoMes.totalEntradas);

  document.getElementById("dashSaidas").innerText =
    formatarMoedaBR(resumoMes.totalSaidas);

  document.getElementById("dashBaixo").innerText = Number(resumoEstoque.estoqueBaixo) || 0;
  await atualizarGraficoRankingResponsaveis(periodo);
}

async function atualizarRankingResponsaveis(periodo) {
  if (!dashRankingResponsaveis) return;
  dashRankingResponsaveis.innerHTML = "<p>Carregando...</p>";

  try {
    const q = query(
      collection(demoRoot(), "historico"),
      where("data", ">=", periodo.inicio),
      where("data", "<=", periodo.fim),
      orderBy("data", "desc"),
      limit(120)
    );
    const snapshot = await getDocs(q);
    const ranking = new Map();

    snapshot.forEach(d => {
      const h = d.data();
      const tipo = (h.tipo || "").toLowerCase();
      if (!tipo.startsWith("sa")) return;

      const nome = (h.resp || "").trim() || "Sem responsável";
      const atual = ranking.get(nome) || { nome, qtd: 0, movimentos: 0 };
      atual.qtd += Number(h.qtd) || 0;
      atual.movimentos += 1;
      ranking.set(nome, atual);
    });

    const itens = [...ranking.values()]
      .sort((a, b) => b.qtd - a.qtd || b.movimentos - a.movimentos)
      .slice(0, 5);

    if (itens.length === 0) {
      dashRankingResponsaveis.innerHTML = "<p>Nenhuma saída registrada no mês.</p>";
      return;
    }

    const maior = Math.max(...itens.map(i => i.qtd), 1);
    dashRankingResponsaveis.innerHTML = itens.map((item, indice) => {
      const largura = Math.max(14, Math.round((item.qtd / maior) * 100));
      return `
        <div class="ranking-item">
          <div class="ranking-posicao">${indice + 1}</div>
          <div class="ranking-info">
            <strong>${item.nome}</strong>
            <span>${item.qtd} itens em ${item.movimentos} saída(s)</span>
          </div>
          <div class="ranking-barra">
            <span style="width:${largura}%"><b>${item.qtd}</b></span>
          </div>
        </div>
      `;
    }).join("");
  } catch (e) {
    mostrarErroFirebase(e, "Erro ao carregar ranking");
    dashRankingResponsaveis.innerHTML = "<p>Não foi possível carregar o ranking.</p>";
  }
}

async function atualizarGraficoRankingResponsaveis(periodo) {
  if (!dashRankingResponsaveis) return;
  dashRankingResponsaveis.innerHTML = `<div class="ranking-vazio">Carregando grafico...</div>`;

  try {
    const q = query(
      collection(demoRoot(), "historico"),
      where("data", ">=", periodo.inicio),
      where("data", "<=", periodo.fim),
      orderBy("data", "desc"),
      limit(120)
    );
    const snapshot = await getDocs(q);
    const ranking = new Map();

    snapshot.forEach(d => {
      const h = d.data();
      const tipo = String(h.tipo || "").toLowerCase();
      if (!tipo.startsWith("sa")) return;

      const nome = (h.resp || "").trim() || "Sem responsavel";
      const atual = ranking.get(nome) || { nome, qtd: 0, movimentos: 0 };
      atual.qtd += Number(h.qtd) || 0;
      atual.movimentos += 1;
      ranking.set(nome, atual);
    });

    const itens = [...ranking.values()]
      .sort((a, b) => b.qtd - a.qtd || b.movimentos - a.movimentos)
      .slice(0, 5);

    if (itens.length === 0) {
      dashRankingResponsaveis.innerHTML = `
        <div class="ranking-vazio">Nenhuma saida registrada no mes selecionado.</div>
      `;
      return;
    }

    const maior = Math.max(...itens.map(item => item.qtd), 1);
    dashRankingResponsaveis.innerHTML = itens.map((item, indice) => {
      const largura = Math.max(14, Math.round((item.qtd / maior) * 100));
      return `
        <div class="ranking-item">
          <div class="ranking-posicao">${indice + 1}</div>
          <div class="ranking-conteudo">
            <div class="ranking-info">
              <strong>${item.nome}</strong>
              <span>${item.movimentos} saida(s)</span>
            </div>
            <div class="ranking-barra">
              <span style="width:${largura}%"></span>
            </div>
          </div>
          <strong class="ranking-total">${item.qtd}</strong>
        </div>
      `;
    }).join("");
  } catch (e) {
    mostrarErroFirebase(e, "Erro ao carregar gráfico de ranking");
    dashRankingResponsaveis.innerHTML = `
      <div class="ranking-vazio">Nao foi possivel carregar o ranking.</div>
    `;
  }
}

function getHistoricoOrdenado(ini, fim) {
  return historico
    .map(h => {
      const produto = produtos.find(p => p._docId === h.produtoId);

      return {
        ...h,
        data: h.data,
        produtoNome: h.produtoNome || produto?.nome || "(Produto não informado)"
      };
    })
    .filter(h => h.data >= ini && h.data <= fim)
    .sort((a, b) => a.data.getTime() - b.data.getTime());
}


/* RELATÓRIO */
function selecionarRelatorio(tipo) {
  relatorioAtual = tipo;
  listaRelatorio.innerHTML = "";
  totais.innerText = "";
  statusRelatorio.innerText = "";
  btnMaisRelatorio.style.display = "none";
  filtrosDataRelatorio.style.display = tipo === "produtos-estoque" ? "none" : "block";

  if (tipo === "estoque") {
    relatorioTitulo.innerText = "Relatório de estoque";
    configurarCabecalhoRelatorioPadrao();
  }

  if (tipo === "produtos-estoque") {
    relatorioTitulo.innerText = "Produtos em estoque";
    relatorioCabecalho.innerHTML = `
      <th>Produto</th><th>Quantidade</th><th>Fornecedor</th>
      <th>Valor unitário</th><th>Valor total</th>
    `;
    gerarRelatorioProdutosEstoque();
  }

  if (tipo === "media") {
    relatorioTitulo.innerText = "Relatório de média de duração";
    relatorioCabecalho.innerHTML = `
      <th>Nome</th>
      <th>Descrição</th>
      <th>Unidade</th>
      <th>Estoque atual</th>
      <th>Saídas no período</th>
      <th>Consumo médio mensal</th>
      <th>Duração estimada</th>
    `;
  }

  if (tipo === "servicos") {
    relatorioTitulo.innerText = "Relatório de serviços";
    configurarCabecalhoRelatorioServicos();
  }
}

async function gerarRelatorioAtual() {
  if (relatorioAtual === "produtos-estoque") {
    await gerarRelatorioProdutosEstoque();
    return;
  }

  if (relatorioAtual === "media") {
    await gerarRelatorioMediaDuracao();
    return;
  }

  if (relatorioAtual === "servicos") {
    await gerarRelatorioServicos();
    return;
  }

  await gerarRelatorio();
}

async function gerarRelatorioProdutosEstoque() {
  listaRelatorio.innerHTML = "";
  totais.innerText = "";
  btnMaisRelatorio.style.display = "none";
  const itens = (await buscarTodosProdutosLimitado())
    .filter(produto => Number(produto.quantidade) > 0)
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  let valorTotal = 0;

  itens.forEach(produto => {
    const valorEstoque = Number(produto.quantidade) * Number(produto.valor || 0);
    valorTotal += valorEstoque;
    listaRelatorio.innerHTML += `
      <tr>
        <td>${produto.nome}</td><td>${produto.quantidade}</td>
        <td>${produto.fornecedor || ""}</td><td>${formatarMoedaBR(produto.valor)}</td>
        <td>${formatarMoedaBR(valorEstoque)}</td>
      </tr>`;
  });

  statusRelatorio.innerText = `${itens.length} produto(s) com saldo em estoque`;
  totais.innerText = `Valor total em estoque: ${formatarMoedaBR(valorTotal)}`;
}

async function gerarRelatorio(recarregar = true) {
  listaRelatorio.innerHTML = "";
  totais.innerText = "";
  configurarCabecalhoRelatorioPadrao();

  if (!dataInicio.value || !dataFim.value) {
    mostrarPopup("Selecione o período");
    return;
  }

  const ini = new Date(dataInicio.value + "T00:00:00");
  const fim = new Date(dataFim.value + "T23:59:59");
  if (recarregar) {
    await carregarHistoricoFirestore(ini, fim, { forcar: true, pageSize: TAMANHO_BUSCA_FIRESTORE });
  }

  let totalE = 0;
  let totalS = 0;

  historico
    .filter(h => h.data && h.data >= ini && h.data <= fim)
    .forEach(h => {
      const total = Number(h.qtd) * Number(h.valor);

      listaRelatorio.innerHTML += `
        <tr>
          <td>${h.data.toLocaleDateString()}</td>
          <td>${h.produtoNome}</td>
          <td>${h.qtd}</td>
          <td>${h.tipo}</td>
          <td>${h.tipo === "Entrada" ? h.fornecedor || "" : h.resp || ""}</td>
          <td>R$ ${Number(h.valor).toFixed(2)}</td>
          <td>R$ ${total.toFixed(2)}</td>
        </tr>
      `;

      if (h.obs && h.obs.trim() !== "") {
        listaRelatorio.innerHTML += `
          <tr class="linha-obs">
            <td colspan="7"><strong>Obs:</strong> ${h.obs}</td>
          </tr>
        `;
      }

      if (h.tipo === "Entrada") totalE += total;
      else totalS += total;
    });

  totais.innerText =
    `Entradas: R$ ${totalE.toFixed(2)} | Saídas: R$ ${totalS.toFixed(2)}`;
  statusRelatorio.innerText = `Mostrando ${historico.length} registros`;
  btnMaisRelatorio.style.display = podeBuscarMaisHistorico ? "inline-block" : "none";
}

async function gerarRelatorioMediaDuracao() {
  listaRelatorio.innerHTML = "";
  totais.innerText = "";

  if (!dataInicio.value || !dataFim.value) {
    mostrarPopup("Selecione o período");
    return;
  }

  const ini = new Date(dataInicio.value + "T00:00:00");
  const fim = new Date(dataFim.value + "T23:59:59");
  const produtosRelatorio = await buscarTodosProdutosLimitado();
  const historicoRelatorio = await buscarHistoricoPeriodoCompleto(ini, fim);
  const diasPeriodo = Math.max(1, Math.ceil((fim - ini) / (1000 * 60 * 60 * 24)));
  const mesesPeriodo = Math.max(1 / 30, diasPeriodo / 30);

  relatorioCabecalho.innerHTML = `
    <th>Nome</th>
    <th>Descrição</th>
    <th>Unidade</th>
    <th>Estoque atual</th>
    <th>Saídas no período</th>
    <th>Consumo médio mensal</th>
    <th>Duração estimada</th>
  `;

  produtosRelatorio
    .slice()
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .forEach(produto => {
      const saidasPeriodo = historicoRelatorio
        .filter(h =>
          h.data &&
          h.data >= ini &&
          h.data <= fim &&
          h.tipo === "Saída" &&
          (h.produtoId === produto._docId || h.produtoNome === produto.nome)
        )
        .reduce((total, h) => total + Number(h.qtd || 0), 0);

      if (saidasPeriodo <= 0) return;

      const mediaMensal = saidasPeriodo / mesesPeriodo;
      const consumoDiarioEstimado = mediaMensal / 30;
      const duracaoDias = consumoDiarioEstimado > 0 ? produto.quantidade / consumoDiarioEstimado : null;
      const duracaoTexto = duracaoDias === null ? "Sem saídas no período" : formatarDuracaoEstimada(duracaoDias);

      listaRelatorio.innerHTML += `
        <tr>
          <td>${produto.nome}</td>
          <td>${produto.descricao || ""}</td>
          <td>${produto.unidade || ""}</td>
          <td>${produto.quantidade}</td>
          <td>${saidasPeriodo}</td>
          <td>${formatarQuantidadeMedia(mediaMensal)}</td>
          <td>${duracaoTexto}</td>
        </tr>
      `;
    });

  totais.innerText = `Período analisado: ${diasPeriodo} dias`;
  statusRelatorio.innerText = "";
  btnMaisRelatorio.style.display = "none";
}

async function gerarRelatorioServicos(recarregar = true) {
  listaRelatorio.innerHTML = "";
  totais.innerText = "";
  configurarCabecalhoRelatorioServicos();

  if (!dataInicio.value || !dataFim.value) {
    mostrarPopup("Selecione o período");
    return;
  }

  const ini = new Date(dataInicio.value + "T00:00:00");
  const fim = new Date(dataFim.value + "T23:59:59");
  if (recarregar) {
    await carregarServicosFirestore(ini, fim, { forcar: true, pageSize: TAMANHO_BUSCA_FIRESTORE });
  }
  let total = 0;

  servicos
    .filter(s => s.data && s.data >= ini && s.data <= fim)
    .forEach(s => {
      total += Number(s.valor) || 0;
      listaRelatorio.innerHTML += `
        <tr>
          <td>${s.data.toLocaleDateString()}</td>
          <td>${s.tipo}</td>
          <td>${s.categoria}</td>
          <td>R$ ${Number(s.valor).toFixed(2)}</td>
        </tr>
      `;

      if (s.descricao && s.descricao.trim() !== "") {
        listaRelatorio.innerHTML += `
          <tr class="linha-obs">
            <td colspan="4"><strong>Descrição:</strong> ${s.descricao}</td>
          </tr>
        `;
      }
    });

  totais.innerText = `Total de serviços: R$ ${total.toFixed(2)}`;
  statusRelatorio.innerText = `Mostrando ${servicos.length} registros`;
  btnMaisRelatorio.style.display = podeBuscarMaisServicos ? "inline-block" : "none";
}

async function mostrarMaisRelatorio() {
  if (relatorioAtual === "estoque" && periodoHistoricoAtual) {
    await carregarHistoricoFirestore(periodoHistoricoAtual.ini, periodoHistoricoAtual.fim, {
      append: true,
      pageSize: TAMANHO_BUSCA_FIRESTORE
    });
    await gerarRelatorio(false);
  }

  if (relatorioAtual === "servicos" && periodoServicoAtual) {
    await carregarServicosFirestore(periodoServicoAtual.ini, periodoServicoAtual.fim, {
      append: true,
      pageSize: TAMANHO_BUSCA_FIRESTORE
    });
    await gerarRelatorioServicos(false);
  }
}

async function exportarRelatorioAtual() {
  if (relatorioAtual === "produtos-estoque") {
    await exportarProdutosEstoque();
    return;
  }

  if (relatorioAtual === "media") {
    await exportarRelatorioMediaDuracao();
    return;
  }

  if (relatorioAtual === "servicos") {
    await exportarRelatorioServicos();
    return;
  }

  await exportarExcel();
}

function campoCsv(valor) {
  const texto = String(valor ?? "");
  return `"${texto.replace(/"/g, '""')}"`;
}

async function exportarProdutosEstoque() {
  const itens = (await buscarTodosProdutosLimitado())
    .filter(produto => Number(produto.quantidade) > 0)
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  let csv = "Produto;Quantidade;Fornecedor;Valor unitário;Valor total\n";
  itens.forEach(produto => {
    const valor = Number(produto.valor || 0);
    csv += [produto.nome, produto.quantidade, produto.fornecedor || "",
      valor.toFixed(2).replace(".", ","), (valor * Number(produto.quantidade)).toFixed(2).replace(".", ",")]
      .map(campoCsv).join(";") + "\n";
  });
  baixarCsv("produtos_em_estoque.csv", `\ufeff${csv}`);
}

async function exportarRelatorioMediaDuracao() {
  if (!dataInicio.value || !dataFim.value) {
    mostrarPopup("Selecione o período antes de exportar 📅");
    return;
  }

  const ini = new Date(dataInicio.value + "T00:00:00");
  const fim = new Date(dataFim.value + "T23:59:59");
  const produtosRelatorio = await buscarTodosProdutosLimitado();
  const historicoRelatorio = await buscarHistoricoPeriodoCompleto(ini, fim);
  const diasPeriodo = Math.max(1, Math.ceil((fim - ini) / (1000 * 60 * 60 * 24)));
  const mesesPeriodo = Math.max(1 / 30, diasPeriodo / 30);
  let csv = "Nome;Descrição;Unidade;Estoque atual;Saídas no período;Consumo médio mensal;Duração estimada\n";

  produtosRelatorio
    .slice()
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .forEach(produto => {
      const saidasPeriodo = historicoRelatorio
        .filter(h =>
          h.data &&
          h.data >= ini &&
          h.data <= fim &&
          h.tipo === "Saída" &&
          (h.produtoId === produto._docId || h.produtoNome === produto.nome)
        )
        .reduce((total, h) => total + Number(h.qtd || 0), 0);

      if (saidasPeriodo <= 0) return;

      const mediaMensal = saidasPeriodo / mesesPeriodo;
      const consumoDiarioEstimado = mediaMensal / 30;
      const duracaoDias = consumoDiarioEstimado > 0 ? produto.quantidade / consumoDiarioEstimado : null;
      const duracaoTexto = duracaoDias === null ? "Sem saídas no período" : formatarDuracaoEstimada(duracaoDias);

      csv += `${produto.nome};${produto.descricao || ""};${produto.unidade || ""};${produto.quantidade};${saidasPeriodo};${formatarQuantidadeMedia(mediaMensal)};${duracaoTexto}\n`;
    });

  baixarCsv("relatorio_media_duracao.csv", csv);
}

async function exportarRelatorioServicos() {
  if (!dataInicio.value || !dataFim.value) {
    mostrarPopup("Selecione o período antes de exportar 📅");
    return;
  }

  const ini = new Date(dataInicio.value + "T00:00:00");
  const fim = new Date(dataFim.value + "T23:59:59");
  const servicosExportacao = await buscarServicosPeriodoCompleto(ini, fim);
  let csv = "Data;Tipo;Categoria;Descrição;Valor\n";

  servicosExportacao
    .forEach(s => {
      const descricao = (s.descricao || "").replace(/;/g, ",");
      csv += `${s.data.toLocaleDateString()};${s.tipo};${s.categoria};${descricao};${Number(s.valor).toFixed(2).replace(".", ",")}\n`;
    });

  baixarCsv("relatorio_servicos.csv", csv);
}

async function exportarExcel() {
  if (!dataInicio.value || !dataFim.value) {
    mostrarPopup("Selecione o período antes de exportar 📅");
    return;
  }

  const ini = new Date(dataInicio.value + "T00:00:00");
  const fim = new Date(dataFim.value + "T23:59:59");
  const historicoExportacao = await buscarHistoricoPeriodoCompleto(ini, fim);

  let csv =
  "Data;Produto;Quantidade;Tipo;Responsável;Observação;Valor Unitário;Valor Total\n";


  historicoExportacao
  .forEach(h => {
    const produto = produtos.find(p => p._docId === h.produtoId);
    const nomeProduto = h.produtoNome || produto?.nome || "(Produto não informado)";
    const valorUnitario = Number(h.valor) || 0;
    const total = Number(h.qtd) * valorUnitario;

    const responsavel =
      h.tipo === "Entrada"
        ? (h.fornecedor || "")
        : (h.resp || "");

    const obs = (h.obs || "").replace(/;/g, ",");
    csv += `${h.data.toLocaleDateString()};${nomeProduto};${h.qtd};${h.tipo};${responsavel};${obs};${valorUnitario.toFixed(2).replace('.', ',')};${total.toFixed(2).replace('.', ',')}\n`;


  });


  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "relatorio.csv";
  a.click();
}


/* ESTOQUE BAIXO */
async function abrirEstoqueBaixo() {
  listaEstoqueBaixo.innerHTML = `
    <tr>
      <td colspan="6">Carregando produtos com estoque baixo...</td>
    </tr>
  `;
  modalEstoqueBaixo.style.display = "flex";

  let itens = [];
  try {
    const produtosAtualizados = await buscarTodosProdutosLimitado();
    estoqueBaixoCache = produtosAtualizados.filter(produtoContaEstoqueBaixo);
    itens = estoqueBaixoCache;
  } catch (e) {
    mostrarErroFirebase(e, "Erro ao carregar estoque baixo");
    listaEstoqueBaixo.innerHTML = `
      <tr>
        <td colspan="6">Não foi possível carregar o estoque baixo.</td>
      </tr>
    `;
    return;
  }

  if (itens.length === 0) {
    listaEstoqueBaixo.innerHTML = `
      <tr>
        <td colspan="6">Nenhum produto com estoque baixo.</td>
      </tr>
    `;
  }

  itens.forEach(p => {
    listaEstoqueBaixo.innerHTML += `
      <tr>
        <td>${p.nome}</td>
        <td>${p.descricao || ""}</td>
        <td>${p.unidade || ""}</td>
        <td>${p.quantidade}</td>
        <td>${p.minimo}</td>
        <td>${p.fornecedor || ""}</td>
      </tr>
    `;
  });

}

function fecharEstoqueBaixo() {
  modalEstoqueBaixo.style.display = "none";
}

async function exportarEstoqueBaixo() {
  if (estoqueBaixoCache.length === 0) {
    try {
      const produtosAtualizados = await buscarTodosProdutosLimitado();
      estoqueBaixoCache = produtosAtualizados.filter(produtoContaEstoqueBaixo);
    } catch (e) {
      mostrarErroFirebase(e, "Erro ao exportar estoque baixo");
      return;
    }
  }

  let csv = "Nome;Descrição;Unidade;Qtd;Min;Fornecedor\n";
  estoqueBaixoCache
    .forEach(p => csv += `${p.nome};${p.descricao || ""};${p.unidade || ""};${p.quantidade};${p.minimo};${p.fornecedor || ""}\n`);

  baixarCsv("estoque_baixo.csv", csv);
}

async function abrirProdutosDashboard() {
  listaProdutosDashboard.innerHTML = `
    <tr>
      <td colspan="6">Carregando produtos...</td>
    </tr>
  `;
  modalProdutosDashboard.style.display = "flex";

  try {
    produtosDashboardCache = await buscarTodosProdutosLimitado();
    if (produtosDashboardCache.length === 0) {
      listaProdutosDashboard.innerHTML = `
        <tr>
          <td colspan="6">Nenhum produto cadastrado.</td>
        </tr>
      `;
      return;
    }

    listaProdutosDashboard.innerHTML = produtosDashboardCache.map(p => `
      <tr>
        <td>${p.nome}</td>
        <td>${p.descricao || ""}</td>
        <td>${p.unidade || ""}</td>
        <td>${p.quantidade}</td>
        <td>${formatarMoedaBR(p.valor)}</td>
        <td>${p.fornecedor || ""}</td>
      </tr>
    `).join("");
  } catch (e) {
    mostrarErroFirebase(e, "Erro ao carregar produtos do dashboard");
    listaProdutosDashboard.innerHTML = `
      <tr>
        <td colspan="6">Não foi possível carregar os produtos.</td>
      </tr>
    `;
  }
}

function fecharProdutosDashboard() {
  modalProdutosDashboard.style.display = "none";
}

async function exportarProdutosDashboard() {
  if (produtosDashboardCache.length === 0) {
    produtosDashboardCache = await buscarTodosProdutosLimitado();
  }

  let csv = "Nome;Descrição;Unidade;Quantidade;Valor;Fornecedor\n";
  produtosDashboardCache.forEach(p => {
    csv += `${p.nome};${p.descricao || ""};${p.unidade || ""};${p.quantidade};${formatarMoedaBR(p.valor)};${p.fornecedor || ""}\n`;
  });

  baixarCsv("produtos_cadastrados.csv", csv);
}

async function carregarProdutosFirestore(forcar = false) {
  if (produtosCarregados && !forcar && !podeBuscarMaisProdutos) return;
  if (forcar) {
    produtos = [];
    ultimoProdutoDoc = null;
    podeBuscarMaisProdutos = true;
    produtosCarregados = false;
  }

  const termo = filtroProdutosAtual.trim();
  const snapshots = [];

  if (termo) {
    const termoLower = termo.toLowerCase();
    snapshots.push(await getDocs(query(
      collection(demoRoot(), "produtos"),
      where("nomeLower", ">=", termoLower),
      where("nomeLower", "<=", termoLower + "\uf8ff"),
      orderBy("nomeLower"),
      limit(TAMANHO_BUSCA_FIRESTORE)
    )));
    snapshots.push(await getDocs(query(
      collection(demoRoot(), "produtos"),
      where("descricaoLower", ">=", termoLower),
      where("descricaoLower", "<=", termoLower + "\uf8ff"),
      orderBy("descricaoLower"),
      limit(TAMANHO_BUSCA_FIRESTORE)
    )));
    podeBuscarMaisProdutos = false;
  } else {
    snapshots.push(await getDocs(query(
      collection(demoRoot(), "produtos"),
      orderBy("nome"),
      ...(ultimoProdutoDoc ? [startAfter(ultimoProdutoDoc)] : []),
      limit(TAMANHO_BUSCA_FIRESTORE)
    )));
  }

  const totalEncontrado = snapshots.reduce((total, snap) => total + snap.size, 0);
  if (totalEncontrado === 0) {
    podeBuscarMaisProdutos = false;
    atualizarProdutos();
    atualizarAutoComplete();
    return;
  }

  snapshots.forEach(snapshot => {
    snapshot.forEach(d => {
      const produto = produtoParaMemoria(d.id, d.data());
      if (!produtos.some(p => p._docId === produto._docId)) produtos.push(produto);
    });
  });

  const ultimoSnapshot = snapshots[snapshots.length - 1];
  if (!termo && ultimoSnapshot.docs.length > 0) {
    ultimoProdutoDoc = ultimoSnapshot.docs[ultimoSnapshot.docs.length - 1];
    podeBuscarMaisProdutos = ultimoSnapshot.size === TAMANHO_BUSCA_FIRESTORE;
  }
  atualizarProdutos();
  atualizarAutoComplete();
  produtosCarregados = true;
}

async function carregarFornecedoresFirestore(forcar = false) {
  if (fornecedoresCarregados && !forcar && !podeBuscarMaisFornecedores) return;
  try {
    if (forcar) {
      fornecedores = [];
      ultimoFornecedorDoc = null;
      podeBuscarMaisFornecedores = true;
      fornecedoresCarregados = false;
    }

    const termo = filtroFornecedoresAtual.trim().toLowerCase();
    const q = termo
      ? query(
          collection(demoRoot(), "fornecedores"),
          where("nomeLower", ">=", termo),
          where("nomeLower", "<=", termo + "\uf8ff"),
          orderBy("nomeLower"),
          ...(ultimoFornecedorDoc ? [startAfter(ultimoFornecedorDoc)] : []),
          limit(TAMANHO_BUSCA_FIRESTORE)
        )
      : query(
          collection(demoRoot(), "fornecedores"),
          orderBy("nome"),
          ...(ultimoFornecedorDoc ? [startAfter(ultimoFornecedorDoc)] : []),
          limit(TAMANHO_BUSCA_FIRESTORE)
        );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      podeBuscarMaisFornecedores = false;
      atualizarFornecedores();
      return;
    }

    snapshot.forEach(d => {
      const fornecedor = { _docId: d.id, ...d.data() };
      if (!fornecedores.some(f => f._docId === fornecedor._docId)) fornecedores.push(fornecedor);
});

    ultimoFornecedorDoc = snapshot.docs[snapshot.docs.length - 1];
    podeBuscarMaisFornecedores = snapshot.size === TAMANHO_BUSCA_FIRESTORE;
    atualizarFornecedores();
    fornecedoresCarregados = true;
  } catch (e) {
    mostrarErroFirebase(e, "Erro ao carregar fornecedores");
  }
}
async function carregarHistoricoFirestore(ini = null, fim = null, opcoes = {}) {
  const { forcar = false, append = false, pageSize = TAMANHO_BUSCA_FIRESTORE } =
    typeof opcoes === "boolean" ? { forcar: opcoes } : opcoes;
  const chave = ini && fim
    ? `${ini.toISOString()}|${fim.toISOString()}`
    : "recentes";
  if (historicoPeriodoChave === chave && !forcar && !append) return;

  if (forcar || historicoPeriodoChave !== chave) {
    historico = [];
    ultimoHistoricoDoc = null;
    podeBuscarMaisHistorico = true;
    historicoPeriodoChave = chave;
    periodoHistoricoAtual = { ini, fim };
  }

  const q = ini && fim
    ? query(
        collection(demoRoot(), "historico"),
        where("data", ">=", ini),
        where("data", "<=", fim),
        orderBy("data", "desc"),
        ...(ultimoHistoricoDoc ? [startAfter(ultimoHistoricoDoc)] : []),
        limit(pageSize)
      )
    : query(
        collection(demoRoot(), "historico"),
        orderBy("data", "desc"),
        ...(ultimoHistoricoDoc ? [startAfter(ultimoHistoricoDoc)] : []),
        limit(pageSize)
      );

  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    podeBuscarMaisHistorico = false;
    return;
  }

  snapshot.forEach(d => {
    const h = d.data();
    if (!h.data) return;

    historico.push({
      id: d.id,
      data: h.data.toDate(),
      produtoId: h.produtoId || "",
      produtoNome: h.produtoNome || "",
      qtd: Number(h.qtd) || 0,
      tipo: h.tipo || "",
      resp: h.resp || "",          // ✅ FORÇADO AQUI
      fornecedor: h.fornecedor || "",
      valor: Number(h.valor) || 0,
      obs: h.obs || "",
    });
  });

  ultimoHistoricoDoc = snapshot.docs[snapshot.docs.length - 1];
  podeBuscarMaisHistorico = snapshot.size === pageSize;
  historico.sort((a, b) => b.data - a.data);
}

async function carregarServicosFirestore(ini = null, fim = null, opcoes = {}) {
  const { forcar = false, append = false, pageSize = TAMANHO_BUSCA_FIRESTORE } =
    typeof opcoes === "boolean" ? { forcar: opcoes } : opcoes;
  const chave = ini && fim
    ? `${ini.toISOString()}|${fim.toISOString()}`
    : "recentes";
  if (servicosPeriodoChave === chave && !forcar && !append) return;

  if (forcar || servicosPeriodoChave !== chave) {
    servicos = [];
    ultimoServicoDoc = null;
    podeBuscarMaisServicos = true;
    servicosPeriodoChave = chave;
    periodoServicoAtual = { ini, fim };
  }

  const q = ini && fim
    ? query(
        collection(demoRoot(), "servicos"),
        where("data", ">=", ini),
        where("data", "<=", fim),
        orderBy("data", "desc"),
        ...(ultimoServicoDoc ? [startAfter(ultimoServicoDoc)] : []),
        limit(pageSize)
      )
    : query(
        collection(demoRoot(), "servicos"),
        orderBy("data", "desc"),
        ...(ultimoServicoDoc ? [startAfter(ultimoServicoDoc)] : []),
        limit(pageSize)
      );

  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    podeBuscarMaisServicos = false;
    return;
  }

  snapshot.forEach(d => {
    const s = d.data();
    if (!s.data) return;

    servicos.push({
      id: d.id,
      data: s.data.toDate(),
      tipo: s.tipo || "",
      categoria: s.categoria || "",
      descricao: s.descricao || "",
      valor: Number(s.valor) || 0
    });
  });
  ultimoServicoDoc = snapshot.docs[snapshot.docs.length - 1];
  podeBuscarMaisServicos = snapshot.size === pageSize;
  servicos.sort((a, b) => b.data - a.data);
}

async function buscarHistoricoPeriodoCompleto(ini, fim) {
  const registros = [];
  let ultimoDoc = null;

  while (true) {
    const q = query(
      collection(demoRoot(), "historico"),
      where("data", ">=", ini),
      where("data", "<=", fim),
      orderBy("data", "asc"),
      ...(ultimoDoc ? [startAfter(ultimoDoc)] : []),
      limit(TAMANHO_LOTE_RESUMO)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) break;

    snapshot.forEach(d => {
      const h = d.data();
      if (!h.data) return;
      registros.push({
        id: d.id,
        data: h.data.toDate(),
        produtoId: h.produtoId || "",
        produtoNome: h.produtoNome || "",
        qtd: Number(h.qtd) || 0,
        tipo: h.tipo || "",
        resp: h.resp || "",
        fornecedor: h.fornecedor || "",
        valor: Number(h.valor) || 0,
        obs: h.obs || "",
      });
    });

    ultimoDoc = snapshot.docs[snapshot.docs.length - 1];
    if (snapshot.size < TAMANHO_LOTE_RESUMO) break;
  }

  return registros;
}

async function buscarServicosPeriodoCompleto(ini, fim) {
  const registros = [];
  let ultimoDoc = null;

  while (true) {
    const q = query(
      collection(demoRoot(), "servicos"),
      where("data", ">=", ini),
      where("data", "<=", fim),
      orderBy("data", "asc"),
      ...(ultimoDoc ? [startAfter(ultimoDoc)] : []),
      limit(TAMANHO_LOTE_RESUMO)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) break;

    snapshot.forEach(d => {
      const s = d.data();
      if (!s.data) return;
      registros.push({
        id: d.id,
        data: s.data.toDate(),
        tipo: s.tipo || "",
        categoria: s.categoria || "",
        descricao: s.descricao || "",
        valor: Number(s.valor) || 0
      });
    });

    ultimoDoc = snapshot.docs[snapshot.docs.length - 1];
    if (snapshot.size < TAMANHO_LOTE_RESUMO) break;
  }

  return registros;
}

async function buscarTodosProdutosLimitado() {
  const registros = [];
  let ultimoDoc = null;

  while (true) {
    const q = query(
      collection(demoRoot(), "produtos"),
      orderBy("nome"),
      ...(ultimoDoc ? [startAfter(ultimoDoc)] : []),
      limit(TAMANHO_LOTE_RESUMO)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) break;

    snapshot.forEach(d => registros.push(produtoParaMemoria(d.id, d.data())));
    ultimoDoc = snapshot.docs[snapshot.docs.length - 1];
    if (snapshot.size < TAMANHO_LOTE_RESUMO) break;
  }

  return registros;
}


// 🔓 Expor funções para o HTML (OBRIGATÓRIO em type="module")
// window.editarFornecedor = editarFornecedor;
// window.editarProduto = editarProduto;
// window.baixarEstoqueBaixo = baixarEstoqueBaixo;
window.abrirEstoqueBaixo = abrirEstoqueBaixo;
window.fecharEstoqueBaixo = fecharEstoqueBaixo;
window.exportarEstoqueBaixo = exportarEstoqueBaixo;
window.abrirProdutosDashboard = abrirProdutosDashboard;
window.fecharProdutosDashboard = fecharProdutosDashboard;
window.exportarProdutosDashboard = exportarProdutosDashboard;


onAuthStateChanged(auth, user => {
  if (user) {
    usuarioLogado = user;
    document.getElementById("loginTela").style.display = "flex";
    document.getElementById("sistema").style.display = "none";
  } else {
    usuarioLogado = null;
    document.getElementById("loginTela").style.display = "flex";
    document.getElementById("sistema").style.display = "none";
  }
});

function logout() {
  signOut(auth);
}

window.login = login;
window.mostrarTela = mostrarTela;
window.alternarMenuRelatorios = alternarMenuRelatorios;
window.abrirRelatorio = abrirRelatorio;

window.cadastrarFornecedor = cadastrarFornecedor;
window.editarFornecedor = editarFornecedor;
window.filtrarFornecedores = filtrarFornecedores;
window.mostrarMaisFornecedores = mostrarMaisFornecedores;
// window.editarFornecedor = editarFornecedor;

window.cadastrarProduto = cadastrarProduto;
// window.editarProduto = editarProduto;
window.filtrarProdutos = filtrarProdutos;
window.mostrarMaisProdutos = mostrarMaisProdutos;

window.registrarEntrada = registrarEntrada;
window.registrarSaida = registrarSaida;
window.registrarServico = registrarServico;

window.gerarRelatorio = gerarRelatorio;
window.gerarRelatorioMediaDuracao = gerarRelatorioMediaDuracao;
window.gerarRelatorioServicos = gerarRelatorioServicos;
window.selecionarRelatorio = selecionarRelatorio;
window.gerarRelatorioAtual = gerarRelatorioAtual;
window.mostrarMaisRelatorio = mostrarMaisRelatorio;
window.exportarRelatorioAtual = exportarRelatorioAtual;
window.exportarExcel = exportarExcel;
window.editarProduto = editarProduto;
window.atualizarDashboard = atualizarDashboard;
window.reconstruirResumoEstoqueManutencao = reconstruirResumoEstoqueManutencao;
window.reconstruirResumoMensalManutencao = reconstruirResumoMensalManutencao;
window.diagnosticarResumos = diagnosticarResumos;
window.migrarProdutosDescricao = migrarProdutosDescricao;
globalThis.migrarProdutosDescricao = migrarProdutosDescricao;


