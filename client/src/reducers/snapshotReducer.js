import { normalize, arrayOf } from 'normalizr';
import { station, port, sensor } from "./../schema";
import Immutable from 'seamless-immutable';
import store from "./../store/store";

import { postSnapshot, removeSnapshot } from "./../actions/snapshotActions";

const defaultState = Immutable({
  fetching: false,
  fetched: false,
  error: null,
  current: null,
  snapshots: [],
});

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case "ADD_SNAPSHOT": {
      let snapshots = state.snapshots.asMutable({deep: true});
      let found = false;
      snapshots.forEach((snapshot) => {
        if (snapshot.latitude == action.payload.station.coord.x && snapshot.longitude == action.payload.station.coord.y && snapshot.timestamp == action.payload.timestamp) {
          found = true;
        }
      });

      if (!found) {
        let sensors = store.getState().sensor.sensors.filter((sensor) => {
          return action.payload.station.coord.x == sensor.latitude && action.payload.station.coord.y == sensor.longitude  && action.payload.station.inside == sensor.inside;
        }).asMutable({deep: true});

        sensors.forEach((sensor) => {
          let data = sensor.data.filter((datum) => {
            return datum.x > action.payload.timestamp - 60 * 1000 && datum.x < action.payload.timestamp + 60 * 1000;
          });
          sensor.data = data;
        });

        sensors = sensors.filter((sensor) => {
          return sensor.data.length > 0;
        });

        snapshots.push({latitude: action.payload.station.coord.x, longitude: action.payload.station.coord.y, timestamp: action.payload.timestamp, sensors: sensors});
      }

      const current = snapshots.filter((snapshot) => {
        return snapshot.latitude == action.payload.station.coord.x && snapshot.longitude == action.payload.station.coord.y && snapshot.timestamp == action.payload.timestamp;
      });

      if (current.length) {
        return state.merge({current: current[0], snapshots: snapshots});
      }

      return state.merge({snapshots: snapshots});
    }
    case "SET_CURRENT_SNAPSHOT": {
      return state.merge({current: action.payload});
    }
    case "REMOVE_SNAPSHOT": {
      let snapshots = state.snapshots.asMutable({deep: true});
      snapshots = snapshots.filter((snapshot) => {
        return !(snapshot.latitude == action.payload.item.latitude && snapshot.longitude == action.payload.item.longitude && snapshot.timestamp == action.payload.item.timestamp);
      });
      setTimeout(function() {
        store.dispatch(removeSnapshot(action.payload.item.latitude, action.payload.item.longitude, action.payload.item.timestamp));
      }.bind(this), 0);
      return state.merge({snapshots: snapshots});
    }
    case "EDIT_SNAPSHOT": {
      let snapshots = state.snapshots.asMutable({deep: true});
      snapshots.forEach((snapshot) => {
        if (snapshot.latitude == action.payload.item.latitude && snapshot.longitude == action.payload.item.longitude && snapshot.timestamp == action.payload.item.timestamp) {
          snapshot.answers = action.payload.answers;
        }
      });

      const temp = snapshots.filter((snapshot) => {
        return snapshot.latitude == action.payload.item.latitude && snapshot.longitude == action.payload.item.longitude && snapshot.timestamp == action.payload.item.timestamp;
      });

      if (temp.length) {
        setTimeout(function() {
          store.dispatch(postSnapshot(temp[0]));
        }.bind(this), 0);
      }

      return state.merge({snapshots: snapshots});
    }

    case "POST_SNAPSHOT_PENDING": {
      return state.merge({fetching: true});
    }
    case "POST_SNAPSHOT_REJECTED" : {
      return state.merge({fetching: false, error: action.payload});
    }
    case "POST_SNAPSHOT_FULFILLED" : {
      return state.merge({fetching: false, fetched: true});
    }
    case "FETCH_SNAPSHOTS_PENDING": {
      return state.merge({fetching: true});
    }
    case "FETCH_SNAPSHOTS_REJECTED" : {
      return state.merge({fetching: false, error: action.payload});
    }
    case "FETCH_SNAPSHOTS_FULFILLED" : {
      return state.merge({snapshots: action.payload.data, fetching: false, fetched: true});
    }
  }
  return state;
};
