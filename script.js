document.addEventListener('DOMContentLoaded', function () {
    // script.js

    mapboxgl.accessToken = 'pk.eyJ1Ijoiam9uYXRoYW53ZXN0YmVycnkiLCJhIjoiY2x0OWR4Z3k4MGg2dTJpcDlwc2o0ZXFvayJ9.Muok1VdFLcaVekq6lWlzrA';
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/jonathanwestberry/clt9l2gw600k501o84gvj0ajk',
        center: [-123.1207, 49.2827], // Vancouver
        zoom: 10
    });

    map.on('load', function () {
        // Load the custom icon
        map.loadImage('icons/art-gallery.svg', function (error, image) {
            if (error) throw error;

            // Add the custom icon to the map style.
            map.addImage('art-gallery-icon', image);

            // Add the public art data source
            map.addSource('publicArt', {
                type: 'geojson',
                data: 'joined_public_art.geojson',
                cluster: true, // Enable clustering
                clusterMaxZoom: 14, // Max zoom to cluster points on
                clusterRadius: 50 // Radius of each cluster when clustering points
            });

            // Add the clustered public art layer
            map.addLayer({
                id: 'clusters',
                type: 'circle',
                source: 'publicArt',
                filter: ['has', 'point_count'], // Only display clusters
                paint: {
                    'circle-color': [
                        'step',
                        ['get', 'point_count'],
                        '#51bbd6',
                        10,
                        '#f1f075',
                        20,
                        '#f28cb1'
                    ],
                    'circle-radius': [
                        'step',
                        ['get', 'point_count'],
                        20,
                        10,
                        30,
                        20,
                        40
                    ]
                }
            });

            // Add the cluster count layer
            map.addLayer({
                id: 'cluster-count',
                type: 'symbol',
                source: 'publicArt',
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': '{point_count_abbreviated}',
                    'text-size': 12
                }
            });

            // Add the unclustered public art layer
            map.addLayer({
                id: 'unclustered-point',
                type: 'symbol',
                source: 'publicArt',
                filter: ['!', ['has', 'point_count']],
                layout: {
                    'icon-image': 'art-gallery-icon',
                    'icon-size': 0.5
                }
            });

            // Popup
            map.on('click', 'clusters', function (e) {
                const features = map.queryRenderedFeatures(e.point, {
                    layers: ['clusters']
                });
                const clusterId = features[0].properties.cluster_id;
                map.getSource('publicArt').getClusterExpansionZoom(
                    clusterId,
                    function (err, zoom) {
                        if (err) return;

                        map.easeTo({
                            center: features[0].geometry.coordinates,
                            zoom: zoom
                        });
                    }
                );
            });

            map.on('click', 'unclustered-point', function (e) {
                const properties = e.features[0].properties;
                const popupContent = `
                    <div style="max-height: 300px; overflow-y: auto;">
                        <h3><strong>${properties.title_of_work}</strong></h3>
                        <span><strong>Artists:</strong> ${properties.ArtistNames || 'N/A'}</span><br>
                        <span><strong>Year:</strong> ${properties.yearofinstallation || 'N/A'}</span><br>
                        <span><strong>Project Statement:</strong> ${properties.artistprojectstatement || 'N/A'}</span><br>
                        <a href="${properties.url}" target="_blank">More details</a>
                    </div>
                `;

                const popup = new mapboxgl.Popup()
                    .setLngLat(e.features[0].geometry.coordinates)
                    .setHTML(popupContent)
                    .addTo(map);

                // Add a delay to ensure that the scroll position is set after the content has been fully rendered
                setTimeout(() => {
                    const popupContentDiv = document.querySelector('.mapboxgl-popup-content > div');
                    if (popupContentDiv) {
                        popupContentDiv.scrollTop = 0;
                    }
                }, 10); // delay (in milliseconds)
            });

            // Change the cursor to a pointer when hovering over cluster or unclustered point
            map.on('mouseenter', 'clusters', function () {
                map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', 'clusters', function () {
                map.getCanvas().style.cursor = '';
            });
            map.on('mouseenter', 'unclustered-point', function () {
                map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', 'unclustered-point', function () {
                map.getCanvas().style.cursor = '';
            });
        });
    });
});


