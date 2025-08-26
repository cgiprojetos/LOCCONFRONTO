
import { com_AE, COM_OBITO, SEM_AE, MUNICIPIOS_BAHIA } from './dados.js';

//Função para barra de busca
export function createSearchLayer() {
    const markers = MUNICIPIOS_BAHIA.map(m => {

        let marker = L.marker(m.coords);
        marker.options.title = m.nome; // O plugin busca por esta propriedade
        return marker;
    });
    return L.layerGroup(markers);
}

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


function criarGrupoDeMarcadores(listaDePontos, icone) {
    const markers = listaDePontos.map(ponto => {
        //Criando Marcadores com a propriedade popup
        let marcador = L.marker([ponto.latitude, ponto.longitude])
                        .bindPopup(ponto.localizacao);
        if(icone){
            marcador(icone);
        }
        return marcador
    });
    return L.layerGroup(markers);
}
  
export function createOverlayLayers() {


    const grupoComAE = criarGrupoDeMarcadores(com_AE);
    const grupoCOM_OBITO = criarGrupoDeMarcadores(COM_OBITO);
    const grupoSemAE = criarGrupoDeMarcadores(SEM_AE);


    return {
        "CONFRONTO COM AE": grupoComAE,
        "CONFRONTO SEM AE": grupoSemAE,
        "CONFRONTO COM PFO": grupoCOM_OBITO
        
        // Você pode adicionar outras camadas aqui se precisar, por exemplo:
        // "Outra Camada": outraVariavelDeCamada
    };
}