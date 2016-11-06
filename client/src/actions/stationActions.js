import axios from "axios";

import serverConfig from "./../config/server";

export function fetchStations() {
  let file = "stations.json";
  let host;
  if (location.pathname == "/") {
    host = location.origin
  } else {
    host = location.origin + location.pathname;
  }
  return {
    type: "FETCH_STATIONS",
    payload: axios.get(host + serverConfig.uData + file),
  }
}
