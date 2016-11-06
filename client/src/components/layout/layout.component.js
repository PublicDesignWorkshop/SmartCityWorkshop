import React from "react";
import { connect } from "react-redux";

import { fetchLocalization } from "./../../actions/localizationActions";

import Header from "./../header/header.component";

require('./layout.component.scss');

@connect((store) => {
  return {
    localization: store.localization.localization,
  }
})
export default class Layout extends React.Component {
  componentWillMount() {
    this.props.dispatch(fetchLocalization());
  }
  render() {
    return <div className="layout">
      <Header />
      <div className="body">
        <div id="map" className="map" />
        {this.props.children}
      </div>
    </div>;
  }
}
