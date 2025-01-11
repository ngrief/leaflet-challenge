// Create the map object and set the initial view
const map = L.map("map").setView([37.09, -95.71], 4); // Centered on the US

// Add the base tile layer (street map) from Leaflet
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
}).addTo(map);

// Define the URL for USGS Earthquake GeoJSON data (past 7 days)
const earthquakeDataUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Function to set marker size based on magnitude
function markerSize(magnitude) {
  return magnitude * 4;
}

// Function to set marker color based on depth
function getColor(depth) {
  return depth > 90 ? "#ff5f65" :
         depth > 70 ? "#fca35d" :
         depth > 50 ? "#fdb72a" :
         depth > 30 ? "#f7db11" :
         depth > 10 ? "#dcf400" :
                      "#a3f600";
}

// Fetch the GeoJSON data and plot it on the map
d3.json(earthquakeDataUrl).then(data => {
  // Add GeoJSON layer to the map
  L.geoJSON(data, {
    // Use pointToLayer to create circle markers
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    // Style each circleMarker
    style: function (feature) {
      return {
        radius: markerSize(feature.properties.mag),
        fillColor: getColor(feature.geometry.coordinates[2]), // Depth is the 3rd coordinate
        color: "#000",
        weight: 0.5,
        opacity: 1,
        fillOpacity: 0.8
      };
    },
    // Add popups to each marker
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        `<h3>${feature.properties.place}</h3>
         <hr>
         <p><strong>Magnitude:</strong> ${feature.properties.mag}</p>
         <p><strong>Depth:</strong> ${feature.geometry.coordinates[2]} km</p>`
      );
    }
  }).addTo(map);

  // Add a legend to the map
  const legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "info legend");
    const depths = [-10, 10, 30, 50, 70, 90];
    const colors = ["#a3f600", "#dcf400", "#f7db11", "#fdb72a", "#fca35d", "#ff5f65"];

    // Loop through depth intervals and generate a label for each color
    for (let i = 0; i < depths.length; i++) {
      div.innerHTML +=
        `<i style="background: ${colors[i]}"></i> ${depths[i]}${depths[i + 1] ? `&ndash;${depths[i + 1]}<br>` : "+"}`;
    }
    return div;
  };
  legend.addTo(map);
});
