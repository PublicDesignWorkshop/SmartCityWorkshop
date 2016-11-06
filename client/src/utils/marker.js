import * as L from 'leaflet';
import './marker.scss';
import { google10Color } from "./../utils/color";
import store from "./../store/store";
import { fetchSensorData } from "./../actions/sensorActions";


export function createStationMarker(props) {
  // let sensors = "";
  // props.station.ports.forEach((portId) => {
  //   sensors += '<div class="thumbnail" style="background-color: ' + google10Color(props.sensors[props.ports[portId].sensor].id) + '">' + props.sensors[props.ports[portId].sensor].name.charAt(0).toUpperCase() + '</div>';
  // });

  // const icon = new L.divIcon({
  //   popupAnchor: new L.Point(0, 0),
  //   className: "marker-station",
  //   html: '<div class="group" style="opacity: ' + opacity + '">' + sensors + '</div><div class="update">~60s</div>',
  // });
  let marker;
  if (props.active) {

    let icon = L.divIcon({
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      className: 'station-active',
      html: '<div class="wave1"></div><div class="wave2"></div>',
    });
    marker = new L.marker(new L.LatLng(props.station.coord.x, props.station.coord.y), {
      icon: icon,
    });

    // marker = new L.circle(new L.LatLng(props.station.coord.x, props.station.coord.y), 4, {
    //   stroke: true,
    //   color: "#449d44",
    //   weight: 2,
    //   opacity: 1,
    //   fillColor: "#449d44",
    //   fillOpacity: 0.75,
    // });
  } else {
    let opacity = 0.5;
    if (props.watch) {
      opacity = 1;
    }
    marker = new L.circle(new L.LatLng(props.station.coord.x, props.station.coord.y), 4, {
      stroke: true,
      color: "#ffffff",
      weight: 2,
      opacity: opacity,
      fillColor: "#ffffff",
      fillOpacity: opacity * 0.75,
    });
  }

  // #449d44 #5cb85c
  marker.on('click', function() {
    // if (store.getState().station.current == null) {
    //   store.dispatch({type: "SET_STATION_WATCH", payload: props.station.id});
    //   document.querySelector("#station-list-item-" + props.station.id).scrollIntoView();
    // } else {
    // }

    store.dispatch({type: "SET_STATION_CURRENT", payload: props.station.id});
    store.dispatch(fetchSensorData(store.getState().station.stations[props.station.id].coord.x, store.getState().station.stations[props.station.id].coord.y, store.getState().station.stations[props.station.id].inside));

  });

  return marker;
}
