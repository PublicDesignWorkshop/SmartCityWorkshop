import React from "react";
import ReactDom from "react-dom";
import { connect } from "react-redux";

import Map from "./../map/map.component";
import Overlay from "./../layout/overlay.component";
import { fetchStations } from "./../../actions/stationActions";


require('./dashboard.component.scss');


@connect((store) => {
  return {
    socket: store.map.socket,
    localization: store.localization.localization,
  }
})
export default class Dashboard extends React.Component {
  constructor() {
    super();
    this.connection = null;
  }
  componentWillMount() {
    this.props.dispatch(fetchStations());

    const socket = new WebSocket('ws://127.0.0.1:1880/ws/sensors');
    socket.onopen = function() {
      this.send(null);
    };
    // listen to onmessage event
    socket.onmessage = event => {
      // add the new message to state
      this.props.dispatch({type: "ADD_SENSOR_DATA", payload: JSON.parse(event.data)});
    };
    this.props.dispatch({type: "SET_SOCKET", payload: socket});
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
  render() {
    return (
      <div className="dashboard">
        <Map />
        <Overlay location={this.props.location}/>
      </div>
    )
  }
}
