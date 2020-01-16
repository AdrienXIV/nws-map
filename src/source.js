// import 'ol/ol.css';
// import Map from 'ol/Map';
// import View from 'ol/View';
// import {defaults as defaultInteractions, DragRotateAndZoom} from 'ol/interaction';
// import TileLayer from 'ol/layer/Tile';
// import OSM from 'ol/source/OSM';
// import {transform} from 'ol/proj';
//
// // coordonnées récupérées depuis https://www.latlong.net/convert-address-to-lat-long.html
// var nws = transform([1.066530, 49.428470], 'EPSG:4326', 'EPSG:3857');
//
// var map = new Map({
//   interactions: defaultInteractions().extend([
//     new DragRotateAndZoom()
//   ]),
//   layers: [
//     new TileLayer({
//       source: new OSM()
//     })
//   ],
//   target: 'carteNWS',
//   view: new View({
//     projection: 'EPSG:3857',
//     center: nws,
//     zoom: 14
//   })
// });

import './source.scss';
import 'ol/ol.css';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import View from 'ol/View';
import Overlay from 'ol/Overlay';
import GeoJSON from 'ol/format/GeoJSON';
import {
  Tile as TileLayer,
  Vector as VectorLayer
} from 'ol/layer';
import {
  OSM,
  Vector as VectorSource
} from 'ol/source';
import {
  Circle as CircleStyle,
  Fill,
  Stroke,
  Style,
  Text
} from 'ol/style';
import {
  transform
} from 'ol/proj';
import * as olCoordinate from 'ol/coordinate';
import Point from 'ol/geom/Point';
import $ from "jquery";




$.ajax({
  url: 'http://localhost:8080/coordonnees',
  type: 'GET',
  dataType: 'json',
  success: function (response) {
    var features = response;

    features.forEach(function (element) {
      // transformations des coordonnees de la réponse du serveur
      element.geometry.coordinates = transform(element.geometry.coordinates, 'EPSG:4326', 'EPSG:3857')
    });

    var geojsonObject = {
      'type': 'FeatureCollection',
      'crs': {
        'type': 'name',
        'properties': {
          'name': 'EPSG:3857'
        }
      },
      'features': features
    };

    var imagePoint = new CircleStyle({
      radius: 3.5,
      fill: new Fill({
        color: 'rgba(255,0,0,0.2)'
      }),
      stroke: new Stroke({
        color: 'red',
        width: 1
      })
    });
    var imageHighlightPoint = new CircleStyle({
      radius: 4,
      fill: new Fill({
        color: 'rgba(255,0,0,0.7)'
      }),
      stroke: new Stroke({
        color: 'red',
        width: 1
      })
    });

    var styles = {
      'Point': new Style({
        image: imagePoint
      }),
      'HighlightPoint': new Style({
        image: imageHighlightPoint,
        text: new Text({
          offsetY: -15,
          font: '18px Calibri,sans-serif',
          fill: new Fill({
            color: '#000',
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 4
          }),
          text: ''
        })
      })
    };

    var styleFunction = function (feature) {
      return styles[feature.getGeometry().getType()];
    };

    // Chargement des points
    var vectorSource = new VectorSource({
      features: (new GeoJSON()).readFeatures(geojsonObject)
    });

    var vectorLayer = new VectorLayer({
      source: vectorSource,
      style: styleFunction
    });

    /**
     * Elements that make up the popup.
     */
    var container = document.getElementById('popup');
    var content = document.getElementById('popup-content');
    var closer = document.getElementById('popup-closer');

    /**
     * Create an overlay to anchor the popup to the map.
     */
    var overlay = new Overlay({
      element: container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });

    /**
     * Add a click handler to hide the popup.
     * @return {boolean} Don't follow the href.
     */
    closer.onclick = function () {
      overlay.setPosition(undefined);
      closer.blur();
      return false;
    };

    var map = new Map({
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer
      ],
      overlays: [overlay],
      target: 'carteNWS',
      view: new View({
        center: transform([1.066530, 49.428470], 'EPSG:4326', 'EPSG:3857'),
        zoom: 12
      })
    });

    var selected = null;
    map.on('pointermove', function (e) {
      if (selected !== null) {
        selected.setStyle(undefined);
        selected = null;
      }

      map.forEachFeatureAtPixel(e.pixel, function (f) {
        selected = f;

        var geometry = f.getGeometry();
        var style = styles['Highlight' + geometry.getType()];
        style.getText().setText(f.get('nom'));
        f.setStyle(style);
        return true;
      });
    });



    /**
     * Add a click handler to the map to render the popup.
     */
    map.on('singleclick', function (evt) {
      map.forEachFeatureAtPixel(evt.pixel, function (f) {
        //résupérer position du click pour afficher la popoup dessus
        var coordinate = evt.coordinate;
        $('#popup-content').css('text-align', 'justify');
        let entreprises = [];
        f.getProperties().entreprises.forEach(element => {
          entreprises.push({
            nom: element.nom,
            codeAPE: element.codeAPE,
            secteur: element.secteur,
          });
        });
        //ajout du texte dans la popup
        content.innerHTML = '<p>' + f.get('adresse') + ', ' + f.get('ville') + ', ' + f.get('codepostal') + '</p>';
        content.innerHTML += '<p>' + f.get('description') + '</p>';
        content.innerHTML += '<p>Entreprises :</p>';
        entreprises.forEach(element => {
          content.innerHTML += '<p>&nbsp;&nbsp; - ' + element.nom  + '</p>';
          content.innerHTML += '<BR>';
        });

        //affichage
        overlay.setPosition(coordinate);
      });
    });
  }
});