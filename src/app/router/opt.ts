import { Control } from 'ol/control';
import Dialog from "ol-ext/control/Dialog";
import Map from "ol/Map";
import Placemark from 'ol-ext/overlay/Placemark';
import { Coordinate } from 'ol/coordinate';
import { Select } from 'ol/interaction';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { GeoJSON } from 'ol/format';
import { Style, Stroke, Icon, Fill, Text } from 'ol/style';
import { environment } from 'src/environments/environment';
import * as olProj from 'ol/proj';

interface Options {
  title?: string;
  className?: string;
  target?: string;
  map?: Map;
  collapsible?: boolean;
}

export default class opt extends Control {
  _dialog: Dialog;
  _routeDetails: HTMLFieldSetElement;
  _mapClickListner: (p0: any) => any;
  _source: {
    Placemark?: Placemark,
    Element?: HTMLDivElement
  } = {};
  _destination: {
    Placemark?: Placemark,
    Element?: HTMLDivElement
  } = {};
  _routeLayer: VectorLayer = new VectorLayer({
    source: new VectorSource(),
    style: function (f, resolution) {
      console.log(f);
      return [
        new Style({
          stroke: new Stroke({
            color: "red",
            width: 6,
            lineCap: "round",
            lineJoin: "round"
          })
        }),
        new Style({
          stroke: new Stroke({
            color: "blue",
            width: 2,
            lineDash: [3, 10],
            lineCap: "round",
            lineJoin: "round"
          })
        })]
    }
  });
  constructor(
    private options: Options,
    public element: HTMLElement = document.createElement("div")
  ) {
    super({
      element: element,
      target: options.target,
    });
    let _self = this;
    element.className =
      "ol-control " + (options.className || "optimalpath-tool");
    // Show on click
    var button = document.createElement("button");
    button.setAttribute("type", "button");
    button.setAttribute("title", options.title);
    button.innerHTML = `<img src="assets/Route.png" style="height: 1.0em;
    width: 1.0em;" />`;
    button.addEventListener("click", () => {
      if (options.map) {
        _self._dialog.show();
        _self.options.map.addControl(_self._dialog);
        _self.options.map.addLayer(_self._routeLayer);
        this._routeDetails.setAttribute("style", "display:none;");
        _self.registerMapClickEvent();
      }
    });
    element.appendChild(button);
    _self._dialog = new Dialog({
      hideOnClick: false,
      className: "optimalpath-dialog",
      closeBox: false,
    });
    _self._dialog.setContent({
      content: _self.getDialogContent(),
      title: "Find Optimal Path",
      buttons: { cancel: "Close" },
    });
    _self._dialog.on("button", (e: any) => {
      if (e.button == "cancel") {
        _self.ClearEventsOnDialogClose();
      }
    });
    if (options.map) options.map.addControl(_self._dialog);
    _self.options.map.addLayer(_self._routeLayer);
    this._routeDetails.setAttribute("style", "display:none;");
    _self._dialog.show();
    _self.registerMapClickEvent();
    console.log("This is the BETA Version. The Application is still in development mode")
    console.log("Algorithm and Queries developed by Sudarshan(A Machine Learning Engineer and a Full Stack Web Developer)")
  }

