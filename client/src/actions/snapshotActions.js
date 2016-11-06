import axios from "axios";

import serverConfig from "./../config/server";

export function postSnapshot(snapshot) {
  // console.log(JSON.stringify(snapshot));
  let url = "snapshot";
  let host = serverConfig.uServer;
  return {
    type: "POST_SNAPSHOT",
    payload: axios.post(host + url, snapshot),
  }
}

export function removeSnapshot(latitude, longitude, timestamp) {
  // console.log(JSON.stringify(snapshot));
  let url = "snapshot?latitude=" + latitude + "&longitude=" + longitude + "&timestamp=" + timestamp;
  let host = serverConfig.uServer;
  return {
    type: "POST_SNAPSHOT",
    payload: axios.delete(host + url),
  }
}

export function fetchSnapshots(latitude, longitude) {
  let url = "snapshot?latitude=" + latitude + "&longitude=" + longitude;
  let host = serverConfig.uServer;
  return {
    type: "FETCH_SNAPSHOTS",
    payload: axios.get(host + url),
  }
}
