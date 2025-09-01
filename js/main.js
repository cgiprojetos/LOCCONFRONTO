import { initializeMap } from './map.js';
import { createBaseLayers, createOverlayLayers, createAispLayer } from './layers.js';
import { addLayerControl } from './controls.js';
import { com_AE, COM_OBITO, SEM_AE, refem, vitimizacao, danos_colaterais } from './dados.js';
import { initializeChatbot } from './chatbot.js'; 

let ultimaCoordenadaClicada = null;

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const hamburgerBtn = document.querySelector('.hamburger-btn');

    if (hamburgerBtn && sidebar) {
        hamburgerBtn.addEventListener('click', () => {
            sidebar.classList.toggle('is-open');
        });
    }

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

    const aisps = [
        { nome: "AISP 02-LIBERDADE", arquivo: "aisp_liberdade.geojson", cor: "#2563eb" },
        { nome: "AISP 13-CAJAZEIRAS", arquivo: "AISP13_Cajazeiras.geojson", cor: "#16a34a" },
        { nome: "AISP 15-NORDESTE", arquivo: "AISP15_Nordeste.geojson", cor: "#db2777" },
        { nome: "AISP 04-SAO CAETANO", arquivo: "AISP04_Sao_Caetano.geojson", cor: "#060ad9ff" },
        { nome: "AISP Pituba", arquivo: "AISP16_Pituba.geojson", cor: "#14b8a6" },
        { nome: "AISP 14-BARRA", arquivo: "AISP14_Barra.geojson", cor: "#8b5cf6" },
        { nome: "AISP 11-TANCREDO NEVES", arquivo: "AISP11_Tancredo_Neves.geojson", cor: "#e11d48" },
        { nome: "AISP 12-ITAPUA", arquivo: "AISP12_Itapua.geojson", cor: "#02240eff" },
        { nome: "AISP 07-RIO VERMELHO", arquivo: "AISP07_Rio_Vermelho.geojson", cor: "#3b82f6" },
        { nome: "AISP 05-PERIPERI", arquivo: "AISP05_Periperi.geojson", cor: "#f59e0b" },
        { nome: "AISP 10-PAU DA LIMA", arquivo: "AISP10_Pau_Lima.geojson", cor: "#5acaf7ff" },
        { nome: "AISP 08-CIA", arquivo: "AISP08_Cia.geojson", cor: "#f97316" },
        { nome: "AISP 06-BROTAS", arquivo: "AISP06_Brotas.geojson", cor: "#f81492ff" },    
        { nome: "AISP 09-BOCA DO RIO", arquivo: "AISP09_Boca_Rio.geojson", cor: "#3b82f6" },
        { nome: "AISP 03-BOM FIM", arquivo: "AISP03_Bonfim.geojson", cor: "#f80ef8ff" },
        { nome: "AISP 01-BARRIS", arquivo: "AISP01_Barris.geojson", cor: "#53452bff" }
    ];

    aisps.forEach(cfg => {
        createAispLayer(cfg.nome, cfg.arquivo, cfg.cor).then(layer => {
            overlayLayers[cfg.nome] = layer;
            layer.addTo(map);
        });
    });

    const resetButton = document.getElementById('resete-mapa');
    const aispListContainer = document.getElementById('aisp-list');
    const aispSearchInput = document.getElementById('aisp-search-input');
    const priorityListContainer = document.getElementById('priority-list');

    const todosOsPontos = [...com_AE, ...COM_OBITO, ...SEM_AE, ...vitimizacao, ...danos_colaterais, ...refem ];

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

    const tiposPrioridadeUnicos = [...new Set(todosOsPontos.map(p => p.tipo_prioridade).filter(tipo => tipo && tipo !== "nan"))].sort();
    tiposPrioridadeUnicos.forEach(tipo => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'priority-item';
        itemDiv.innerHTML = `<label><input type="checkbox" value="${tipo}"> ${tipo}</label>`;
        priorityListContainer.appendChild(itemDiv);
    });

    aispSearchInput.addEventListener('input', () => {
        const searchTerm = aispSearchInput.value.toLowerCase();
        const aispItems = aispListContainer.getElementsByClassName('aisp-item');
        Array.from(aispItems).forEach(item => {
            const label = item.querySelector('label');
            const aispName = label.textContent.toLowerCase();
            item.style.display = aispName.includes(searchTerm) ? 'block' : 'none';
        });
    });

    function aplicarFiltrosGlobais() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const aispsSelecionadas = Array.from(document.querySelectorAll('#aisp-list input:checked')).map(cb => cb.value);
        const prioridadesSelecionadas = Array.from(document.querySelectorAll('#priority-list input:checked')).map(cb => cb.value);

        const layersParaZoom = [];
        let filtrosAtivos = (startDate && endDate) || aispsSelecionadas.length > 0 || prioridadesSelecionadas.length > 0;

        Object.values(overlayLayers).forEach(grupo => {
            if (grupo.eachLayer) {
                grupo.eachLayer(layer => {
                    const props = layer.feature?.properties || {};
                    let mostrar = true;

                    if (aispsSelecionadas.length > 0 && !aispsSelecionadas.includes(props.aisp)) mostrar = false;
                    if (props.data) {
                        if (startDate && endDate && (props.data < startDate || props.data > endDate)) mostrar = false;
                    }
                    if (props.tipo_prioridade) {
                        if (prioridadesSelecionadas.length > 0 && !prioridadesSelecionadas.includes(props.tipo_prioridade)) mostrar = false;
                    }

                    if (mostrar) {
                        if (!map.hasLayer(layer)) layer.addTo(map);
                        layersParaZoom.push(layer);
                    } else {
                        if (map.hasLayer(layer)) layer.removeFrom(map);
                    }
                });
            }
        });

        if (layersParaZoom.length > 0 && filtrosAtivos) {
            const grupoParaZoom = L.featureGroup(layersParaZoom);
            map.fitBounds(grupoParaZoom.getBounds().pad(0.1));
        }

        if (resetButton) resetButton.style.display = filtrosAtivos ? 'block' : 'none';
    }

    function resetarFiltro(mostrarAlerta = true) {
        document.getElementById('start-date').value = '';
        document.getElementById('end-date').value = '';
        document.querySelectorAll('#aisp-list input:checked').forEach(cb => cb.checked = false);
        document.querySelectorAll('#priority-list input:checked').forEach(cb => cb.checked = false);

        aplicarFiltrosGlobais();
        map.setView([-12.97, -38.50], 6);
        if (mostrarAlerta) alert("Todos os filtros foram removidos.");
    }

    function debounce(func, delay = 400) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    const aplicarFiltrosComDebounce = debounce(aplicarFiltrosGlobais);

    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    if (resetButton) resetButton.addEventListener('click', () => resetarFiltro(true));
    if (startDateInput) startDateInput.addEventListener('change', aplicarFiltrosComDebounce);
    if (endDateInput) endDateInput.addEventListener('change', aplicarFiltrosComDebounce);
    if (aispListContainer) aispListContainer.addEventListener('change', aplicarFiltrosComDebounce);
    if (priorityListContainer) priorityListContainer.addEventListener('change', aplicarFiltrosComDebounce);

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
