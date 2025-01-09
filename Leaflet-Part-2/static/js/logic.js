// Create the map object and set the initial view
const map = L.map("map").setView([37.09, -95.71], 3); // Centered on the US

// Define base layers
const streetMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
});

const satelliteMap = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; <a href='https://opentopomap.org'>OpenTopoMap</a>"
});

// Add the street map to the map by default
streetMap.addTo(map);

// Define overlay layers (will be populated later)
const earthquakeLayer = L.layerGroup();
const tectonicLayer = L.layerGroup();

// Add base maps and overlay layers to layer control
L.control.layers(
  {
    "Street Map": streetMap,
    "Satellite Map": satelliteMap
  },
  {
    "Earthquakes": earthquakeLayer,
    "Tectonic Plates": tectonicLayer
  }
).addTo(map);

// Fetch earthquake data
const earthquakeDataUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(earthquakeDataUrl).then(data => {
  L.geoJSON(data, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: function (feature) {
      const depth = feature.geometry.coordinates[2]; // Depth
      const magnitude = feature.properties.mag; // Magnitude
      return {
        radius: magnitude * 4,
        fillColor: getColor(depth),
        color: "#000",
        weight: 0.5,
        opacity: 1,
        fillOpacity: 0.8
      };
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        `<h3>${feature.properties.place}</h3>
         <hr>
         <p><strong>Magnitude:</strong> ${feature.properties.mag}</p>
         <p><strong>Depth:</strong> ${feature.geometry.coordinates[2]} km</p>`
      );
    }
  }).addTo(earthquakeLayer);
  earthquakeLayer.addTo(map);
});

// Fetch tectonic plates data
const tectonicDataUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

d3.json(tectonicDataUrl).then(data => {
  L.geoJSON(data, {
    style: {
      color: "#ff7800",
      weight: 2
    }
  }).addTo(tectonicLayer);
  tectonicLayer.addTo(map);
});

// Function to determine color based on depth
function getColor(depth) {
  return depth > 90 ? "#ff5f65" :
         depth > 70 ? "#fca35d" :
         depth > 50 ? "#fdb72a" :
         depth > 30 ? "#f7db11" :
         depth > 10 ? "#dcf400" :
                      "#a3f600";
}
