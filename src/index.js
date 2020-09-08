import { Connector } from './Connector';


const settings = { // Teste do Connector
  iota: {
    hostname: "localhost",
    port: "8080",
  },
  credential: {}
};

//usando construtor
const tryconnector = new Connector(settings); 

tryconnector.start().then( (res) => {
  console.log(res);
});

// const add = tryconnector.addDevice({id: 'another-one'}); //adicionando device: my-device
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

// const update = tryconnector.updateSchema('another-one', { 'sensors': '1', 'sensor-termico': '36' }); //tentativa do update em my-device
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
