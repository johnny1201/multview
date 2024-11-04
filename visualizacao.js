// Função para carregar vídeos do LocalStorage ao iniciar a página
function loadVideosFromLocalStorage() {
    const savedVideos = JSON.parse(localStorage.getItem('videos')) || [];

    if (savedVideos.length === 0) {
        console.log("Nenhum vídeo encontrado no LocalStorage.");
        return;
    }

    savedVideos.forEach(video => {
        addVideoToPage(video.link, video.type);
    });
}

// Função para adicionar vídeos à página de visualização
function addVideoToPage(videoLink, videoType) {
    const videoContainer = document.getElementById('videos');

    // Cria o container para o vídeo
    const container = document.createElement('div');
    container.classList.add('video-container');
    
    const videoElement = document.createElement('video');
    videoElement.controls = true;
    videoElement.autoplay = true;
    videoElement.muted = true;
    videoElement.playsinline = true;

    const uniqueId = `video${Math.floor(Math.random() * 10000)}`;
    videoElement.id = uniqueId;

    // Armazena o link do vídeo no próprio elemento de vídeo usando o atributo data-link
    videoElement.setAttribute('data-link', videoLink);
    videoElement.setAttribute('data-type', videoType);  // Armazena o tipo do vídeo (HLS ou DASH)
    
    container.appendChild(videoElement);

    // Adiciona o tooltip para mostrar o tipo de vídeo
    addTooltipToVideo(container, videoElement, videoType);

    // Cria o botão de reload com ícone
    const reloadButton = document.createElement('button');
    reloadButton.classList.add('reload-btn');
    reloadButton.innerHTML = '<i class="fas fa-redo"></i>';  // Ícone de reload
    reloadButton.addEventListener('click', function() {
        // Recarrega o vídeo usando o link original armazenado no atributo data-link
        const storedLink = videoElement.getAttribute('data-link');
        const storedType = videoElement.getAttribute('data-type');

        if (storedType === 'hls') {
            loadHLSVideo(storedLink, uniqueId);  // Recarrega vídeo HLS
        } else if (storedType === 'dash') {
            loadDASHVideo(uniqueId, storedLink);  // Recarrega vídeo DASH
        }
    });

    container.appendChild(reloadButton);  // Adiciona o botão de reload ao container   
    videoContainer.appendChild(container);  // Adiciona o container à página
}

// Função para adicionar o tooltip ao vídeo, mostrando o tipo (HLS ou DASH)
function addTooltipToVideo(container, videoElement, videoType) {
    // Cria o tooltip para mostrar o tipo do vídeo (HLS ou DASH)
    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    tooltip.textContent = `Tipo: ${videoType.toUpperCase()}`;  // Exibe "HLS" ou "DASH"
    container.appendChild(tooltip);

    // Mostrar o tooltip ao passar o mouse sobre o vídeo
    videoElement.addEventListener('mouseover', function() {
        tooltip.style.display = 'block';  // Mostra o tooltip
    });

    // Esconder o tooltip ao remover o mouse do vídeo
    videoElement.addEventListener('mouseout', function() {
        tooltip.style.display = 'none';  // Esconde o tooltip
    });

    // Ajustar a posição do tooltip ao mover o mouse
    videoElement.addEventListener('mousemove', function(e) {
        const tooltipWidth = tooltip.offsetWidth;
        const tooltipHeight = tooltip.offsetHeight;
        const pageX = e.pageX;
        const pageY = e.pageY;

        // Ajustar a posição para manter a tooltip próxima ao cursor
        tooltip.style.left = `${pageX + 10}px`;  // Ajusta a posição horizontal com um pequeno deslocamento
        tooltip.style.top = `${pageY + 10}px`;   // Ajusta a posição vertical com um pequeno deslocamento

        // Limitar a posição para que o tooltip não saia da tela
        if (pageX + tooltipWidth + 20 > window.innerWidth) {
            tooltip.style.left = `${pageX - tooltipWidth - 10}px`;  // Ajusta para evitar que ultrapasse a tela
        }
        if (pageY + tooltipHeight + 20 > window.innerHeight) {
            tooltip.style.top = `${pageY - tooltipHeight - 10}px`;  // Ajusta para evitar que ultrapasse a tela
        }
    });
}

// Função para carregar vídeos HLS
function loadHLSVideo(videoManifestUrl, videoId) {
    const video = document.getElementById(videoId);

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoManifestUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            video.play();
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoManifestUrl;
        video.addEventListener('loadedmetadata', function() {
            video.play();
        });
    } else {
        alert('Seu navegador não suporta HLS.');
    }
}

// Função para carregar vídeos DASH
function loadDASHVideo(videoId, mpdUrl) {
    const videoElement = document.getElementById(videoId);
    const player = dashjs.MediaPlayer().create();
    player.initialize(videoElement, mpdUrl, true);
}

// Ajusta o layout da grade com base na escolha do usuário
document.getElementById('layoutSelector').addEventListener('change', function() {
    const layout = this.value;  // Obtém o valor selecionado (quantas colunas)
    const videoContainer = document.getElementById('videos');
    
    videoContainer.style.gridTemplateColumns = `repeat(${layout}, 1fr)`;  // Ajusta o número de colunas
});

// Chama essa função quando a página é carregada para restaurar os vídeos
window.addEventListener('load', function() {
    loadVideosFromLocalStorage();
});

// Controle da janela de senha (modal)
const configButton = document.getElementById('configButton');
const passwordModal = document.getElementById('passwordModal');
const closeModal = document.querySelector('.close');
const submitPassword = document.getElementById('submitPassword');
const errorMessage = document.getElementById('errorMessage');

// Mostra o modal ao clicar no botão de engrenagem
configButton.addEventListener('click', function() {
    passwordModal.style.display = 'block';
});

// Fecha o modal ao clicar no "X"
closeModal.addEventListener('click', function() {
    passwordModal.style.display = 'none';
});

// Verifica a senha e redireciona para a página de configuração
submitPassword.addEventListener('click', function() {
    const password = document.getElementById('passwordInput').value;
    if (password === 'adv_supervisor') {
        window.location.href = 'configuracao.html';  // Redireciona para a página de configuração
    } else {
        errorMessage.style.display = 'block';  // Exibe a mensagem de erro se a senha estiver incorreta
    }
});

// Fecha o modal se o usuário clicar fora dele
window.onclick = function(event) {
    if (event.target == passwordModal) {
        passwordModal.style.display = 'none';
    }
};
