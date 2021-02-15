import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import Map from "ol/Map";
import View from "ol/View";
import opt from './router/opt';
import * as proj from 'ol/proj';
@Component({
  selector: 'app-root',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css',"../../node_modules/ol/ol.css","../../node_modules/ol-ext/dist/ol-ext.css"]
})
export class AppComponent implements OnInit {
  _basemap: TileLayer;
  _map: Map;
  title = "Routing";
  year = new Date().getFullYear();
  constructor() { }

  ngOnInit() {
    this._basemap =  new TileLayer({
          source: new XYZ({
            url: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            crossOrigin: "anonymus",
          })
    });
    this._map = new Map({
      target: "ol_map",
      layers: [
        this._basemap,
      ],
      view: new View({
        center:  proj.fromLonLat([79.7819188,11.7466706]),
        zoom: 10,
      }),
    });

    let ctrl = new opt(
      {
        title: "Optimal Path Tool",
        map: this._map,
      }
    );
    this._map.addControl(ctrl);
  }

}

