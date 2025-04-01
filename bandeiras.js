document.addEventListener("DOMContentLoaded", function () {
    const bandeiraImagem = document.getElementById("bandeira-imagem");
    const perguntaBandeira = document.getElementById("pergunta-bandeira");
    const alternativasBandeira = document.getElementById("alternativas-bandeira");
    const alternativasCapital = document.getElementById("alternativas-capital"); // Novo elemento
    const resultadoBandeira = document.getElementById("resultado-bandeira");
    const elementoScore = document.getElementById("score-band");
    const btnAlternarModo = document.getElementById('btn-alternar-modo');
    
    let modoJogo = 'pais'; // 'pais' ou 'capital'
    let score = 0;
    let currentQuestionIndex = 0;
    let bandeirasEmbaralhadas = shuffle([...bandeiras]);
    let bandeiraAtual;
    let respostaCertaPais, respostaCertaCapital;

    // Alternar entre modos de jogo
    btnAlternarModo.addEventListener('click', function() {
        modoJogo = modoJogo === 'pais' ? 'capital' : 'pais';
        alternativasCapital.style.display = modoJogo === 'capital' ? 'block' : 'none';
        currentQuestionIndex = 0;
        score = 0;
        elementoScore.textContent = score;
        bandeirasEmbaralhadas = shuffle([...bandeiras]);
        carregarPerguntaBandeiras();
        
        btnAlternarModo.textContent = modoJogo === 'pais' ? 
            "Modo: País (clique para Capital)" : 
            "Modo: Capital (clique para País)";
    });

    function carregarPerguntaBandeiras() {
        bandeiraAtual = bandeirasEmbaralhadas[currentQuestionIndex];
        bandeiraImagem.src = bandeiraAtual.imagem;
        
        // Sempre prepara as alternativas de país
        respostaCertaPais = bandeiraAtual.pais;
        const alternativasPais = shuffle([respostaCertaPais, ...getRandomPaises(respostaCertaPais)]);
        
        alternativasBandeira.innerHTML = "";
        alternativasPais.forEach(alt => {
            const button = document.createElement("button");
            button.textContent = alt;
            button.addEventListener("click", () => verificarRespostaPais(alt));
            alternativasBandeira.appendChild(button);
        });

        // Prepara as alternativas de capital se estiver no modo capital
        if (modoJogo === 'capital') {
            respostaCertaCapital = bandeiraAtual.capital;
            const alternativasCapitais = shuffle([respostaCertaCapital, ...getRandomCapitais(respostaCertaCapital)]);
            
            alternativasCapital.innerHTML = "";
            alternativasCapitais.forEach(alt => {
                const button = document.createElement("button");
                button.textContent = alt;
                button.addEventListener("click", () => verificarRespostaCapital(alt));
                alternativasCapital.appendChild(button);
            });
        }

        perguntaBandeira.textContent = modoJogo === 'pais' ? 
            "Qual é este país?" : 
            "Qual é este país e sua capital?";
        
        resultadoBandeira.textContent = "";
    }

    function verificarRespostaPais(resposta) {
        if (resposta === respostaCertaPais) {
            if (modoJogo === 'pais') {
                acertou(100);
            } else {
                resultadoBandeira.textContent = "País correto! Agora acerte a capital para dobrar pontos!";
                resultadoBandeira.style.color = "blue";
            }
        } else {
            if (modoJogo === 'capital') {
                resultadoBandeira.textContent = `País errado! Era ${respostaCertaPais}. Tente acertar a capital.`;
                resultadoBandeira.style.color = "orange";
            } else {
                errou(respostaCertaPais);
            }
        }
    }

    function verificarRespostaCapital(resposta) {
        if (resposta === respostaCertaCapital) {
            if (resultadoBandeira.textContent.includes("País correto")) {
                acertou(200); // Dobra os pontos se acertou ambos
                resultadoBandeira.textContent = "Incrível! Você acertou o país e a capital! +200 pontos!";
            } else {
                acertou(100);
            }
        } else {
            errou(respostaCertaCapital);
        }
    }

    function acertou(pontos) {
        resultadoBandeira.textContent = "Correto! +" + pontos + " pontos!";
        resultadoBandeira.style.color = "green";
        score += pontos;
        elementoScore.textContent = score;
        elementoScore.style.color = "green";
        
        proximaPergunta();
    }

    function errou(respostaCorreta) {
        resultadoBandeira.textContent = `Errado! A resposta correta era ${respostaCorreta}.`;
        resultadoBandeira.style.color = "red";
        score = Math.max(0, score - 10);
        elementoScore.textContent = score;
        elementoScore.style.color = "red";
        
        proximaPergunta();
    }

    function proximaPergunta() {
        currentQuestionIndex++;
        if (currentQuestionIndex < bandeirasEmbaralhadas.length) {
            setTimeout(carregarPerguntaBandeiras, 2000);
        } else {
            resultadoBandeira.textContent = `Fim do jogo! Sua pontuação final é ${score}.`;
        }
    }

    function getRandomPaises(exclude) {
        const paises = bandeiras.map(b => b.pais).filter(p => p !== exclude);
        return shuffle(paises).slice(0, 3);
    }

    function getRandomCapitais(exclude) {
        const capitais = bandeiras.map(b => b.capital).filter(c => c !== exclude);
        return shuffle(capitais).slice(0, 3);
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Inicializa o jogo
    alternativasCapital.style.display = 'none'; // Esconde inicialmente
    btnAlternarModo.textContent = "Modo: País (clique para Capital)";
    carregarPerguntaBandeiras();
});


    // Array de países com URLs de imagens da internet
    const bandeiras = [
    { pais: "Brasil", capital: "Brasília", imagem: "https://flagcdn.com/br.svg" },
    { pais: "Estados Unidos", capital: "Washington, D.C.", imagem: "https://flagcdn.com/us.svg" },
    { pais: "Japão", capital: "Tóquio", imagem: "https://flagcdn.com/jp.svg" },
    { pais: "França", capital: "Paris", imagem: "https://flagcdn.com/fr.svg" },
    { pais: "Alemanha", capital: "Berlim", imagem: "https://flagcdn.com/de.svg" },
    { pais: "Canadá", capital: "Ottawa", imagem: "https://flagcdn.com/ca.svg" },
    { pais: "Austrália", capital: "Camberra", imagem: "https://flagcdn.com/au.svg" },
    { pais: "China", capital: "Pequim", imagem: "https://flagcdn.com/cn.svg" },
    { pais: "Índia", capital: "Nova Delhi", imagem: "https://flagcdn.com/in.svg" },
    { pais: "Reino Unido", capital: "Londres", imagem: "https://flagcdn.com/gb.svg" },
    { pais: "Argentina", capital: "Buenos Aires", imagem: "https://flagcdn.com/ar.svg" },
    { pais: "África do Sul", capital: "Pretória", imagem: "https://flagcdn.com/za.svg" },
    { pais: "Rússia", capital: "Moscou", imagem: "https://flagcdn.com/ru.svg" },
    { pais: "Itália", capital: "Roma", imagem: "https://flagcdn.com/it.svg" },
    { pais: "Espanha", capital: "Madri", imagem: "https://flagcdn.com/es.svg" },
    { pais: "Portugal", capital: "Lisboa", imagem: "https://flagcdn.com/pt.svg" },
    { pais: "México", capital: "Cidade do México", imagem: "https://flagcdn.com/mx.svg" },
    { pais: "Coreia do Sul", capital: "Seul", imagem: "https://flagcdn.com/kr.svg" },
    { pais: "Suécia", capital: "Estocolmo", imagem: "https://flagcdn.com/se.svg" },
    { pais: "Noruega", capital: "Oslo", imagem: "https://flagcdn.com/no.svg" },
    { pais: "Dinamarca", capital: "Copenhague", imagem: "https://flagcdn.com/dk.svg" },
    { pais: "Finlândia", capital: "Helsinque", imagem: "https://flagcdn.com/fi.svg" },
    { pais: "Holanda", capital: "Amsterdã", imagem: "https://flagcdn.com/nl.svg" },
    { pais: "Bélgica", capital: "Bruxelas", imagem: "https://flagcdn.com/be.svg" },
    { pais: "Suíça", capital: "Berna", imagem: "https://flagcdn.com/ch.svg" },
    { pais: "Áustria", capital: "Viena", imagem: "https://flagcdn.com/at.svg" },
    { pais: "Irlanda", capital: "Dublin", imagem: "https://flagcdn.com/ie.svg" },
    { pais: "Polônia", capital: "Varsóvia", imagem: "https://flagcdn.com/pl.svg" },
    { pais: "Turquia", capital: "Ancara", imagem: "https://flagcdn.com/tr.svg" },
    { pais: "Grécia", capital: "Atenas", imagem: "https://flagcdn.com/gr.svg" },
    { pais: "Egito", capital: "Cairo", imagem: "https://flagcdn.com/eg.svg" },
    { pais: "Arábia Saudita", capital: "Riade", imagem: "https://flagcdn.com/sa.svg" },
    { pais: "Indonésia", capital: "Jacarta", imagem: "https://flagcdn.com/id.svg" },
    { pais: "Tailândia", capital: "Banguecoque", imagem: "https://flagcdn.com/th.svg" },
    { pais: "Malásia", capital: "Kuala Lumpur", imagem: "https://flagcdn.com/my.svg" },
    { pais: "Filipinas", capital: "Manila", imagem: "https://flagcdn.com/ph.svg" },
    { pais: "Vietnã", capital: "Hanói", imagem: "https://flagcdn.com/vn.svg" },
    { pais: "Singapura", capital: "Singapura", imagem: "https://flagcdn.com/sg.svg" },
    { pais: "Nova Zelândia", capital: "Wellington", imagem: "https://flagcdn.com/nz.svg" },
    { pais: "Ucrânia", capital: "Kiev", imagem: "https://flagcdn.com/ua.svg" },
    { pais: "Marrocos", capital: "Rabat", imagem: "https://flagcdn.com/ma.svg" },
    { pais: "Tunísia", capital: "Túnis", imagem: "https://flagcdn.com/tn.svg" },
    { pais: "Senegal", capital: "Dacar", imagem: "https://flagcdn.com/sn.svg" },
    { pais: "Argélia", capital: "Argel", imagem: "https://flagcdn.com/dz.svg" },
    { pais: "Gana", capital: "Acra", imagem: "https://flagcdn.com/gh.svg" },
    { pais: "Nigéria", capital: "Abuja", imagem: "https://flagcdn.com/ng.svg" },
    { pais: "Etiópia", capital: "Adis Abeba", imagem: "https://flagcdn.com/et.svg" },
    { pais: "Quênia", capital: "Nairóbi", imagem: "https://flagcdn.com/ke.svg" },
    { pais: "Camarões", capital: "Iaundé", imagem: "https://flagcdn.com/cm.svg" },
    { pais: "Zimbábue", capital: "Harare", imagem: "https://flagcdn.com/zw.svg" },
    { pais: "Madagascar", capital: "Antananarivo", imagem: "https://flagcdn.com/mg.svg" },
    { pais: "Botsuana", capital: "Gaborone", imagem: "https://flagcdn.com/bw.svg" },
    { pais: "Mali", capital: "Bamaco", imagem: "https://flagcdn.com/ml.svg" },
    { pais: "Sudão", capital: "Cartum", imagem: "https://flagcdn.com/sd.svg" },
    { pais: "Chade", capital: "Ndjamena", imagem: "https://flagcdn.com/td.svg" },
    { pais: "Peru", capital: "Lima", imagem: "https://flagcdn.com/pe.svg" },
    { pais: "Colômbia", capital: "Bogotá", imagem: "https://flagcdn.com/co.svg" },
    { pais: "Venezuela", capital: "Caracas", imagem: "https://flagcdn.com/ve.svg" },
    { pais: "Equador", capital: "Quito", imagem: "https://flagcdn.com/ec.svg" },
    { pais: "Paraguai", capital: "Assunção", imagem: "https://flagcdn.com/py.svg" },
    { pais: "Uruguai", capital: "Montevidéu", imagem: "https://flagcdn.com/uy.svg" },
    { pais: "Bolívia", capital: "Sucre", imagem: "https://flagcdn.com/bo.svg" },
    { pais: "Chile", capital: "Santiago", imagem: "https://flagcdn.com/cl.svg" },
    { pais: "Cuba", capital: "Havana", imagem: "https://flagcdn.com/cu.svg" },
    { pais: "Costa Rica", capital: "São José", imagem: "https://flagcdn.com/cr.svg" }
];

    const bandeirasEmbaralhadas = shuffle(bandeiras);

   