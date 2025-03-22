// Elementos HTML
const elementoPergunta = document.getElementById("pergunta");
const elementoAlternativas = document.getElementById("alternativas");
const elementoResultado = document.getElementById("resultado");
const botaoProxima = document.getElementById("proximaPergunta");
const elementoScore = document.getElementById("score-op");

let score = 0; // Variável para armazenar a pontuação

function gerarPergunta() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operacoes = ['+', '-', '×', '÷']; // Operações matemáticas
    const operacao = operacoes[Math.floor(Math.random() * operacoes.length)];
    let resposta;

    switch (operacao) {
        case '+': resposta = num1 + num2; break;
        case '-': resposta = num1 - num2; break;
        case '×': resposta = num1 * num2; break;
        case '÷': resposta = (num1 / num2).toFixed(2); break; // Arredonda para 2 casas decimais
    }

    return {
        pergunta: `Quanto é ${num1} ${operacao} ${num2}?`,
        resposta: resposta.toString()
    };
}

function gerarAlternativas(respostaCorreta) {
    const alternativas = [respostaCorreta]; // Inclui a resposta correta

    // Gera 2 alternativas incorretas
    while (alternativas.length < 3) {
        const alternativa = (Math.random() * 20).toFixed(2); // Números aleatórios entre 0 e 20
        if (!alternativas.includes(alternativa)) {
            alternativas.push(alternativa);
        }
    }

    // Embaralha as alternativas
    return alternativas.sort(() => Math.random() - 0.5);
}

function carregarPerguntaOperacoes() {
    const perguntaGerada = gerarPergunta(); // Gera uma nova pergunta
    elementoPergunta.textContent = perguntaGerada.pergunta;
    elementoAlternativas.innerHTML = "";

    // Gera alternativas aleatórias
    const alternativas = gerarAlternativas(perguntaGerada.resposta);
    alternativas.forEach(alt => {
        const botao = document.createElement("button");
        botao.textContent = alt;
        botao.addEventListener("click", () => verificarResposta(alt, perguntaGerada.resposta));
        elementoAlternativas.appendChild(botao);
    });

    elementoResultado.textContent = "";
}

function verificarResposta(respostaSelecionada, respostaCorreta) {
    if (respostaSelecionada === respostaCorreta) {
        elementoResultado.textContent = "Parabéns! Você ganhou +100 pontos 🎉";
        elementoResultado.style.color = "blue";
        score += 100; // Atualiza a pontuação
        elementoScore.textContent = score; // Atualiza o valor na tela
        elementoScore.style.color = "green";
    } else {
        elementoResultado.textContent = "Tente novamente. 😢";
        elementoResultado.style.color = "red";
        score -= 10; // Atualiza a pontuação
        elementoScore.textContent = score; // Atualiza o valor na tela
        elementoScore.style.color = "red";
    }

    // Aguarda 2 segundos antes de carregar a próxima pergunta
    setTimeout(carregarPerguntaOperacoes, 2000);
}

// Carrega a primeira pergunta ao iniciar
carregarPerguntaOperacoes();