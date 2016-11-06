import { Schema, arrayOf } from 'normalizr';

const station = new Schema('stations');
const port = new Schema('ports');
const sensor = new Schema('sensors');

// An Station has an array of Ports
// station.define({
//   ports: arrayOf(port)
// });

// A Port has one sensor attached
// port.define({
//   sensor: sensor
// });

// sensor.define({
//   data: arrayOf(datum)
// });

export { station, port, sensor };
