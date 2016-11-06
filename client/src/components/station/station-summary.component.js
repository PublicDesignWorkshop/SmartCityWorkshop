import React from "react";
import { connect } from "react-redux";

import SensorSummary from "./../sensor/sensor-summary.component";

require('./station-summary.component.scss');

@connect((store) => {
  return {
    localization: store.localization.localization,
    station: store.station,
    sensor: store.sensor,
  }
})
export default class StationSummary extends React.Component {
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
  onSetActive(active, event) {
    if (active) {
      this.props.dispatch({type: "SET_STATION_ACTIVE", payload: this.props.station.current.id});

    } else {
      this.props.dispatch({type: "SET_STATION_ACTIVE", payload: null});
    }
  }
  render() {
    let inside = this.props.localization.sOutside;
    if (this.props.station.current.inside) {
      inside = this.props.localization.sInside;
    }
    let active = <button className="orange" onClick={this.onSetActive.bind(this, true)}>IDLE (Click to Start Stream)</button>;
    if (this.props.station.active && this.props.station.active.id == this.props.station.current.id) {
      active = <button className="green" onClick={this.onSetActive.bind(this, false)}>STREAMING DATA (Click to Stop Stream)</button>;
    }
    let sensors = this.props.sensor.sensors.map((sensor) => {
      if(!this.props.station.current) return null;
      if (sensor.latitude == this.props.station.current.coord.x && sensor.longitude == this.props.station.current.coord.y && sensor.inside == this.props.station.current.inside) {
        return <SensorSummary key={"sensor-" + sensor.type + sensor.latitude.toString() + sensor.longitude.toString()} item={sensor} />;
      }
      return null;
    });

    return <div className="station-summary">
      <div className="title">
        <div>{this.props.station.current.address + " (" + inside + ")"}</div>
        {active}
      </div>
      <div className="body">
        {sensors}
      </div>
    </div>;
  }
}
