import './source.scss';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {
  defaults as defaultInteractions,
  DragRotateAndZoom
} from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {
  transform
} from 'ol/proj';
import {
  Fill,
  Stroke,
  Circle,
  Style
} from 'ol/style';
import MultiPoint from 'ol/geom/MultiPoint';


// coordonnées récupérées depuis https://www.latlong.net/convert-address-to-lat-long.html
//var nws = transform([1.066530, 49.428470], 'EPSG:4326', 'EPSG:3857');
var place = [
  [1.066530, 49.428470, '#8959A8'],
  [1.0658973, 49.4283412],
  [1.1199897, 49.4511544]
]
var highlightStyle = new Style({
  fill: new Fill({
    color: 'red',
    width: 3
  }),
  stroke: new Stroke({
    color: 'red',
    width: 3
  })
});

var nws = ol.proj.fromLonLat([1.066530, 49.428470]);
var view = new ol.View({
  center: nws,
  zoom: 12 // 5
});

var vectorSource = new ol.source.Vector({});
var places = [
  [1.0615, 49.4134, 'http://maps.google.com/mapfiles/ms/micons/blue.png', '#8959A8'],
  [1.06453,49.4223, 'http://maps.google.com/mapfiles/ms/micons/blue.png', '#4271AE'],
  [1.1199897, 49.4511544, 'http://maps.google.com/mapfiles/ms/micons/blue.png', [113, 140, 0]],
];

var features = [];
for (var i = 0; i < places.length; i++) {
  var iconFeature = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.transform([places[i][0], places[i][1]], 'EPSG:4326', 'EPSG:3857')),
  });


  /* from https://openlayers.org/en/latest/examples/icon-color.html
    rome.setStyle(new ol.style.Style({
      image: new ol.style.Icon(({
       color: '#8959A8',
       crossOrigin: 'anonymous',
       src: 'https://openlayers.org/en/v4.6.5/examples/data/dot.png'
      }))
    })); */

  var oldStyle = new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 0.5],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      src: places[i][2],
      color: 'red',
      crossOrigin: 'anonymous',
    })
  });
  var newStyle = new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 0.5],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      src: places[i][2],
      color: places[i][3],
      crossOrigin: 'anonymous',
    })
  });
  iconFeature.setStyle(oldStyle);
  vectorSource.addFeature(iconFeature);
}



var vectorLayer = new ol.layer.Vector({
  source: vectorSource,
  updateWhileAnimating: true,
  updateWhileInteracting: true,
});

var map = new ol.Map({
  target: 'map',
  view: view,
  layers: [
    new ol.layer.Tile({
      preload: 3,
      source: new ol.source.OSM(),
    }),
    vectorLayer,
  ],
  loadTilesWhileAnimating: true,
});


var selected = null;
var status = document.getElementById('status');

map.on('pointermove', function(e) {
  if (selected !== null) {
    selected.setStyle(oldStyle);
    selected = null;
  }

  map.forEachFeatureAtPixel(e.pixel, function(f) {
    selected = f;
    f.setStyle(newStyle);
    return true;
  });

  if (selected) {
    status.innerHTML = '&nbsp;Hovering: ' + selected.get('name');
  } else {
    status.innerHTML = '&nbsp;';
  }
});
