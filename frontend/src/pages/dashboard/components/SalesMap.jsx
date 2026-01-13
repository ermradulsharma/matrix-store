import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from 'react-bootstrap';

// Fix for default Leaflet icon not showing
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const SalesMap = ({ data }) => {
    // Mock coordinates for demo purposes if real geo-coords aren't in DB yet.
    // In a real app, you'd geocode the city/state names or store coords in DB.
    // Here we will use a simple mapping for some known locations or random for demo if not found.
    // Since we don't have a geocoding service, we might need to rely on a static list or just show a placeholder if no data matches.

    // For this task, since I can't easily add a geocoding API, I will use a simple static map of common coordinates 
    // or just center on a default and show markers if I can map the City/Country names to lat/lng.
    // Better approach without external API: Use a Vector Map (like react-simple-maps) which maps country codes/names to shapes.
    // But user asked for "show sale in map". Leaflet is tile based.

    // Let's stick to Leaflet but warn that without coords it's hard. 
    // actually, `react-simple-maps` is better for "Sales by Country/State" visualization (Choropleth).
    // But I already chose Leaflet. I will try to map some common country names to coords for the demo.

    const countryCoords = {
        'USA': [37.0902, -95.7129],
        'United States': [37.0902, -95.7129],
        'India': [20.5937, 78.9629],
        'UK': [55.3781, -3.4360],
        'Canada': [56.1304, -106.3468],
        'Australia': [-25.2744, 133.7751]
    };

    // Transform data to markers
    const markers = (data?.country || []).map(item => {
        const coords = countryCoords[item.name] || [20, 0]; // Default to somewhere if unknown
        return {
            ...item,
            position: coords
        };
    });

    return (
        <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white py-3 border-bottom-0">
                <h5 className="fw-bold mb-0 text-dark">Global Sales Map</h5>
            </Card.Header>
            <Card.Body className="p-0">
                <div style={{ height: '400px', width: '100%' }}>
                    <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {markers.map((marker, idx) => (
                            <CircleMarker
                                key={idx}
                                center={marker.position}
                                pathOptions={{ color: '#4e73df', fillColor: '#4e73df', fillOpacity: 0.5 }}
                                radius={Math.log(marker.value) * 2 + 5} // Scale radius by value
                            >
                                <Popup>
                                    <strong>{marker.name}</strong><br />
                                    Sales: ${marker.value.toLocaleString()}<br />
                                    Orders: {marker.count}
                                </Popup>
                                <Tooltip>{marker.name}: ${marker.value}</Tooltip>
                            </CircleMarker>
                        ))}
                    </MapContainer>
                </div>
            </Card.Body>
        </Card>
    );
};

export default SalesMap;
