import { combineReducers } from "redux";

import localization from "./localizationReducer";
import map from "./mapReducer";
import station from "./stationReducer";
import sensor from "./sensorReducer";
import snapshot from "./snapshotReducer";


export default combineReducers({
  localization,
  map,
  station,
  sensor,
  snapshot,
});
