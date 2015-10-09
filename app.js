var map = L.map('map', {
  minZoom: 13,
  maxZoom: 18,
  defaultExtentControl: true,
  attributionControl: false
}).setView([38.328393, -84.544945], 14);

// Attribution
L.control.attribution().addAttribution('<a href="http://www.gscplanning.com">GSCPC</a>, DGI, USGS, FPB, LINK-GIS, Hardin County, Boone County').addTo(map);
    
var base = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
  subdomains: 'abcd'
}).addTo(map);

var wma = {
  Aerial: L.esri.tiledMapLayer({
    url: "http://gis.gscplanning.com/arcgis/rest/services/wma_aerial2012_hs/MapServer"
  }),
  Slope: L.esri.tiledMapLayer({
    url: "http://gis.gscplanning.com/arcgis/rest/services/wma_slope_hs/MapServer",
    maxNativeZoom: 17,
    maxZoom: 18
  })
};

wma.Aerial.addTo(map);

// Feature Layers

var wmaPotentialTrails

var info = L.control();

info.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
};

info.update = function(props) {
  this._div.innerHTML = (props ? '<h4>' + props.label + '</h4><hr>' + 
    '<b>Type: </b>' + props.type.charAt(0).toUpperCase() + props.type.substring(1) + ' Trail<br/><b>Distance (mi): </b>' + props.distMiles + '<br /><b>Description: </b>' 
    + props.description:'<b>Hover over or click a proposed trail for more info</b>');
};
info.addTo(map);

function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 6,
    opacity: 0.8
  });

  if (!L.Browser.ie && !L.Browser.opera) {
      layer.bringToFront();
  }

  info.update(layer.feature.properties);
}

function resetHighlight(e) {
  wmaPotentialTrails.resetStyle(e.target);
  // info.update();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
  info.update(layer.feature.properties);
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
}

function trailTypeColor(d) {
  return d == "full" ? "#FF9900" :
    d == "partial" ? "#FFFF99" :
    "#CC0033";
}

function wmaPotentialTrailsStyle(feature) {
  return {
    color: trailTypeColor(feature.properties.type),
    weight: 4,
    opacity: 0.8
  };
}

wmaPotentialTrails = new L.GeoJSON.AJAX("wma_potentialTrails.geojson", {
  style: wmaPotentialTrailsStyle,
  onEachFeature: onEachFeature
}).addTo(map);

var wmaWestPathsStyle = {
  color: "#8353FC",
  weight: 1,
  opacity: 0.75,
  fillOpacity: 0.5,
  fillColor: "#8353FC"
  }

var wmaPaths = new L.GeoJSON.AJAX("wma_westPaths.geojson", {
  style: wmaWestPathsStyle
})

var wmaLineStyle = {
  color: "#FFFFFF",
  weight: 2.5,
  opacity: 0.75,
  dashArray: "5, 10, 2.5"
}

var wmaLine = new L.GeoJSON.AJAX("wma_ln.geojson", {
  style: wmaLineStyle
}).addTo(map);

var mapFeatures = {
  "Existing Paths": wmaPaths,
  "WMA Boundary": wmaLine
}

L.control.layers(wma,mapFeatures,{
  collapsed:false, 
  autoZIndex: true, 
  position: 'bottomright'
}).addTo(map);

// Measure things!
var measureControl = L.control.measure({
  position: 'bottomleft',
  activeColor: '#9b59b6',
  completedColor: '#8e44ad'
});
measureControl.addTo(map);

// Draw lines
var drawPaths = new L.FeatureGroup();
map.addLayer(drawPaths);
var options = {
  position: 'bottomleft',
  draw: {
    polyline: {
      shapeOptions: {
        color: '#e74c3c',
        weight: 6,
        opacity: 0.8
      },
      metric: false
    },
    polygon: false,
    circle: false,
    marker: false,
    rectangle: false
  },
  edit: {
    featureGroup: drawPaths
  }
};
var drawControl = new L.Control.Draw(options);
map.addControl(drawControl);
map.on('draw:created', function(e){
  var layer = e.layer;
  drawPaths.addLayer(layer);
})