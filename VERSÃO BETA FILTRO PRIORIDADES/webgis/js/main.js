
import { initializeMap } from '../js/map.js';
import { createBaseLayers, createOverlayLayers } from '../js/layers.js';
import { addLayerControl } from '../js/controls.js';


document.addEventListener('DOMContentLoaded', () => {
    const map = initializeMap('map');
    const baseLayers = createBaseLayers();
    const overlayLayers = createOverlayLayers();

    // Adiciona a primeira camada base ao mapa por padrão
    baseLayers.OpenStreetMap.addTo(map);
    addLayerControl(map, baseLayers, overlayLayers);

    //Aqui é para deixar selecionado todos os dados
    if (overlayLayers["CONFRONTO COM AE"]) {
        overlayLayers["CONFRONTO COM AE"].addTo(map);
    }
    if (overlayLayers["CONFRONTO SEM AE"]) {
        overlayLayers["CONFRONTO SEM AE"].addTo(map);
    }
    if (overlayLayers["CONFRONTO COM PFO"]) {
        overlayLayers["CONFRONTO COM PFO"].addTo(map);
    }

    
    // AQUI SERÁ ADICIONADO O ALGORITMO CORRETO PARA PESQUISA!
    L.Control.geocoder({

        // Placeholder que aparece no campo de busca
        placeholder: 'Buscar município ou endereço...',

        // Mensagem de erro se nada for encontrado
        errorMessage: 'Local não encontrado.',

        // Configurações específicas para o provedor Nominatim (do OpenStreetMap)
        geocoder: L.Control.Geocoder.nominatim({
            geocodingQueryParams: {
                // Limita a busca ao Brasil, dando prioridade a resultados no país
                "countrycodes": "br",

                //BAHIA LOCALIZAÇÃO
                "viewbox": "-46.6,-18.3,-37.3,-2.8" 
            }
        }),

        
        defaultMarkGeocode: false // Impede que o plugin adicione um marcador padrão
    })
    .on('markgeocode', function(e) {
        
        const bbox = e.geocode.bbox; 
        const center = e.geocode.center; 
        
        // Ajusta o mapa para caber o resultado encontrado
        map.fitBounds(bbox);

        
        L.popup()
         .setLatLng(center)
         .setContent(`<b>${e.geocode.name}</b>`)
         .openOn(map);
    })
    .addTo(map); // Adiciona o controle de busca ao mapa
    
});