import React from "react";
import { connect } from "react-redux";

import SnapshotSummary from "./snapshot-summary.component";
import SnapshotDetail from "./snapshot-detail.component";

require('./snapshot-list.component.scss');

@connect((store) => {
  return {
    localization: store.localization.localization,
    station: store.station,
    snapshot: store.snapshot,
  }
})
export default class SnapshotList extends React.Component {
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
    setTimeout(function() {
      if (nextProps.snapshot.current) {
        let dom = document.querySelector("#snapshot-" + (nextProps.snapshot.current.timestamp));
        if (dom) {
          dom.scrollIntoView();
        }
      }
    }.bind(this), 100);
  }
  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }
  componentWillUnmount() {

  }
  render() {
    const snapshots = this.props.snapshot.snapshots.map((item) => {
      if (this.props.station.current && this.props.station.current.coord.x == item.latitude && this.props.station.current.coord.y == item.longitude) {
        if (this.props.snapshot.current && item.latitude == this.props.snapshot.current.latitude && item.longitude == this.props.snapshot.current.longitude && item.timestamp == this.props.snapshot.current.timestamp) {
          return <SnapshotDetail key={"snapshot-" + item.timestamp} item={item} />;
        }
        return <SnapshotSummary key={"snapshot-" + item.timestamp} item={item} />;
      }
      return null;
    });
    return <div className="snapshot-list">
      <div className="title">SNAPSHOTS</div>
      {snapshots}
    </div>;
  }
}
