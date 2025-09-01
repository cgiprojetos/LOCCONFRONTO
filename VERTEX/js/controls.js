// js/controls.js
export function addLayerControl(map, baseLayers, overlayLayers) {
    L.control.layers(baseLayers, overlayLayers).addTo(map);
}