import { Component, OnInit, MissingTranslationStrategy } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { Apple } from '../apple';
import { InfoPanelService } from '../info-panel.service';
import { AppleService } from '../apple.service';

import { appleMarker } from '../apple-marker';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})


export class MapComponent implements OnInit {
  appleIcon = L.icon({
    // iconUrl: '../assets/apple-alt-solid.svg',
    iconUrl: '../assets/icons8-apple-48.png',

    iconSize: [25,25]
  });

  AppleMarker = L.Marker.extend({

    options: {
        icon: this.appleIcon
    },

    apple: {},

    setApple: function(apple: Apple) {
        this.apple = apple;
    },

    getApple: function(): Apple{
        return this.apple;
    }

  });

  private map: L.map;
  apples: Apple[] = [];
  markers: L.marker[];
  clusters: L.markercluster;

  constructor(public infoPanelService: InfoPanelService, public appleService: AppleService) { 
  }

  getMap() {
    return this.map;
  }

  getRandomAdjustment(): number {
    return Math.random() * (0.001 - 0.0005) + 0.0005;
  }

  getApples(): void {
    this.appleService.getApples()
        .subscribe(data => {
          this.apples = data;
          console.log(this.apples);
        },
        error => {
          console.log(error);
        });
  }

  createAppleMarkers(this): L.markerClusterGroup {
    var treeIcon = L.icon({
      iconUrl: '../assets/icons8-color-48.png',

      iconSize: [40,40]
    });

    L.DomUtil.TRANSITION = true;
    var clusterMarkers = L.markerClusterGroup({
      maxClusterRadius: 20,
      // zoomToBoundsOnClick: false,
      spiderfyOnMaxZoom: false,
      disableClusteringAtZoom: 17,

      iconCreateFunction: function(cluster) {
        return treeIcon;
      }
    });

    this.appleService.getApples()
      .subscribe(apples => {
        apples.forEach(function(a) {
          // console.log(a);
          // var apple = new Apple(a);
          
          var am = new this.AppleMarker([a["treeLatitude"], a["treeLongitude"]], {});
          if(a.treeLatitude != null && a.treeLongitude != null) {
    
            am.setApple(a);
            am.on('click', function() {
              // console.log(am.getApple().id);
              this.infoPanelService.add(am.getApple());
              this.infoPanelService.showPanel();
              // console.log(this.map.getZoom());
              var zoom = this.map.getZoom();
              if(zoom < this.map.getMaxZoom()) {
                zoom += 1;
              }
              this.map.panTo([am.getApple().treeLatitude, am.getApple().treeLongitude], zoom);
            }, this);
            this.markers.push(am);
            // console.log(this.markers);
          }
        }, this);

    
      clusterMarkers.addLayers(this.markers);
      // console.log(this.markers);
      // L.featureGroup(this.markers)
        // .addTo(this.map);
    });

    return clusterMarkers;
  }
  
  private initMap(): void {
    // Setting location to Boulder
    this.markers = [];
    var p1 = L.latLng(40.149152, -105.378020),
    p2 = L.latLng(39.957245, -105.170137),
    bounds = L.latLngBounds(p1, p2);
    this.map = L.map('map', {
      // maxBounds: bounds
    }).setView([40.0150, -105.2705], 12.5);

    // Historic map layer
    var mapurl = '../assets/Copy of 1937 Aerial Photo_Earth Sciences.png',
        imageBounds = [[40.052809, -105.308255], [39.973041, -105.245940]];

    L.imageOverlay(mapurl, imageBounds, { opacity: 0.6 }).addTo(this.map);

    // World Tile Layer
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //     attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    // }).addTo(map);
    var Esri_WorldTopoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
    }).addTo(this.map)

    // Apple Markers
    this.clusters = this.createAppleMarkers();
    this.map.addLayer(this.clusters);
  }

  ngOnInit() {
    this.initMap();
  }


}