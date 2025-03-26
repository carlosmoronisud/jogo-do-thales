const btnMatematica = document.getElementById("btn-matematica");
const btnAreas = document.getElementById("btn-areas");
const btnBandeiras = document.getElementById("btn-bandeiras");
const btnX = document.getElementById("btn-x");
const jogoMatematica = document.getElementById("jogo-matematica");
const jogoAreas = document.getElementById("jogo-areas");
const jogoBandeiras = document.getElementById("jogo-bandeiras");
const jogoX = document.getElementById('jogo-x');


// Mostra o jogo de matemática e esconde o de áreas
btnMatematica.addEventListener("click", () => {
    jogoMatematica.style.display = "block";
    jogoBandeiras.style.display = "none";
    jogoAreas.style.display = "none";
    jogoX.style.display = "none";
});

// Mostra o jogo de áreas e esconde o de matemática
btnAreas.addEventListener("click", () => {
    jogoAreas.style.display = "block";
    jogoMatematica.style.display = "none";
    jogoBandeiras.style.display = "none";
    jogoX.style.display = "none";
    carregarProximaForma();
    // Carrega a primeira pergunta do jogo de áreas
});
// Mostra o jogo das bandeiras e esconde os outros
btnBandeiras.addEventListener("click", () => {
    jogoBandeiras.style.display = "block";
    jogoMatematica.style.display = "none";
    jogoAreas.style.display = "none";
    jogoX.style.display = "none";
    iniciarJogo(); // Carrega a primeira pergunta do jogo de bandeiras
});
// Mostra o jogo do X Misterioso e esconde os outros
btnX.addEventListener("click", () => {
    jogoX.style.display = "block";
    jogoMatematica.style.display = "none";
    jogoAreas.style.display = "none";
    jogoBandeiras.style.display = "none";
    iniciarJogo(); // Carrega a primeira pergunta do jogo de bandeiras
});