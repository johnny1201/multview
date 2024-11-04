// Adiciona vídeos ao enviar o formulário manualmente
document.getElementById('videoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const videoLink = document.getElementById('videoLink').value;
    const videoType = document.getElementById('videoType').value;
    
    if (videoLink) {
        addVideoToPage(videoLink, videoType);
    }

    document.getElementById('videoLink').value = ''; // Limpa o campo de entrada
});

// Função para processar o arquivo de texto (links separados por linha)
document.getElementById('loadFileButton').addEventListener('click', function() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            const content = e.target.result;  // Conteúdo do arquivo
            const lines = content.split('\n');  // Divide o conteúdo em linhas

            lines.forEach(line => {
                const videoLink = line.trim();  // Remove espaços em branco da linha

                if (videoLink) {
                    // Verifica o tipo de vídeo com base na extensão do link (HLS ou DASH)
                    const videoType = videoLink.endsWith('.m3u8') ? 'hls' : 'dash';

                    addVideoToPage(videoLink, videoType);  // Adiciona o vídeo à página
                }
            });
        };

        reader.readAsText(file);  // Lê o conteúdo do arquivo
    } else {
        alert('Selecione um arquivo de links primeiro.');
    }
});

// Função para salvar os links de vídeos no LocalStorage
function saveVideosToLocalStorage() {
    const videos = [];
    const videoElements = document.querySelectorAll('video');

    videoElements.forEach(video => {
        const videoLink = video.getAttribute('data-link');
        const videoType = video.getAttribute('data-type');
        videos.push({ link: videoLink, type: videoType });
    });
23
    localStorage.setItem('videos', JSON.stringify(videos));  // Salva os vídeos como JSON
}

// Função para adicionar um tooltip ao vídeo, mostrando o tipo (HLS ou DASH)
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
        const rect = container.getBoundingClientRect();  // Pega as coordenadas do contêiner
        tooltip.style.left = `${e.clientX - rect.left + 10}px`;  // Ajusta a posição horizontal
        tooltip.style.top = `${e.clientY - rect.top + 10}px`;    // Ajusta a posição vertical
    });
}

// Função para adicionar vídeos à página (campo de texto ou arquivo txt)
function addVideoToPage(videoLink, videoType) {
    const videoContainer = document.getElementById('videos');

    // Cria o container para o vídeo e os botões
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
    
    // Cria o elemento de texto para mostrar o status do vídeo
    const statusText = document.createElement('div');
    statusText.classList.add('status-text');
    statusText.textContent = ''; // Texto vazio inicialmente
    container.appendChild(statusText); // Adiciona o texto ao container
    
    container.appendChild(videoElement);
    
    // Chama a função separada para adicionar o tooltip
    addTooltipToVideo(container, videoElement, videoType);

    // Cria o botão de excluir
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.classList.add('delete-btn');
    deleteButton.addEventListener('click', function() {
        container.remove();  // Remove o container (vídeo + botão)
        saveVideosToLocalStorage();  // Atualiza o LocalStorage ao excluir um vídeo
    });
    
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

    container.appendChild(deleteButton);  // Adiciona o botão de excluir ao container
    container.appendChild(reloadButton);  // Adiciona o botão de reload ao container
    
    videoContainer.appendChild(container);  // Adiciona o container à página
    
    // Carrega o vídeo de acordo com o tipo (HLS ou DASH)
    if (videoType === 'hls') {
        loadHLSVideo(videoLink, uniqueId);
    } else if (videoType === 'dash') {
        loadDASHVideo(uniqueId, videoLink);
    }
    // Salva o estado dos vídeos no LocalStorage sempre que um vídeo for adicionado
    saveVideosToLocalStorage();

    // Adiciona eventos para monitorar o status do vídeo
    addVideoEventListeners(videoElement, statusText);
}

