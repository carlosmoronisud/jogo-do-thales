const formaImagem = document.getElementById("forma-imagem");
const perguntaArea = document.getElementById("pergunta-area");
const alternativasArea = document.getElementById("alternativas-area");
const resultadoArea = document.getElementById("resultado-area");

const formas = [
    { nome: "quadrado", imagem: "quadrado.png", formula: (lado) => lado * lado },
    { nome: "retangulo", imagem: "retangulo.png", formula: (base, altura) => base * altura },
    { nome: "triangulo", imagem: "triangulo.png", formula: (base, altura) => (base * altura) / 2 },
    { nome: "circulo", imagem: "circulo.png", formula: (raio) => Math.PI * raio * raio }
];

let formaAtual;
let respostaCorreta;

function carregarProximaForma() {
    formaAtual = formas[Math.floor(Math.random() * formas.length)];
    formaImagem.src = formaAtual.imagem;

    let pergunta;
    let valores;

    switch (formaAtual.nome) {
        case "quadrado":
            const ladoQuadrado = Math.floor(Math.random() * 10) + 1;
            pergunta = `Qual é a área de um quadrado com lado ${ladoQuadrado}?`;
            respostaCorreta = formaAtual.formula(ladoQuadrado);
            break;
        case "retangulo":
            const baseRetangulo = Math.floor(Math.random() * 10) + 1;
            const alturaRetangulo = Math.floor(Math.random() * 10) + 1;
            pergunta = `Qual é a área de um retângulo com base ${baseRetangulo} e altura ${alturaRetangulo}?`;
            respostaCorreta = formaAtual.formula(baseRetangulo, alturaRetangulo);
            break;
        case "triangulo":
            const baseTriangulo = Math.floor(Math.random() * 10) + 1;
            const alturaTriangulo = Math.floor(Math.random() * 10) + 1;
            pergunta = `Qual é a área de um triângulo com base ${baseTriangulo} e altura ${alturaTriangulo}?`;
            respostaCorreta = formaAtual.formula(baseTriangulo, alturaTriangulo);
            break;
        case "circulo":
            const raioCirculo = Math.floor(Math.random() * 10) + 1;
            pergunta = `Qual é a área de um círculo com raio ${raioCirculo}? (Use π = 3.14)`;
            respostaCorreta = formaAtual.formula(raioCirculo).toFixed(2);
            break;
    }

    perguntaArea.textContent = pergunta;
    alternativasArea.innerHTML = ""; // Limpa as alternativas anteriores

    // Gera alternativas aleatórias
    const alternativas = gerarAlternativas(respostaCorreta);
    alternativas.forEach(alt => {
        const botao = document.createElement("button");
        botao.textContent = alt;
        botao.addEventListener("click", () => verificarRespostaArea(alt, respostaCorreta));
        alternativasArea.appendChild(botao);
    });

    resultadoArea.textContent = "";
}

function gerarAlternativas(respostaCorreta) {
    const alternativas = [respostaCorreta]; // Inclui a resposta correta

    // Gera 3 alternativas incorretas
    while (alternativas.length < 4) {
        const alternativa = (Math.random() * 100).toFixed(2); // Números aleatórios entre 0 e 100
        if (!alternativas.includes(alternativa)) {
            alternativas.push(alternativa);
        }
    }

    // Embaralha as alternativas
    return alternativas.sort(() => Math.random() - 0.5);
}

function verificarRespostaArea(respostaSelecionada, respostaCorreta) {
    // Converte ambas as respostas para números e compara
    if (parseFloat(respostaSelecionada) === parseFloat(respostaCorreta)) {
        resultadoArea.textContent = "Correto! 🎉";
        resultadoArea.style.color = "green";
    } else {
        resultadoArea.textContent = `Errado! A resposta correta é ${respostaCorreta}. 😢`;
        resultadoArea.style.color = "red";
    }

    // Delay de 2 segundos antes de carregar a próxima forma
    setTimeout(() => {
        carregarProximaForma();
    }, 2000);
}

// Carrega a primeira forma ao iniciar
carregarProximaForma();