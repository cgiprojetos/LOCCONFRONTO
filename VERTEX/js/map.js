export function initializeMap(containerId) {
    const map = L.map('map').setView([-12.97, -38.50], 6); // Coordenadas da bahia

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    return map;
}