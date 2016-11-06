export default function reducer(state={
  fetching: false,
  fetched: false,
  error: null,
  localization: {},
}, action) {
  switch (action.type) {
    case "FETCH_LOCALIZATION_PENDING": {
      return {...state, fetching: true}
    }
    case "FETCH_LOCALIZATION_REJECTED" : {
      return {...state, fetching: false, error: action.payload}
    }
    case "FETCH_LOCALIZATION_FULFILLED" : {
      return {...state, fetching: false, fetched: true, localization: action.payload.data}
    }
  }
  return state;
};
