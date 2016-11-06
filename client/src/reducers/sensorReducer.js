import { normalize, arrayOf } from 'normalizr';
// import { station, sensor } from "./../schema";
import Immutable from 'seamless-immutable';
import store from "./../store/store";
// import moment from 'moment';

const defaultState = Immutable({
  fetching: false,
  fetched: false,
  error: null,
  timestamp: new Date().valueOf(),
  sensors: [],
  timecurrent: 0
});

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case "SET_SENSOR_TIMECURRENT": {
      return state.merge({timecurrent: action.payload});
    }
    case "FETCH_SENSOR_DATA_PENDING": {
      return state.merge({fetching: true});
    }
    case "FETCH_SENSOR_DATA_REJECTED" : {
      return state.merge({fetching: false, error: action.payload});
    }
    case "FETCH_SENSOR_DATA_FULFILLED" : {
      const newtimestamp = new Date().valueOf();
      // let sensors = state.sensors.asMutable({deep: true});
      let sensors = [];
      action.payload.data.forEach((datum) => {
        let found = false;
        sensors.forEach((sensor) => {
          if (sensor.latitude == datum.latitude && sensor.longitude == datum.longitude
            && sensor.inside == datum.inside && sensor.type == datum.type) {
              found = true;
              sensor.data.push({x: datum.timestamp, y: datum.value});
          }
        });
        if (!found) {
          sensors.push({
            latitude: datum.latitude,
            longitude: datum.longitude,
            inside: datum.inside,
            type: datum.type,
            data: [{x: datum.timestamp, y: datum.value}]
          })
        }
      });
      sensors.forEach((sensor) => {
        sensor.data = sensor.data.filter((datum) => {
          return datum.x > newtimestamp - 20 * 60 * 1000;
        });
        sensor.data.sort(function (a, b) {
          return a.x - b.x;
        });
      });
      return state.merge({timestamp: newtimestamp, sensors: sensors, fetching: false, fetched: true});
    }
    case "ADD_SENSOR_DATA" : {
      const newtimestamp = new Date().valueOf();
      if (action.payload == undefined) {
        return state.merge({timestamp: new Date().valueOf(), fetching: false, fetched: true});
      }
      let sensors = state.sensors.asMutable({deep: true});
      action.payload.forEach((datum) => {
        let found = false;
        sensors.forEach((sensor) => {
          if (sensor.latitude == datum.latitude && sensor.longitude == datum.longitude
            && sensor.inside == datum.inside && sensor.type == datum.type) {
              found = true;
              sensor.data.push({x: datum.timestamp, y: datum.value});
          }
        });
        if (!found) {
          sensors.push({
            latitude: datum.latitude,
            longitude: datum.longitude,
            inside: datum.inside,
            type: datum.type,
            data: [{x: datum.timestamp, y: datum.value}]
          })
        }
      });
      sensors.forEach((sensor) => {
        sensor.data = sensor.data.filter((datum) => {
          return datum.x > newtimestamp - 20 * 60 * 1000;
        });
      });
      return state.merge({timestamp: newtimestamp, sensors: sensors, fetching: false, fetched: true});
    }
    case "RESET_TIME_CURRENT": {
      return state.merge({timecurrent: 0});
    }
  }
  return state;
};