  getDialogContent(): HTMLDivElement {
    let _dc = document.createElement("div");
    _dc.setAttribute("style", "max-width:270px;max-height: 40vh; overflow:auto;");
    let _row = document.createElement("div");
    _row.className = "row";
    _dc.append(_row);
    let _col = document.createElement("div");
    _row.append(_col);
    _col.className = "col-sm-12";
    _col.innerHTML = `<p><b> Click on the map to add start
     & end point to get optimal path or enter the Coordinates Manually.</b></p>`;


     let _start = document.createElement("div");
     _start.setAttribute("style", "color:green;");
     _row.append(_start);
    _start.className = "col-sm-12";
    _start.innerHTML = `<p><b>Source Point:
     </b></p>`;
     var Latitude = document.createElement('input');
     Latitude.setAttribute("id","Lat1");
     Latitude.setAttribute("type","number")
     Latitude.placeholder = "Longitude";
     _start.append(Latitude);
    var Longitude = document.createElement('input');
    Longitude.setAttribute("type","number");
    Longitude.setAttribute("id","Log1");
    Longitude.placeholder = "Latitude";
   _start.append(Longitude);

   
   
   let _end = document.createElement("div");
    _end.setAttribute("style", "color:red;");
    _row.append(_end);
    _end.className = "col-sm-13";
    _end.innerHTML = `<p><b>Destination Point:
    </b></p>`;
    var Latitude = document.createElement('input');
    Latitude.setAttribute("id","Lat2");
    Latitude.setAttribute("type","number")
    Latitude.placeholder = "Longitude";
    _end.append(Latitude);
    var Longitude = document.createElement('input');
    Longitude.setAttribute("type","number")
    Longitude.setAttribute("id","Log2");
    Longitude.placeholder = "Latitude";
    _end.append(Longitude);


          let submitbtn = document.createElement("button");
          submitbtn.setAttribute("type","button");
          submitbtn.className = "btn btn-outline-secondary";
          submitbtn.innerHTML = "Find Path";
          _row.append(submitbtn);
          let _self = this;
          submitbtn.onclick  =   function myfunction(evt) {
            var Lat2 = (<HTMLInputElement>document.getElementById("Lat2",)).value
            var Log2 = (<HTMLInputElement>document.getElementById("Log2",)).value
            var Lat1 = (<HTMLInputElement>document.getElementById("Lat1",)).value
            var Log1 = (<HTMLInputElement>document.getElementById("Log1",)).value
            var fl11 = parseFloat(Log1)
            var fl12 = parseFloat(Lat1)
            var fl21 = parseFloat(Log2)
            var fl22 = parseFloat(Lat2)
            let coord = [fl12,fl11];
            if (_self._destination.Placemark) {
              _self.options.map.removeOverlay(_self._destination.Placemark);
            }
            if (_self._source.Placemark) {
              _self.options.map.removeOverlay(_self._source.Placemark);
            }
            let proj_coord = olProj.transform(coord, 'EPSG:4326', 'EPSG:3857');
              _self._source.Placemark = new Placemark({
                color: "blue",
                backgroundColor: "blue",
                contentColor: "blue",
                // onshow: function () {
                //   console.log("Start location added on: ", new Date());
                // },
                autoPan: true,
                autoPanAnimation: { duration: 250 }
              });
              _self._source.Placemark.setClassName("blazon");
              _self.options.map.addOverlay(_self._source.Placemark);
              _self._source.Placemark.show(proj_coord,
                "<i class='fa fa-map-marker'></i>");
              _self._source.Element.innerHTML = `<div class='col-sm-12'
                 style="font-weight:bold; color:blue;">
               <i class='fa fa-map-marker'></i>  Start Location : `
                + coord[0].toFixed(4) + ` | ` + coord[1].toFixed(4) + `
                </div>`;
              let coord2 = [fl22,fl21]  
              let proj_coord2 = olProj.transform(coord2, 'EPSG:4326', 'EPSG:3857');
              _self._destination.Placemark = new Placemark({
                color: "red",
                backgroundColor: "red",
                contentColor: "red",
                // onshow: function () {
                //   console.log("End location added on:", new Date());
                // },
                autoPan: true,
                autoPanAnimation: { duration: 250 }
              });
              _self._destination.Placemark.setClassName("blazon");
              _self.options.map.addOverlay(_self._destination.Placemark);
              _self._destination.Placemark.show(proj_coord2,
                "<i class='fa fa-map-marker'></i>");

              _self._destination.Element.innerHTML = `<div class='col-sm-12' 
                style="font-weight:bold;color:red;">
                <i class='fa fa-map-marker'></i>  End Location : `
                + coord2[0].toFixed(4) + ` | ` + coord2[1].toFixed(4) + `
                 </div>`;
            if (_self._source.Placemark
              && _self._destination.Placemark) {
                _self.startRouting();
            }
          }   

     





    this._source.Element = document.createElement("div");
    // this._source.Element.innerHTML = "<div class='col-sm-12'>No start point added!</div>"
    this._source.Element.className = "row";
    _dc.append(this._source.Element);

    this._destination.Element = document.createElement("div");
    // this._destination.Element.innerHTML = "<div class='col-sm-12'>No end point added!</div>"
    this._destination.Element.className = "row";
    _dc.append(this._destination.Element);
    this._routeDetails = document.createElement("fieldset");
    _dc.append(this._routeDetails);
    return _dc;
  }
  registerMapClickEvent() {
    let _self = this;
    if (!this._mapClickListner) {
      this._mapClickListner = (evt: any) => {
        _self.handleMapClickEvt(evt);
      }
      this.options.map.on("click", this._mapClickListner);
      
    }
  }
  unRegisterMapClickEvent() {
    if (this._mapClickListner) {
      this.options.map.un("click",
        this._mapClickListner);
      this._mapClickListner = undefined;
    }
  }
  handleMapClickEvt(evt: any) {
    let coord = evt.coordinate;
    if (!this._source.Placemark) {
      this._source.Placemark = new Placemark({
        color: "blue",
        backgroundColor: "blue",
        contentColor: "blue",
        // onshow: function () {
        //   console.log("Start location added on: ", new Date());
        // },
        autoPan: true,
        autoPanAnimation: { duration: 250 }
      });
      this._source.Placemark.setClassName("blazon");
      this.options.map.addOverlay(this._source.Placemark);
      this._source.Placemark.show(coord,
        "<i class='fa fa-map-marker'></i>");
      let proj_coord = olProj.transform(coord, 'EPSG:3857', 'EPSG:4326')
      this._source.Element.innerHTML = `<div class='col-sm-12'
         style="font-weight:bold; color:blue;">
       <i class='fa fa-map-marker'></i>  Start Location : `
        + proj_coord[0].toFixed(4) + ` | ` + proj_coord[1].toFixed(4) + `
        </div>`;
    } else {
      if (this._destination.Placemark) {
        this.options.map.removeOverlay(this._destination.Placemark);
      }
      this._destination.Placemark = new Placemark({
        color: "red",
        backgroundColor: "red",
        contentColor: "red",
        // onshow: function () {
        //   console.log("End location added on:", new Date());
        // },
        autoPan: true,
        autoPanAnimation: { duration: 250 }
      });
      this._destination.Placemark.setClassName("blazon");
      this.options.map.addOverlay(this._destination.Placemark);
      this._destination.Placemark.show(coord,
        "<i class='fa fa-map-marker'></i>");
      let proj_coord = olProj.transform(coord, 'EPSG:3857', 'EPSG:4326')
      this._destination.Element.innerHTML = `<div class='col-sm-12' 
        style="font-weight:bold;color:red;">
        <i class='fa fa-map-marker'></i>  End Location : `
        + proj_coord[0].toFixed(4) + ` | ` + proj_coord[1].toFixed(4) + `
         </div>`;
    }
    if (this._source.Placemark
      && this._destination.Placemark) {
      this.startRouting();
    }
  }
  startRouting() {
    let url_params = "?start="
      + olProj.transform(this._source.Placemark.getPosition(), 'EPSG:3857', 'EPSG:4326')
      + "&end=" + olProj.transform(this._destination.Placemark.getPosition(), 'EPSG:3857', 'EPSG:4326')
    //+ "?steps=true&geometries=geojson";
    fetch(environment.ROUTE_API_URL + url_params)
      .then((res) => {
        return res.json();
      }).then((gjson) => {
        // if (gjson.code == 'Ok') {
        //   if (gjson.routes &&
        //     gjson.routes.length > 0) {
        this._routeLayer.getSource().clear();
        this._routeDetails.innerHTML = "<legend>Route Summary<legend>";
        if (gjson.route.length > 0) {
          let total_dist = 0.0, total_time = 0.0;
          for (let r of gjson.route) {
            let geom = new GeoJSON().readGeometry(r.geojson,
              { dataProjection: "EPSG:4326", featureProjection: 'EPSG:3857' });
            let _f = new Feature(geom);
            this._routeLayer.getSource().addFeature(_f);
            total_dist += parseFloat(r.leng_km);
            total_time += parseFloat(r.minutes);
          }

          let _row = document.createElement("div");
          _row.className = "row";
          this._routeDetails.append(_row);
          let col = document.createElement("div");
          col.className = "col-sm-12";
          col.innerHTML = "<b> Distance : </b>" + (total_dist).toFixed(2) + " km.";
          _row.append(col);
          _row = document.createElement("div");
          _row.className = "row";
          this._routeDetails.append(_row);
          col = document.createElement("div");
          col.className = "col-sm-12";
          col.innerHTML = "<b> Duration : </b>" + (total_time/60).toFixed(2) + " hours.";
          _row.append(col);
          let btnSpans = document.createElement("div");
          btnSpans.className = "col-sm-12";
          btnSpans.setAttribute("style", "text-align: right;");
          let btnClose = document.createElement("button");
          btnClose.className = "btn btn-outline-secondary";
          btnClose.innerHTML = "Clear Route";
          let _self = this;
          btnClose.addEventListener("click", (evt) => {
            _self._routeLayer.getSource().clear();
            _self._routeDetails.innerHTML = "";
            _self._source.Element.innerHTML = "";
            _self.options.map.removeOverlay(_self._source.Placemark);
            _self._source.Placemark = undefined;
            _self._destination.Element.innerHTML = "";
            _self.options.map.removeOverlay(_self._destination.Placemark);
            _self._destination.Placemark = undefined;
            _self._routeDetails.setAttribute("style", "display:none;");
            
          });
          btnSpans.append(btnClose);
          _row = document.createElement("div");
          _row.className = "row";
          _row.append(btnSpans);
          this._routeDetails.append(_row);
          this._routeDetails.setAttribute("style", "display:block;");
          this.options.map.getView()
            .fit(this._routeLayer.getSource()
              .getExtent(), { size: this.options.map.getSize() });

        }
      }).catch((error) => {
        console.log(error);
        alert(error);
      });
  }
  ClearEventsOnDialogClose() {
    this.unRegisterMapClickEvent();
    this.options.map.removeLayer(this._routeLayer);
    this._routeLayer.getSource().clear();
    this._routeDetails.innerHTML = "";
    this._routeDetails.setAttribute("style", "display:none;");
    this.options.map.removeControl(this._dialog);
    if (this._source.Placemark) {
      this.options.map.removeOverlay(this._source.Placemark);
      this._source.Placemark = undefined;
    }
    if (this._destination.Placemark) {
      this.options.map.removeOverlay(this._destination.Placemark);
      this._destination.Placemark = undefined;
    }
    this._destination.Element.innerHTML = "";
    this._source.Element.innerHTML = "";
  }

}
