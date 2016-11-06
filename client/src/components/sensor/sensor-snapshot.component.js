import React from "react";
import ReactDom from "react-dom";
import { connect } from "react-redux";
// import moment from 'moment';
import { getMousePosition } from "./../../utils/mouse";

import { google10Color } from "./../../utils/color";

require('./sensor-snapshot.component.scss');

@connect((store) => {
  return {
    localization: store.localization.localization,
    sensor: store.sensor,
  }
})
export default class SensorSnapshot extends React.Component {
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

    setTimeout(function() {
      this.renderGraph(this.props);
    }.bind(this), 100);
  }
  componentWillReceiveProps(nextProps) {
    this.updateGraph(nextProps);
  }
  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }
  componentWillUnmount() {

  }
  updateGraph(props) {
    if (this.chart) {
      const sensor = props.item;
      let list = sensor.data.asMutable();
      // list.sort(function (a, b) {
      //   return a.x - b.x;
      // });

      list.unshift({x: props.timestamp - 1 * 60 * 1000, y: list[0].y});
      list.push({x: props.timestamp + 1 * 60 * 1000, y: list[list.length - 1].y});

      delete this.chart.datasets[0].points;
      this.chart.datasets[0].points = [];
      for (let i=0; i<list.length; i++) {
        this.chart.datasets[0].addPoint(list[i].x, list[i].y);
      }
      this.chart.update();

    }
  }
  renderGraph(props) {
    const canvas = ReactDom.findDOMNode(this.refs['canvas']);
    if (canvas) {
      const ctx = canvas.getContext("2d");

      const sensor = props.item;
      let list = sensor.data.asMutable();
      // list.sort(function (a, b) {
      //   return a.x - b.x;
      // });

      list.unshift({x: props.timestamp - 1 * 60 * 1000, y: list[0].y});
      list.push({x: props.timestamp + 1 * 60 * 1000, y: list[list.length - 1].y});

      var data = [
        {
          label: sensor.name,
          strokeColor: google10Color(sensor.type.charCodeAt(0)),
          pointColor: google10Color(sensor.type.charCodeAt(0)),
          pointStrokeColor: google10Color(sensor.type.charCodeAt(0)),
          data: list,
        }
      ];
      this.chart = new Chart(ctx).Scatter(data, {
          tooltipEvents: ['click'],
          mousePosition: null,
          axisStrokeWidth: 4,
          axisStrokeColor: "#cccccc",
          showTooltips: true,
          scaleShowHorizontalLines: true,
          scaleShowLabels: true,
          scaleType: "date",

          bezierCurve: true,
          bezierCurveTension: 0.1,
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

          emptyDataMessage: "There is no sensor data.",

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

          // Interpolated JS string - can access point fields:
          // argLabel, valueLabel, arg, value, datasetLabel, size
          tooltipTemplate: "<%if (datasetLabel){%><%=datasetLabel%>: <%}%>time: <%=argLabel%> | value: <%=valueLabel%>",

          // Interpolated JS string - can access point fields:
          // argLabel, valueLabel, arg, value, datasetLabel, size
          multiTooltipTemplate: "time: <%=argLabel%> | value: <%=valueLabel%>",

        }
      );
    }
  }

  render() {
    const style = {
      width: this.state.width,
      height: this.state.height
    };
    return <div ref="wrapper" className="sensor-snapshot">
      <div className="title">{this.props.item.type}</div>
      <canvas ref="canvas" className="" style={style} />
    </div>;
  }
}
