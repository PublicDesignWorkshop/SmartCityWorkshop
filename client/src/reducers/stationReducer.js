import { normalize, arrayOf } from 'normalizr';
import { station, port, sensor } from "./../schema";
import Immutable from 'seamless-immutable';
import store from "./../store/store";

const defaultState = Immutable({
  fetching: false,
  fetched: false,
  error: null,
  watch: null,
  current: null,
  active: null,
  list: [],
  stations: [],
});

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case "FETCH_STATIONS_PENDING": {
      return state.merge({fetching: true});
    }
    case "FETCH_STATIONS_REJECTED" : {
      return state.merge({fetching: false, error: action.payload});
    }
    case "FETCH_STATIONS_FULFILLED" : {
      const response = normalize(action.payload.data, {
        stations: arrayOf(station),
      });
      return state.merge(response.entities).merge({list: response.result.stations, fetching: false, fetched: true});
    }
    case "SET_STATION_CURRENT" : {
      return state.merge({current: state.stations[action.payload], watch: state.stations[action.payload]});
    }
    case "SET_STATION_WATCH" : {
      return state.merge({current: null, watch: state.stations[action.payload]});
    }
    case "SET_STATION_ACTIVE" : {
      if (state.stations[action.payload]) {
        store.getState().map.socket.send(JSON.stringify({latitude: state.stations[action.payload].coord.x, longitude: state.stations[action.payload].coord.y, inside: state.stations[action.payload].inside}));
      } else {
        store.getState().map.socket.send(null);
      }
      return state.merge({active: state.stations[action.payload]});
    }
  }
  return state;
};