// Função para adicionar eventos ao vídeo (verificar se parou, teve erro, etc.)
function addVideoEventListeners(videoElement, statusText) {
    videoElement.addEventListener('pause', function() {
        if (!videoElement.ended && videoElement.networkState !== videoElement.NETWORK_NO_SOURCE) {
            videoElement.classList.add('paused');  // Adiciona a classe que faz a borda piscar
            statusText.textContent = 'Pausado';   // Atualiza o texto
            statusText.style.display = 'block';   // Mostra o texto
            console.log('O vídeo foi pausado pelo usuário ou travou.');
        }
    });

    videoElement.addEventListener('play', function() {
        videoElement.classList.remove('paused');  // Remove a classe quando o vídeo for reproduzido
        statusText.style.display = 'none';  // Esconde o texto
    });

    videoElement.addEventListener('stalled', function() {
        videoElement.classList.add('paused');  // Adiciona a classe quando o vídeo trava
        statusText.textContent = 'Travado (stalled)';   // Atualiza o texto
        statusText.style.display = 'block';   // Mostra o texto
        console.log('O vídeo travou devido a falta de dados.');
    });

    videoElement.addEventListener('error', function() {
        videoElement.classList.add('paused');  // Adiciona a classe quando ocorre erro
        statusText.textContent = 'Erro de Reprodução';   // Atualiza o texto
        statusText.style.display = 'block';   // Mostra o texto
        console.log('Erro de reprodução no vídeo.');
    });

    // Evento para detectar quando o vídeo está esperando mais dados
   /*videoElement.addEventListener('waiting', function() {
        videoElement.classList.add('paused');  // Adiciona a classe quando o vídeo está esperando dados
        statusText.textContent = 'Aguardando dados (waiting)';   // Atualiza o texto
        statusText.style.display = 'block';   // Mostra o texto
        console.log('O vídeo está aguardando mais dados.');
    });*/

    // Timeout para verificar se o vídeo ficou travado por mais de 10 segundos
    let loadingTimeout = setTimeout(function() {
        if (videoElement.readyState < 4) {  // readyState < 4 significa que o vídeo não está pronto para reproduzir completamente
            videoElement.classList.add('paused');  // Adiciona a classe quando o vídeo não carrega adequadamente
            statusText.textContent = 'Erro de carregamento (timeout)';   // Atualiza o texto
            statusText.style.display = 'block';   // Mostra o texto
            console.log('Erro: o vídeo demorou muito para carregar.');
        }
    }, 10000);  // Tempo limite de 10 segundos
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

// Função para carregar vídeos do LocalStorage ao iniciar a página
function loadVideosFromLocalStorage() {
    const savedVideos = JSON.parse(localStorage.getItem('videos')) || [];

    savedVideos.forEach(video => {
        addVideoToPage(video.link, video.type);
    });
}

// Chama essa função quando a página é carregada para restaurar os vídeos
window.addEventListener('load', function() {
    loadVideosFromLocalStorage();
});

// Ajusta o layout da grade com base na escolha do usuário
document.getElementById('layoutSelector').addEventListener('change', function() {
    const layout = this.value;  // Obtém o valor selecionado (quantas colunas)
    const videoContainer = document.getElementById('videos');
    
    videoContainer.style.gridTemplateColumns = `repeat(${layout}, 1fr)`;  // Ajusta o número de colunas
});

// Atualiza o texto do campo quando um arquivo é selecionado
document.getElementById('fileInput').addEventListener('change', function() {
    const fileInput = document.getElementById('fileInput');
    const fileInputLabel = document.getElementById('fileInputLabel');
    
    if (fileInput.files.length > 0) {
        // Mostra o nome do arquivo no label do input
        fileInputLabel.textContent = fileInput.files[0].name;
    } else {
        // Volta ao texto original se nenhum arquivo for selecionado
        fileInputLabel.textContent = 'Carregar arquivo de links (txt)';
    }
});

 // Função para voltar para a página de visualização ao clicar na seta
 document.getElementById('backButton').addEventListener('click', function() {
    window.location.href = 'index.html';  // Redireciona para a página de visualização
});
