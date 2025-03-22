document.addEventListener("DOMContentLoaded", function () {
    const bandeiraImagem = document.getElementById("bandeira-imagem");
    const perguntaBandeira = document.getElementById("pergunta-bandeira");
    const alternativasBandeira = document.getElementById("alternativas-bandeira");
    const resultadoBandeira = document.getElementById("resultado-bandeira");
    const elementoScore = document.getElementById("score-band");
    
    let score = 0; // Variável para armazenar a pontuação
    let currentQuestionIndex = 0;

    // Array de países com URLs de imagens da internet
    const bandeiras = [
        { pais: "Brasil", imagem: "https://flagcdn.com/br.svg" },
        { pais: "Estados Unidos", imagem: "https://flagcdn.com/us.svg" },
        { pais: "Japão", imagem: "https://flagcdn.com/jp.svg" },
        { pais: "França", imagem: "https://flagcdn.com/fr.svg" },
        { pais: "Alemanha", imagem: "https://flagcdn.com/de.svg" },
        { pais: "Canadá", imagem: "https://flagcdn.com/ca.svg" },
        { pais: "Austrália", imagem: "https://flagcdn.com/au.svg" },
        { pais: "China", imagem: "https://flagcdn.com/cn.svg" },
        { pais: "Índia", imagem: "https://flagcdn.com/in.svg" },
        { pais: "Reino Unido", imagem: "https://flagcdn.com/gb.svg" },
        { pais: "Argentina", imagem: "https://flagcdn.com/ar.svg" },
        { pais: "África do Sul", imagem: "https://flagcdn.com/za.svg" },
        { pais: "Rússia", imagem: "https://flagcdn.com/ru.svg" },
        { pais: "Itália", imagem: "https://flagcdn.com/it.svg" },
        { pais: "Espanha", imagem: "https://flagcdn.com/es.svg" },
        { pais: "Portugal", imagem: "https://flagcdn.com/pt.svg" },
        { pais: "México", imagem: "https://flagcdn.com/mx.svg" },
        { pais: "Coreia do Sul", imagem: "https://flagcdn.com/kr.svg" },
        { pais: "Suécia", imagem: "https://flagcdn.com/se.svg" },
        { pais: "Noruega", imagem: "https://flagcdn.com/no.svg" },
        { pais: "Dinamarca", imagem: "https://flagcdn.com/dk.svg" },
        { pais: "Finlândia", imagem: "https://flagcdn.com/fi.svg" },
        { pais: "Holanda", imagem: "https://flagcdn.com/nl.svg" },
        { pais: "Bélgica", imagem: "https://flagcdn.com/be.svg" },
        { pais: "Suíça", imagem: "https://flagcdn.com/ch.svg" },
        { pais: "Áustria", imagem: "https://flagcdn.com/at.svg" },
        { pais: "Irlanda", imagem: "https://flagcdn.com/ie.svg" },
        { pais: "Polônia", imagem: "https://flagcdn.com/pl.svg" },
        { pais: "Turquia", imagem: "https://flagcdn.com/tr.svg" },
        { pais: "Grécia", imagem: "https://flagcdn.com/gr.svg" },
        { pais: "Egito", imagem: "https://flagcdn.com/eg.svg" },
        { pais: "Arábia Saudita", imagem: "https://flagcdn.com/sa.svg" },
        { pais: "Indonésia", imagem: "https://flagcdn.com/id.svg" },
        { pais: "Tailândia", imagem: "https://flagcdn.com/th.svg" },
        { pais: "Malásia", imagem: "https://flagcdn.com/my.svg" },
        { pais: "Filipinas", imagem: "https://flagcdn.com/ph.svg" },
        { pais: "Vietnã", imagem: "https://flagcdn.com/vn.svg" },
        { pais: "Singapura", imagem: "https://flagcdn.com/sg.svg" },
        { pais: "Nova Zelândia", imagem: "https://flagcdn.com/nz.svg" },
        { pais: "Ucrânia", imagem: "https://flagcdn.com/ua.svg" },
        { pais: "Marrocos", imagem: "https://flagcdn.com/ma.svg" },
        { pais: "Tunísia", imagem: "https://flagcdn.com/tn.svg" },
        { pais: "Senegal", imagem: "https://flagcdn.com/sn.svg" },
        { pais: "Argélia", imagem: "https://flagcdn.com/dz.svg" },
        { pais: "Gana", imagem: "https://flagcdn.com/gh.svg" },
        { pais: "Nigéria", imagem: "https://flagcdn.com/ng.svg" },
        { pais: "Etiópia", imagem: "https://flagcdn.com/et.svg" },
        { pais: "Quênia", imagem: "https://flagcdn.com/ke.svg" },
        { pais: "Camarões", imagem: "https://flagcdn.com/cm.svg" },
        { pais: "Zimbábue", imagem: "https://flagcdn.com/zw.svg" },
        { pais: "Madagascar", imagem: "https://flagcdn.com/mg.svg" },
        { pais: "Botsuana", imagem: "https://flagcdn.com/bw.svg" },
        { pais: "Mali", imagem: "https://flagcdn.com/ml.svg" },
        { pais: "Sudão", imagem: "https://flagcdn.com/sd.svg" },
        { pais: "Chade", imagem: "https://flagcdn.com/td.svg" },
        { pais: "Peru", imagem: "https://flagcdn.com/pe.svg" },
        { pais: "Colômbia", imagem: "https://flagcdn.com/co.svg" },
        { pais: "Venezuela", imagem: "https://flagcdn.com/ve.svg" },
        { pais: "Equador", imagem: "https://flagcdn.com/ec.svg" },
        { pais: "Paraguai", imagem: "https://flagcdn.com/py.svg" },
        { pais: "Uruguai", imagem: "https://flagcdn.com/uy.svg" },
        { pais: "Bolívia", imagem: "https://flagcdn.com/bo.svg" },
        { pais: "Chile", imagem: "https://flagcdn.com/cl.svg" },
        { pais: "Cuba", imagem: "https://flagcdn.com/cu.svg" },
        { pais: "Costa Rica", imagem: "https://flagcdn.com/cr.svg" }
    ];

    const bandeirasEmbaralhadas = shuffle(bandeiras);

    function carregarPerguntaBandeiras() {        
        const bandeiraAtual = bandeirasEmbaralhadas[currentQuestionIndex];;
        bandeiraImagem.src = bandeiraAtual.imagem;
        perguntaBandeira.textContent = "";

        // Embaralha as alternativas
        const alternativas = shuffle([bandeiraAtual.pais, ...getRandomPaises(bandeiraAtual.pais)]);

        alternativasBandeira.innerHTML = "";
        alternativas.forEach(alt => {
            const button = document.createElement("button");
            button.textContent = alt;
            button.addEventListener("click", () => verificarResposta(alt, bandeiraAtual.pais));
            alternativasBandeira.appendChild(button);
        });

        // Limpa a mensagem de resultado ao carregar uma nova pergunta
        resultadoBandeira.textContent = "";
    }

    function verificarResposta(resposta, respostaCorreta) {
        if (resposta === respostaCorreta) {
            resultadoBandeira.textContent = "Correto!";
            resultadoBandeira.style.color = "green";
            score += 100; // Atualiza a pontuação
            elementoScore.textContent = score; // Atualiza o valor na tela
            elementoScore.style.color = "green";
        } else {
            resultadoBandeira.textContent = `Errado! A resposta correta era ${respostaCorreta}.`;
            resultadoBandeira.style.color = "red";
            score -= 10; // Atualiza a pontuação
            elementoScore.textContent = score; // Atualiza o valor na tela
            elementoScore.style.color = "red";
        }

        currentQuestionIndex++;
        if (currentQuestionIndex < bandeiras.length) {
            // Aguarda 1 segundo antes de carregar a próxima pergunta
            setTimeout(carregarPerguntaBandeiras, 2000);
        } else {
            resultadoBandeira.textContent = `Fim do jogo! Sua pontuação final é ${score}/${bandeiras.length}.`;
        }
    }

    function getRandomPaises(exclude) {
        const paises = bandeiras.map(b => b.pais).filter(p => p !== exclude);
        return shuffle(paises).slice(0, 3);
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    carregarPerguntaBandeiras();
});

