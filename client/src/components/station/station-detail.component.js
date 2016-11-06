import React from "react";
import { connect } from "react-redux";

import SensorDetail from "./../sensor/sensor-detail.component";
import SnapshotList from "./../snapshot/snapshot-list.component";
import { fetchSnapshots } from "./../../actions/snapshotActions";

require('./station-detail.component.scss');

@connect((store) => {
  return {
    localization: store.localization.localization,
    station: store.station,
    sensor: store.sensor,
  }
})
export default class StationDetail extends React.Component {
  constructor() {
    super();
    this.state = {

    }
  }
  componentWillMount() {

  }
  componentDidMount() {
    this.props.dispatch(fetchSnapshots(this.props.station.current.coord.x, this.props.station.current.coord.y));
    this.props.dispatch({type: "RESET_TIME_CURRENT"});
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.station.current.coord.x != nextProps.station.current.coord.x && this.props.station.current.coord.y != nextProps.station.current.coord.y) {
      this.props.dispatch(fetchSnapshots(nextProps.station.current.coord.x, nextPropsstation.current.coord.y));
    }
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
  onSnapshot(event) {
    setTimeout(function() {
      document.querySelector("#snapshot-" + (this.props.sensor.timecurrent)).scrollIntoView();
    }.bind(this), 250);
    this.props.dispatch({type: "ADD_SNAPSHOT", payload: {station: this.props.station.current, timestamp: this.props.sensor.timecurrent}});
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
        return <SensorDetail key={"sensor-" + sensor.type + sensor.latitude.toString() + sensor.longitude.toString()} item={sensor} />;
      }
      return null;
    });

    let button;
    if (this.props.sensor.timecurrent) {
      button = <button className="red" onClick={this.onSnapshot.bind(this)}>SNAPSHOT WHITE AREA</button>;
    }

    return <div className="station-detail">
      <div className="title">
        <div>{this.props.station.current.address + " (" + inside + ")"}</div>
        {active}
        {button}
      </div>
      <div className="body">
        {sensors}
        <div className="split"></div>
        <SnapshotList />
      </div>
    </div>;
  }
}
