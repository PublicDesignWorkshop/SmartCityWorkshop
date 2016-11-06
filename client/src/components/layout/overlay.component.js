import React from "react";
import { connect } from "react-redux";

import { fetchLocalization } from "./../../actions/localizationActions";

import Header from "./../header/header.component";

import StationList from "./../station/station-list.component";
import StationSummary from "./../station/station-summary.component";
import StationDetail from "./../station/station-detail.component";

var FontAwesome = require('react-fontawesome');

require('./overlay.component.scss');

@connect((store) => {
  return {
    localization: store.localization.localization,
    station: store.station,
  }
})
export default class Overlay extends React.Component {
  constructor() {
    super();
    this.state = {
      open: false,
    }
  }
  componentWillMount() {

  }
  componentDidMount() {

  }
  componentWillReceiveProps(nextProps) {
    // if (nextProps.location.pathname == "/" || nextProps.location.pathname == "/stations") {
    //   nextProps.dispatch({type: "SET_STATION_CURRENT", payload: null});
    // } else if (nextProps.location.pathname.search(/\/station\/+/i) > -1) {
    //   const index = nextProps.location.pathname.replace(/\/station\/+/i, "");
    //   nextProps.dispatch({type: "SET_STATION_CURRENT", payload: index});
    // }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }
  componentWillUnmount() {

  }
  onToggle() {
    this.setState({
      open: !this.state.open,
    });
  }
  onBack() {
    this.props.dispatch({type: "SET_STATION_CURRENT", payload: null});
  }
  render() {
    let open = "";
    let back = this.props.localization.sBack;
    let toggle = this.props.localization.sShowDetail;
    if (this.state.open) {
      open = " open";
      toggle = this.props.localization.sShowMap;
    }
    let content, button;
    if (this.props.station.current) {
      if (this.state.open) {
        content = <StationDetail />;
      } else {
        content = <StationSummary />;
      }
      button = <button className="toggle left orange" onClick={this.onBack.bind(this)}>{back}</button>;
    } else if (this.props.station.list.length > 0) {
      // button = <div className="search left">
      //   <label htmlFor="station-search"><FontAwesome name='search' /></label>
      //   <input id="station-search" type="text" placeholder={this.props.localization.sStationSearch} />
      //   <FontAwesome name='remove' />
      // </div>;
      content = <StationList />;
    }
    return <div className={"overlay" + open}>
      {button}
      <div className="body">
        {content}
      </div>
      <button className="toggle right green" onClick={this.onToggle.bind(this)}>{toggle}</button>
    </div>;
  }
}
