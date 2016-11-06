import React from "react";
import { connect } from "react-redux";
import moment from 'moment';
import serverConfig from "./../../config/server";

import SensorSnapshot from "./../sensor/sensor-snapshot.component";
import Textarea from 'react-textarea-autosize';

require('./snapshot-detail.component.scss');

@connect((store) => {
  return {
    localization: store.localization.localization,
    station: store.station,
    snapshot: store.snapshot,
  }
})
export default class SnapshotDetail extends React.Component {
  constructor() {
    super();
    this.state = {
      answers: [],
    }
  }
  componentWillMount() {
    if (this.props.item.answers) {
      this.setState({answers: this.props.item.answers.asMutable({deep: true})});
    }
  }
  componentDidMount() {

  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.item.answers) {
      this.setState({answers: nextProps.item.answers.asMutable({deep: true})});
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }
  componentWillUnmount() {

  }
  onDelete(event) {
    this.props.dispatch({type: "REMOVE_SNAPSHOT", payload: {item: this.props.item}});
  }
  onSave(event) {
    this.props.dispatch({type: "EDIT_SNAPSHOT", payload: {item: this.props.item, answers: this.state.answers}});
  }
  onChange(index, event) {
    const temp = this.state.answers.filter((answer) => {
      return answer.id == index;
    });
    if (temp.length > 0) {
      temp[0].value = event.target.value;
    } else {
      this.state.answers.push({id: index, value: event.target.value});
    }
    this.setState({answers: this.state.answers});
  }
  getAnswer(index) {
    const temp = this.state.answers.filter((answer) => {
      return answer.id == index;
    });
    if (temp.length > 0) {
      return temp[0].value;
    }
    return "";
  }
  onClose(event) {
    this.props.dispatch({type: "SET_CURRENT_SNAPSHOT", payload: null});
  }
  render() {
    const sensors = this.props.item.sensors.map((sensor) => {
      return <SensorSnapshot key={"sensor-snapshot-" + this.props.item.timestamp + "-" + sensor.type} item={sensor} timestamp={this.props.item.timestamp} />;
    });

    return <div className="snapshot-detail" id={"snapshot-" + (this.props.item.timestamp)}>
      <div className="title" onClick={this.onClose.bind(this)}>
        {moment(this.props.item.timestamp).format(serverConfig.sUIDateFormat)}
      </div>
      <div className="body">
        <div className="left">
          {sensors}
        </div>
        <div className="right">
          <div className="question">Question 1: Describe a situation around this area.</div>
          <Textarea className="answer" minRows={2} value={this.getAnswer(1)} onChange={this.onChange.bind(this, 1)}></Textarea>
          <div className="question">Question 2: Which kind of sensor is the most relevant?</div>
          <Textarea className="answer" minRows={2} value={this.getAnswer(2)} onChange={this.onChange.bind(this, 2)}></Textarea>
          <div className="question">Question 3: What other sensors will be useful for this situation?</div>
          <Textarea className="answer" minRows={2} value={this.getAnswer(3)} onChange={this.onChange.bind(this, 3)}></Textarea>
          <div className="group">
            <button className="green" onClick={this.onSave.bind(this)}>SAVE</button>
            <button className="red" onClick={this.onDelete.bind(this)}>DELETE</button>
          </div>
        </div>
      </div>
    </div>;
  }
}
