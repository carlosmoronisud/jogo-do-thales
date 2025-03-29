document.addEventListener("DOMContentLoaded", function() {
    const notaImagem = document.getElementById("nota-imagem");
    const perguntaNotas = document.getElementById("pergunta-notas");
    const alternativasNotas = document.getElementById("alternativas-notas");
    const resultadoNotas = document.getElementById("resultado-notas");
    const elementoScore = document.getElementById("score-notas");

    let score = 0;
    let currentQuestionIndex = 0;
    let audioContext;
    let notaAtual;
    let samplesPiano = {};

    // Notas musicais com arquivos de som e imagens correspondentes
    const notasMusicais = [
        { nome: "Dó", arquivo: "sounds/piano_c4.mp3", imagem: "images/nota_do.png" },
        { nome: "Ré", arquivo: "sounds/piano_d4.mp3", imagem: "images/nota_re.png" },
        { nome: "Mi", arquivo: "sounds/piano_e4.mp3", imagem: "images/nota_mi.png" },
        { nome: "Fá", arquivo: "sounds/piano_f4.mp3", imagem: "images/nota_fa.png" },
        { nome: "Sol", arquivo: "sounds/piano_g4.mp3", imagem: "images/nota_sol.png" },
        { nome: "Lá", arquivo: "sounds/piano_a4.mp3", imagem: "images/nota_la.png" },
        { nome: "Si", arquivo: "sounds/piano_b4.mp3", imagem: "images/nota_si.png" }
    ];

    // Imagem padrão da nota musical
    const IMAGEM_PADRAO = "images/nota_musical.png";

    async function initAudio() {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Carrega os samples de piano
            await Promise.all(notasMusicais.map(async nota => {
                try {
                    const response = await fetch(nota.arquivo);
                    const arrayBuffer = await response.arrayBuffer();
                    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                    samplesPiano[nota.nome] = audioBuffer;
                } catch (e) {
                    console.error(`Erro ao carregar ${nota.nome}:`, e);
                }
            }));
            
        } catch (e) {
            console.error("Erro ao inicializar áudio:", e);
            alert("Erro ao carregar os sons. Por favor, recarregue a página.");
        }
    }

    function tocarNotaPiano(notaNome) {
        if (!audioContext || !samplesPiano[notaNome]) return;
        
        const source = audioContext.createBufferSource();
        source.buffer = samplesPiano[notaNome];
        
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 10);
        
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        source.start();
        source.stop(audioContext.currentTime + 10);
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function carregarPerguntaNotas() {
        const notasEmbaralhadas = shuffle([...notasMusicais]);
        notaAtual = notasEmbaralhadas[0];
        
        // Reseta para a imagem padrão
        notaImagem.src = IMAGEM_PADRAO;
        notaImagem.onclick = function() {
            tocarNotaPiano(notaAtual.nome);
        };
        
        perguntaNotas.textContent = "Qual nota musical você ouviu?";
        alternativasNotas.innerHTML = "";
        
        const alternativas = [notaAtual.nome];
        while (alternativas.length < 4) {
            const notaAleatoria = notasMusicais[Math.floor(Math.random() * notasMusicais.length)].nome;
            if (!alternativas.includes(notaAleatoria)) {
                alternativas.push(notaAleatoria);
            }
        }
        
        shuffle(alternativas).forEach(alt => {
            const button = document.createElement("button");
            button.textContent = alt;
            button.addEventListener("click", () => verificarResposta(alt, notaAtual.nome));
            alternativasNotas.appendChild(button);
        });
        
        resultadoNotas.textContent = "";
    }

    function verificarResposta(resposta, respostaCorreta) {
        // Mostra a imagem da nota correta
        const notaCorretaObj = notasMusicais.find(n => n.nome === respostaCorreta);
        notaImagem.src = notaCorretaObj.imagem;
        notaImagem.onclick = null; // Desativa o clique durante o feedback
        
        if (resposta === respostaCorreta) {
            resultadoNotas.textContent = "Correto! 🎵";
            resultadoNotas.style.color = "green";
            score += 100;
            elementoScore.textContent = score;
        } else {
            resultadoNotas.textContent = `Errado! A nota correta era ${respostaCorreta}.`;
            resultadoNotas.style.color = "red";
            score = Math.max(0, score - 50);
            elementoScore.textContent = score;
        }
        
        setTimeout(() => {
            carregarPerguntaNotas();
        }, 2000);
    }

    // Inicializa o jogo
    initAudio().then(() => {
        carregarPerguntaNotas();
    });
});