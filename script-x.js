// script-x.js - Versão simplificada (apenas equações do primeiro grau)
document.addEventListener('DOMContentLoaded', function() {
    
    const perguntaX = document.getElementById('pergunta-x');
    const alternativasX = document.getElementById('alternativas-x');
    const resultadoX = document.getElementById('resultado-x');
    const scoreXElement = document.getElementById('score-x');
    
    let scoreX = 0;
    let respostaCorreta;
    
    // Tipos de equações do primeiro grau
    const tiposEquacoes = [
        { formato: "ax + b = c", desc: "Resolva a equação:" },
        { formato: "ax = c - b", desc: "Resolva para x:" },
        { formato: "ax + b - c = 0", desc: "Encontre o valor de x:" },
        { formato: "c = ax + b", desc: "Qual o valor de x?" }
    ];

    // Gerar uma equação do primeiro grau (ax + b = c)
    function gerarEquacao() {
        const tipo = tiposEquacoes[Math.floor(Math.random() * tiposEquacoes.length)];
        const a = Math.floor(Math.random() * 5) + 1; // coeficiente entre 1 e 5
        const b = Math.floor(Math.random() * 10) + 1; // termo independente entre 1 e 10
        const x = Math.floor(Math.random() * 10) + 1; // solução entre 1 e 10
        const c = a * x + b; // resultado da equação
        
        // Formatar a equação de acordo com o tipo
        let equacao = tipo.formato
            .replace('a', a)
            .replace('b', b)
            .replace('c', c);
        
        return {
            pergunta: `${tipo.desc} ${equacao}`,
            resposta: x
        };
    }

    function carregarPergunta() {
        const equacao = gerarEquacao();
        perguntaX.textContent = equacao.pergunta;
        respostaCorreta = equacao.resposta;
        
        // Gerar alternativas
        alternativasX.innerHTML = '';
        
        // Gerar 4 alternativas (1 correta e 3 incorretas)
        let alternativas = [respostaCorreta];
        
        // Adicionar alternativas incorretas baseadas na resposta correta
        for (let i = 0; i < 3; i++) {
            let alternativa;
            do {
                const variacao = Math.floor(Math.random() * 4) + 1; // diferença de 1 a 4
                const direcao = Math.random() < 0.5 ? 1 : -1; // positivo ou negativo
                alternativa = respostaCorreta + (variacao * direcao);
                
                // Garantir que a alternativa é positiva e diferente das outras
            } while (alternativas.includes(alternativa) || alternativa <= 0 || alternativa > 15);
            
            alternativas.push(alternativa);
        }
        
        // Embaralhar alternativas
        alternativas = alternativas.sort(() => Math.random() - 0.5);
        
        // Criar botões para cada alternativa
        alternativas.forEach(alternativa => {
            const botao = document.createElement('button');
            botao.textContent = alternativa;
            botao.addEventListener('click', function() {
                verificarResposta(alternativa);
            });
            alternativasX.appendChild(botao);
        });
    }

    function verificarResposta(resposta) {
        if (resposta == respostaCorreta) {
            resultadoX.textContent = 'Correto! 🎉';
            resultadoX.style.color = 'green';
            scoreX += 10;
            scoreXElement.textContent = scoreX;
        } else {
            resultadoX.textContent = `Incorreto! A resposta correta é ${respostaCorreta}`;
            resultadoX.style.color = 'red';
        }
        
        // Carregar nova pergunta após 1,5 segundos
        setTimeout(() => {
            resultadoX.textContent = '';
            carregarPergunta();
        }, 1500);
    }

    // Iniciar o jogo
    carregarPergunta();
});