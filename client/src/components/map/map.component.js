import React from "react";
import ReactDom from "react-dom";
import { connect } from "react-redux";
import * as L from 'leaflet';
import serverConfig from "./../../config/server";
// import 'googletile';

import { createStationMarker } from "./../../utils/marker";

require('./map.component.scss');


@connect((store) => {
  return {
    map: store.map.map,
    tile: store.map.tile,
    localization: store.localization.localization,
    station: store.station,
  }
})
export default class Map extends React.Component {
  constructor() {
    super();
  }
  componentWillMount() {

  }
  componentDidMount() {
    if (!this.map) {
      this.map = L.map("map", {
          zoomControl: false,
          closePopupOnClick: false,
          doubleClickZoom: false,
          touchZoom: true,
          zoomAnimation: true,
          markerZoomAnimation: true,
          minZoom: 19,
          maxZoom: 19,
          maxBounds: L.latLngBounds([33.770007, -84.391469], [33.772261, -84.386009]),
      }).setView(new L.LatLng(33.771233, -84.388849), 18);
      this.props.dispatch({type: "SET_ACTIVE_MAP", payload: this.map});
      this.map.invalidateSize(false);
      this.map.whenReady(this.afterRenderMap.bind(this));

      // this.map.addLayer(new L.Google("HYBRID"));
    }
  }
  componentWillReceiveProps(nextProps) {
    this.markers.clearLayers();
    nextProps.station.list.forEach((stationId) => {
      let watch = false;
      let active = false;
      if (nextProps.station.watch && nextProps.station.watch.id == stationId) {
        watch = true;
      }
      if (nextProps.station.active && nextProps.station.active.id == stationId) {
        active = true;
      }
      this.markers.addLayer(createStationMarker({active: active, watch: watch, station: nextProps.station.stations[stationId]}));
    });
  }
  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }
  componentWillUnmount() {

  }
  afterRenderMap() {
    let host;
    if (location.pathname == "/") {
      host = location.origin
    } else {
      host = location.origin + location.pathname;
    }

    // const tile = L.tileLayer("//api.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png256?access_token=pk.eyJ1IjoiY29uY3JldGUtanVuZ2xlIiwiYSI6InViLW5INU0ifQ.radc95S2bnienvUpDkl49A", {
    //     minZoom: 19,
    //     maxZoom: 19,
    // });
    const tile = L.tileLayer(host + serverConfig.uMap + "{z}/{x}/{y}.png", {
        minZoom: 19,
        maxZoom: 19,
    });

    tile.addTo(this.map);
    this.props.dispatch({type: "SET_ACTIVE_TILE", tile: tile});
    this.markers = new L.layerGroup();
    this.map.addLayer(this.markers);
  }
  render() {
    return null;
  }
}
