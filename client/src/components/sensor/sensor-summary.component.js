import React from "react";
import ReactDom from "react-dom";
import { connect } from "react-redux";
// import moment from 'moment';
import { getMousePosition } from "./../../utils/mouse";


import { google10Color } from "./../../utils/color";

require('./sensor-summary.component.scss');

@connect((store) => {
  return {
    localization: store.localization.localization,
    sensor: store.sensor,
  }
})
export default class SensorSummary extends React.Component {
  constructor() {
    super();
    this.state = {
      width: 0,
      height: 0,
    }
  }
  componentWillMount() {

  }
  componentDidMount() {
    const wrapper = ReactDom.findDOMNode(this.refs['wrapper']);
    this.setState({width: wrapper.clientWidth, height:  wrapper.clientHeight - 20});
    // const canvas = ReactDom.findDOMNode(this.refs['canvas']);
    // canvas.addEventListener('click', function(event) {
    //   let mousePos = getMousePosition(canvas, event);
    //   this.props.dispatch({type: "SET_MOUSE_POSITION", payload: mousePos});
    // }.bind(this), false);

    setTimeout(function() {
      this.renderGraph(this.props);
      // this.updateGraph(this.props);
    }.bind(this), 100);
  }
  componentWillReceiveProps(nextProps) {
    this.updateGraph(nextProps);
    // this.updateGraph(nextProps);
  }
  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }
  componentWillUnmount() {

  }
  updateGraph(props) {
    if (this.chart) {
      const temp = props.sensor.sensors.filter((item) => {
        return props.item.latitude == item.latitude && props.item.longitude == item.longitude && props.item.inside == item.inside && props.item.type == item.type;
      });

      if (temp.length > 0) {
        const sensor = temp[0];
        let found = false;
        let firstIndex = 0;
        let newList = sensor.data.filter((object, index) => {
          if (!found && object.x > props.sensor.timestamp - 3 * 60 * 1000) {
            found = true;
            firstIndex = Math.max(index - 1, 0);
          }
          return object.x > props.sensor.timestamp - 3 * 60 * 1000;
        }).asMutable();

        if (newList.length > 0) {
          newList.unshift({x: props.sensor.timestamp - 3 * 60 * 1000, y: newList[0].y});
          newList.push({x: props.sensor.timestamp, y: sensor.data[sensor.data.length - 1].y});
        }

        delete this.chart.datasets[0].points;
        this.chart.datasets[0].points = [];
        for (let i=0; i<newList.length; i++) {
          this.chart.datasets[0].addPoint(newList[i].x, newList[i].y);
        }
        this.chart.update();
      }
    }
  }
  renderGraph(props) {
    const canvas = ReactDom.findDOMNode(this.refs['canvas']);
    if (canvas) {
      const ctx = canvas.getContext("2d");

      const temp = props.sensor.sensors.filter((item) => {
        return props.item.latitude == item.latitude && props.item.longitude == item.longitude && props.item.inside == item.inside && props.item.type == item.type;
      });

      if (temp.length > 0) {
        const sensor = temp[0];
        // let list = sensor.data.asMutable();
        // list.sort(function (a, b) {
        //   return a.x - b.x;
        // });
        let found = false;
        let firstIndex = 0;
        let newList = sensor.data.filter((object, index) => {
          if (!found && object.x > props.sensor.timestamp - 3 * 60 * 1000) {
            found = true;
            firstIndex = Math.max(index - 1, 0);
          }
          return object.x > props.sensor.timestamp - 3 * 60 * 1000;
        }).asMutable();

        if (newList.length > 0) {
          newList.unshift({x: props.sensor.timestamp - 3 * 60 * 1000, y: newList[0].y});
          newList.push({x: props.sensor.timestamp, y: sensor.data[sensor.data.length - 1].y});
        }

        var data = [
          {
            label: sensor.name,
            strokeColor: google10Color(sensor.type.charCodeAt(0)),
            pointColor: google10Color(sensor.type.charCodeAt(0)),
            pointStrokeColor: google10Color(sensor.type.charCodeAt(0)),
            data: newList,
          }
        ];
        this.chart = new Chart(ctx).Scatter(data, {
            tooltipEvents: null,
            mousePosition: null,
            axisStrokeWidth: 4,
            axisStrokeColor: "#cccccc",
    				showTooltips: true,
    				scaleShowHorizontalLines: true,
    				scaleShowLabels: true,
    				scaleType: "date",

            bezierCurve: true,
            bezierCurveTension: 0.05,
            datasetStrokeWidth: 1,
            pointDot: false,

            // xScaleOverride: true,
            // xScaleSteps: 10,
            // xScaleStepWidth: 10 * 1000,
            // xScaleStartValue: new Date().valueOf() - 10 * 10 * 1000,

            // String - short date format (used for scale labels)
            scaleDateFormat: "mmm d",
            // String - short time format (used for scale labels)
            scaleTimeFormat: "HH:MM:ss",
            // String - full date format (used for point labels)
            scaleDateTimeFormat: "HH:MM:ss",

            emptyDataMessage: "There is no recent 3 minutes of data.",

            useUtc: false,

            // // Boolean - If we want to override with a hard coded y scale
            // scaleOverride: true,
            // // ** Required if scaleOverride is true **
            // // Number - The number of steps in a hard coded y scale
            // scaleSteps: 5,
            // // Number - The value jump in the hard coded y scale
            // scaleStepWidth: 20,
            // // Number - The y scale starting value
            // scaleStartValue: 0,

          }
        );
      }
    }
  }

  render() {
    const style = {
      width: this.state.width,
      height: this.state.height
    };
    return <div ref="wrapper" className="sensor-summary">
      <div className="title">{this.props.item.type}</div>
      <canvas ref="canvas" className="" style={style} />
    </div>;
  }
}
