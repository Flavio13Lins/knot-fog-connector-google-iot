import { Connector } from './Connector';
// const node_openssl = require('node-openssl-cert');
const settings = { // Teste do Connector
  iota: {
      hostname: "localhost",
      port: "8080"
  }
};

const tryconnector = new Connector(settings); //usando construtor

// const add = tryconnector.addDevice({id: 'my-device'}); //adicionando device: my-device
// add.then( function(resp) {
//   if(resp){
//     console.log(resp);
//   }
// });

// const devices = tryconnector.listDevices(); //listando devices
// devices.then( function(responses){
//   if(responses){
//     console.log(`${responses.length} Devices found:`)
//   }
//   for (const response of responses){
//     console.log(response);
//   }
// })

// const update = tryconnector.updateSchema('my-device', { 'sensors': '1', 'sensor-termico': '35' }); //tentativa do update em my-device
// update.then( function(responses){
//   if(responses){
//     console.log('Update response:', responses);
//   }
// })

// const deleted = tryconnector.removeDevice('another-one'); // remove device another-one
// deleted.then(function(response){
//   if(response){
//     console.log(response);
//   }
// })

export default Connector;
