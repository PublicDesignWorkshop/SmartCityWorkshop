export default function reducer(state={
  error: null,
  map: null,
  tile: null,
  socket: null,
}, action) {
  switch (action.type) {
    case "SET_ACTIVE_MAP": {
      return {...state, map: action.payload}
    }
    case "SET_ACTIVE_TILE": {
      return {...state, tile: action.payload}
    }
    case "SET_SOCKET": {
      return {...state, socket: action.payload}
    }
  }
  return state;
};
