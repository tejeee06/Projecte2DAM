import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const Map3DTab = ({ cities }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const startLat = cities.length > 0 ? cities[0].lat : 40.7135; 
    const startLng = cities.length > 0 ? cities[0].lng : -74.0066;

    useEffect(() => {
        if (map.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://tiles.openfreemap.org/styles/bright',
            center: [startLng, startLat],
            zoom: 15.5,
            pitch: 45,
            bearing: -17.6,
            canvasContextAttributes: { antialias: true }
        });

        map.current.on('load', () => {
            const layers = map.current.getStyle().layers;
            let labelLayerId;
            for (let i = 0; i < layers.length; i++) {
                if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
                    labelLayerId = layers[i].id;
                    break;
                }
            }

            map.current.addSource('openfreemap', {
                url: 'https://tiles.openfreemap.org/planet',
                type: 'vector',
            });

            map.current.addLayer(
                {
                    'id': '3d-buildings',
                    'source': 'openfreemap',
                    'source-layer': 'building',
                    'type': 'fill-extrusion',
                    'minzoom': 15,
                    'filter': ['!=', ['get', 'hide_3d'], true],
                    'paint': {
                        'fill-extrusion-color': [
                            'interpolate',
                            ['linear'],
                            ['get', 'render_height'], 
                            0, 'lightgray', 
                            200, 'royalblue', 
                            400, 'lightblue'
                        ],
                        'fill-extrusion-height': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            15,
                            0,
                            16,
                            ['get', 'render_height']
                        ],
                        'fill-extrusion-base': [
                            'case',
                            ['>=', ['get', 'zoom'], 16],
                            ['get', 'render_min_height'], 
                            0
                        ],
                        'fill-extrusion-opacity': 0.8
                    }
                },
                labelLayerId
            );

            cities.forEach(city => {
                const popup = new maplibregl.Popup({ offset: 25 })
                    .setHTML(`<div style="color:black"><strong>${city.name}</strong><br>${city.country}</div>`);

                new maplibregl.Marker({ color: "#FF5252" })
                    .setLngLat([city.lng, city.lat])
                    .setPopup(popup)
                    .addTo(map.current);
            });
        });

    }, [cities, startLat, startLng]);

    return (
        <div style={{ 
            width: '100%', 
            height: '600px', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #ddd'
        }}>
            <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default Map3DTab;