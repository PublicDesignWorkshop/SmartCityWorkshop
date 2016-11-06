import React from "react";
import { connect } from "react-redux";

import ShuffleText from "./../text/text-shuffle.component";

require('./header.component.scss');

@connect((store) => {
  return {
    localization: store.localization.localization,
  }
})
export default class Layout extends React.Component {
  componentWillMount() {

  }
  render() {
    return <div className="header">
      <div className="left">
        <div className="logo">

        </div>
        <div className="title">
          <ShuffleText text={this.props.localization.sSiteTitle} />
        </div>
      </div>
      <div className="center"></div>
      <div className="right">
        <div className="device">Device #1</div>
      </div>
    </div>;
  }
}
