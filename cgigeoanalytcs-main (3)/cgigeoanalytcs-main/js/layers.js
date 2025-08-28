import { com_AE, COM_OBITO, SEM_AE, refem, vitimizacao, danos_colaterais } from './dados.js';


export function createBaseLayers() {
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
    });

    return {
        "OpenStreetMap": osm,
        "Satélite": satellite
    };
}

/**
 
 * @param {Array} listaDePontos - A lista de dados (ex: com_AE).
 * @param {Object} estilo - Um objeto com as opções de estilo do círculo (cor, raio, etc.).
 * @returns {L.LayerGroup} Uma camada com todos os círculos.
 */
function criarGrupoDeCirculos(listaDePontos, estilo) {
    const circles = listaDePontos.map(ponto => {
        
       const popupContent = `
            <b>Procedimento</b> ${ponto.n_ocorrencia}</b>
            <b>Local:</b> ${ponto.localizacao}<br>
            <b>Data:</b> ${ponto.data ? new Date(ponto.data + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'}<br>
            <b>Aisp:</b> ${ponto.aisp || 'Não informado'}<br>
            <b>Bairro:</b> ${ponto.bairro || 'Não informado'}<br>
            <b>Descrição:</b> ${ponto.descricao}
        `;

        const circle = L.circleMarker([ponto.latitude, ponto.longitude], estilo)
                        .bindPopup(popupContent);
        
        // ADICIONE OQUE PRECISA APARECER OU SER PROCURADO DENTRO DOS PONTOS NO MAPA
        circle.feature = {
            properties: {
                localizacao: ponto.localizacao,
                data: ponto.data,
                aisp: ponto.aisp,
                tipo_prioridade: ponto.tipo_prioridade
            }
        };
        
        return circle;
    });
    return L.layerGroup(circles);
}
 
export function createOverlayLayers() {

    // Define um objeto de estilo.
    const estiloComAE = {
        radius: 6,
        fillColor: "#007bff", 
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
    };

    const estiloSemAE = {
        radius: 6,
        fillColor: "#28a745", 
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
    };
    
    const estiloComObito = {
        radius: 7,
        fillColor: "#dc3545", 
        color: "#000",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    };
        const estilorefem = {
        radius: 7,
        fillColor: "#6c757d", 
        color: "#000",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    };
        const estilovitimizacao = {
        radius: 7,
        fillColor: "#fd7e14", 
        color: "#000",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    };
        const estilodanos = {
        radius: 7,
        fillColor: "#f8e913ff", 
        color: "#000",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    };


    // Cria os grupos de camadas, passando os dados e o estilo correspondente.
    const grupoComAE = criarGrupoDeCirculos(com_AE, estiloComAE);
    const grupoSemAE = criarGrupoDeCirculos(SEM_AE, estiloSemAE);
    const grupoCOM_OBITO = criarGrupoDeCirculos(COM_OBITO, estiloComObito);
    const grupoREFEM = criarGrupoDeCirculos(refem, estilorefem);
    const grupoVitimizacao = criarGrupoDeCirculos(vitimizacao, estilovitimizacao); 
    const grupoDanos = criarGrupoDeCirculos(danos_colaterais, estilodanos);
    // Retorna o objeto com as camadas que aparecerão no controle de layers.
    return {
        "CONFRONTO COM AE": grupoComAE,
        "CONFRONTO SEM AE": grupoSemAE,
        "CONFRONTO COM PFO": grupoCOM_OBITO,
        "SITUACAO COM REFEM": grupoREFEM,
        "VITIMIZACAO POLICIAL": grupoVitimizacao,
        "DANOS COLATERIAS": grupoDanos
    };
}