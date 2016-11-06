import React from "react";
import ReactDom from "react-dom";
import { connect } from "react-redux";
import Immutable from 'seamless-immutable';

import StationItem from "./station-item.component";

require('./station-list.component.scss');

@connect((store) => {
  return {
    localization: store.localization.localization,
    station: store.station,
  }
})
export default class StationList extends React.Component {
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
    // if (this.props.station.watch) {
    //   const wrapper = ReactDom.findDOMNode(this.refs['wrapper']);
    //   wrapper.
    // }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }
  componentWillUnmount() {

  }
  render() {
    const list = this.props.station.list.map((stationId) => {
      return this.props.station.stations[stationId];
    });
    const sorted = [].concat(list).sort(function(a, b) {
      // if (this.props.station.watch) {
      //   if (a.id == this.props.station.watch.id) {
      //     return -1;
      //   } else if (b.id == this.props.station.watch.id) {
      //     return 1;
      //   }
      // }
      if (a.address.toLowerCase() < b.address.toLowerCase()){
        return -1;
      } else if (a.address.toLowerCase() > b.address.toLowerCase()) {
        return  1;
      } else {
        return 0;
      }
    }.bind(this));

    const content = sorted.map((item) => {
      return <StationItem key={"station-" + item.id} item={item} />;
    });

    return <div className="station-list">
      {content}
    </div>;
  }
}
