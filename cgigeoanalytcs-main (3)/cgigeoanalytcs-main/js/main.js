import { initializeMap } from './map.js';
import { createBaseLayers, createOverlayLayers } from './layers.js';
import { addLayerControl } from './controls.js';
import { com_AE, COM_OBITO, SEM_AE, refem, vitimizacao, danos_colaterais } from './dados.js';
import { initializeChatbot } from './chatbot.js'; 

// Variável global para armazenar a última coordenada clicada para o Street View
let ultimaCoordenadaClicada = null;

document.addEventListener('DOMContentLoaded', () => {


    // --- LÓGICA PARA O MENU HAMBURGUER RESPONSIVO ---
const sidebar = document.querySelector('.sidebar');
const hamburgerBtn = document.querySelector('.hamburger-btn');

if (hamburgerBtn && sidebar) {
    hamburgerBtn.addEventListener('click', () => {
        sidebar.classList.toggle('is-open');
    });
}

    // --- 1. INICIALIZAÇÃO DO MAPA E CAMADAS ---
    const map = initializeMap('map');
    const baseLayers = createBaseLayers();
    const overlayLayers = createOverlayLayers();

    baseLayers["OpenStreetMap"].addTo(map);

    Object.values(overlayLayers).forEach(grupo => {
        grupo.addTo(map);
        grupo.eachLayer(marker => {
            marker.on('click', function (e) {
                ultimaCoordenadaClicada = e.latlng;
            });
        });
    });



    // Pega as referências dos elementos do HTML
    const resetButton = document.getElementById('resete-mapa');
    const aispListContainer = document.getElementById('aisp-list');
    const aispSearchInput = document.getElementById('aisp-search-input');
    const priorityListContainer = document.getElementById('priority-list');

    // --- 2. CRIAÇÃO DAS LISTAS DE FILTROS DINÂMICOS ---
    const todosOsPontos = [...com_AE, ...COM_OBITO, ...SEM_AE, ...vitimizacao, ...danos_colaterais, ...refem ];
    
    // Popula o filtro de AISP
        const aispsUnicas = [...new Set(
        todosOsPontos.map(ocorrencia => ocorrencia.aisp)
                    .filter(aisp => aisp && aisp !== "nan")
                    )].sort();

    aispsUnicas.forEach(aisp => {
        if (aisp) {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'aisp-item';
            itemDiv.innerHTML = `<label><input type="checkbox" value="${aisp}"> ${aisp}</label>`;
            aispListContainer.appendChild(itemDiv);
        }
    });

    // Popula o filtro de Prioridades com checkboxes
    const tiposPrioridadeUnicos = [...new Set(todosOsPontos.map(p => p.tipo_prioridade).filter(tipo => tipo && tipo !== "nan"))].sort();
    tiposPrioridadeUnicos.forEach(tipo => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'priority-item';
        itemDiv.innerHTML = `<label><input type="checkbox" value="${tipo}"> ${tipo}</label>`;
        priorityListContainer.appendChild(itemDiv);
    });

    // LÓGICA PARA FILTRAR A LISTA DE CHECKBOXES DE AISP
    aispSearchInput.addEventListener('input', () => {
        const searchTerm = aispSearchInput.value.toLowerCase();
        const aispItems = aispListContainer.getElementsByClassName('aisp-item');
        Array.from(aispItems).forEach(item => {
            const label = item.querySelector('label');
            const aispName = label.textContent.toLowerCase();
            if (aispName.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // --- 3. LÓGICA DE FILTRAGEM UNIFICADA E RESET ---
    
    /**
     * Função principal que reavalia TODOS os filtros ativos e decide quais pontos mostrar.
     */
    function aplicarFiltrosGlobais() {
        console.log("Aplicando filtros..."); // Log para depuração
        // Pega o estado atual de todos os filtros
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const aispsSelecionadas = Array.from(document.querySelectorAll('#aisp-list input:checked')).map(cb => cb.value);
        const prioridadesSelecionadas = Array.from(document.querySelectorAll('#priority-list input:checked')).map(cb => cb.value);

        const layersParaZoom = [];
        let filtrosAtivos = (startDate && endDate) || aispsSelecionadas.length > 0 || prioridadesSelecionadas.length > 0;

        Object.values(overlayLayers).forEach(grupo => {
            grupo.eachLayer(layer => {
                const props = layer.feature.properties;
                let mostrar = true; // Assume que o ponto será mostrado

                // Aplica filtro de AISP
                if (aispsSelecionadas.length > 0) {
                    if (!aispsSelecionadas.includes(props.aisp)) mostrar = false;
                }
                // Aplica filtro de Data
                if (startDate && endDate) {
                    if (props.data < startDate || props.data > endDate) mostrar = false;
                }
                // Aplica filtro de Prioridade
                if (prioridadesSelecionadas.length > 0) {
                    if (!prioridadesSelecionadas.includes(props.tipo_prioridade)) mostrar = false;
                }

                // Mostra ou esconde o ponto com base no resultado dos filtros
                if (mostrar) {
                    if (!map.hasLayer(layer)) {
                        layer.addTo(map);
                    }
                    layersParaZoom.push(layer);
                } else {
                    if (map.hasLayer(layer)) {
                        layer.removeFrom(map);
                    }
                }
            });
        });

        // Ajusta o zoom se algum filtro estiver ativo e houver resultados
        if (layersParaZoom.length > 0 && filtrosAtivos) {
            const grupoParaZoom = L.featureGroup(layersParaZoom);
            map.fitBounds(grupoParaZoom.getBounds().pad(0.1));
        }

        if (resetButton) {
            resetButton.style.display = filtrosAtivos ? 'block' : 'none';
        }
    }
    
    function resetarFiltro(mostrarAlerta = true) {
        document.getElementById('start-date').value = '';
        document.getElementById('end-date').value = '';
        document.querySelectorAll('#aisp-list input:checked').forEach(cb => cb.checked = false);
        document.querySelectorAll('#priority-list input:checked').forEach(cb => cb.checked = false);
        
        aplicarFiltrosGlobais(); // Reavalia os filtros (agora vazios) para mostrar tudo
        map.setView([-12.97, -38.50], 6); // Volta para a visão geral
        if (mostrarAlerta) alert("Todos os filtros foram removidos.");
    }

    // --- FUNÇÃO DEBOUNCE ADICIONADA ---
    /**
     * Atrasada a execução de uma função para otimizar a performance.
     * @param {Function} func A função para executar após o debounce.
     * @param {number} delay O tempo de espera em milissegundos.
     * @returns {Function} A nova função "debounced".
     */
    function debounce(func, delay = 400) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    // --- 4. EVENT LISTENERS OTIMIZADOS ---

    // Cria uma versão "debounced" da sua função de filtro.
    // Ela só será executada 400ms após a última interação do usuário com os filtros.
    const aplicarFiltrosComDebounce = debounce(aplicarFiltrosGlobais);

    // Pega as referências dos elementos de filtro
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    // Listener para o botão de reset (sem debounce)
    if (resetButton) {
        resetButton.addEventListener('click', () => resetarFiltro(true));
    }

    // --- Listeners para aplicação automática com debounce ---

    // Filtros de data
    if (startDateInput) {
        startDateInput.addEventListener('change', aplicarFiltrosComDebounce);
    }
    if (endDateInput) {
        endDateInput.addEventListener('change', aplicarFiltrosComDebounce);
    }

    // Checkboxes da AISP
    if (aispListContainer) {
        aispListContainer.addEventListener('change', aplicarFiltrosComDebounce);
    }

    // Checkboxes de Prioridade
    if (priorityListContainer) {
        priorityListContainer.addEventListener('change', aplicarFiltrosComDebounce);
    }
    
    // --- 5. CONTROLES DO MAPA ---
    addLayerControl(map, baseLayers, overlayLayers);

    L.Control.geocoder({
        position: 'topright',
        placeholder: 'Buscar município...',
        errorMessage: 'Local não encontrado.',
        geocoder: L.Control.Geocoder.nominatim({
            geocodingQueryParams: { "countrycodes": "br", "viewbox": "-46.6,-18.3,-37.3,-2.8" }
        }),
        defaultMarkGeocode: false
    })
    .on('markgeocode', function(e) {
        map.fitBounds(e.geocode.bbox);
        // Considere se precisa de uma função `filtrarCamadasPorMunicipio` ou se a lógica global já atende.
        // filtrarCamadasPorMunicipio(e.geocode.name); 
    })
    .addTo(map);

    L.Control.StreetViewButton = L.Control.extend({
        onAdd: function (map) {
            const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
            btn.innerHTML = '📷';
            btn.title = 'Abrir Google Street View no último ponto clicado';
            btn.style.backgroundColor = 'white';
            btn.style.width = '34px';
            btn.style.height = '34px';
            btn.style.cursor = 'pointer';
            btn.onclick = function () {
                if (!ultimaCoordenadaClicada) {
                    alert("Clique em um ponto no mapa primeiro.");
                    return;
                }
                const lat = ultimaCoordenadaClicada.lat;
                const lng = ultimaCoordenadaClicada.lng;
                const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
                window.open(url, '_blank');
            };
            return btn;
        },
        onRemove: function () {}
    });
    L.control.streetViewButton = function (opts) {
        return new L.Control.StreetViewButton(opts);
    };
    L.control.streetViewButton({ position: 'topleft' }).addTo(map);

});