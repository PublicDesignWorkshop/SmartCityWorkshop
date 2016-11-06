import axios from "axios";

import serverConfig from "./../config/server";

export function fetchSensorData(latitude, longitude, inside) {
  let url = "raw?latitude=" + latitude + "&longitude=" + longitude + "&inside=" + inside;
  let host = serverConfig.uServer;
  return {
    type: "FETCH_SENSOR_DATA",
    payload: axios.get(host + url),
  }
}
