import React from "react";
import { connect } from "react-redux";

import { fetchSensorData } from "./../../actions/sensorActions";


require('./station-item.component.scss');

@connect((store) => {
  return {
    map: store.map.map,
    localization: store.localization.localization,
    station: store.station,
    // ports: store.station.ports,
    // sensors: store.station.sensors,
  }
})
export default class StationItem extends React.Component {
  constructor() {
    super();
    this.state = {
    }
  }
  componentWillMount() {

  }
  componentDidMount() {

  }
  componentWillReceiveProps(nextProps) {

  }
  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }
  componentWillUnmount() {

  }
  onSelect(event) {
    event.stopPropagation();
    this.props.dispatch({type: "SET_STATION_CURRENT", payload: this.props.item.id});
    this.props.dispatch(fetchSensorData(this.props.station.stations[this.props.item.id].coord.x, this.props.station.stations[this.props.item.id].coord.y, this.props.station.stations[this.props.item.id].inside));
  }
  onWatch(event) {
    event.stopPropagation();
    this.props.dispatch({type: "SET_STATION_WATCH", payload: this.props.item.id});
  }
  onLocate(event) {
    event.stopPropagation();
    this.props.dispatch({type: "SET_STATION_WATCH", payload: this.props.item.id});
    this.props.map.setView(new L.LatLng(this.props.item.coord.x, this.props.item.coord.y), this.props.map.getZoom());
  }
  render() {
    let select = "";
    if (this.props.station.watch && this.props.item.id == this.props.station.watch.id) {
      select = " select";
    }
    // const ports = this.props.item.ports.map((portId) => {
    //   return this.props.ports[portId];
    // });
    let inside = this.props.localization.sOutside;
    if (this.props.item.inside) {
      inside = this.props.localization.sInside;
    }
    let active;
    if (this.props.station.active && this.props.station.active.id == this.props.item.id) {
      active = <div className="status green">STREAMING DATA</div>;
    }
    return <div id={"station-list-item-" + this.props.item.id} className={"station-item" + select} onClick={this.onWatch.bind(this)}>
      <div className="name">
        <div>{this.props.item.address + " (" + inside + ")"}</div>
        {active}
      </div>
      <div className="group">
        <div onClick={this.onSelect.bind(this)}>SELECT</div>
        <div onClick={this.onLocate.bind(this)}>LOCATE</div>
      </div>
    </div>;
  }
}
      // <PortThumbnail list={ports} />
