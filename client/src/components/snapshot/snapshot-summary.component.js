import React from "react";
import { connect } from "react-redux";
import moment from 'moment';
import serverConfig from "./../../config/server";

import { google10Color } from "./../../utils/color";


require('./snapshot-summary.component.scss');

@connect((store) => {
  return {
    localization: store.localization.localization,
    station: store.station,
    snapshot: store.snapshot,
  }
})
export default class SnapshotSummary extends React.Component {
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
  onClick(event) {
    this.props.dispatch({type: "SET_CURRENT_SNAPSHOT", payload: this.props.item});
  }
  render() {
    const sensors = this.props.item.sensors.map((sensor) => {
      const style = {
        backgroundColor: google10Color(sensor.type.charCodeAt(0)),
      }
      return <div className="thumbnail" style={style} key={"sensor-" + sensor.type}>{sensor.type.toUpperCase()}</div>;
    });

    return <div className="snapshot-summary" onClick={this.onClick.bind(this)} id={"snapshot-" + (this.props.item.timestamp)}>
      <div className="title">
        {moment(this.props.item.timestamp).format(serverConfig.sUIDateFormat)}
      </div>
      <div className="sensors">
        {sensors}
      </div>
    </div>;
  }
}
