import { Connector } from './Connector.js';

const settings = { // Teste do Connector
  iota: {
      hostname: "localhost",
      port: "8080"
  }
};
const tryconnector = new Connector(settings); //usando construtor
const devices = tryconnector.listDevices(); //listando devices
devices.then(
function(responses){
  if(responses){
    console.log(`${responses.length} Devices found:`)
  }
  for (const response of responses){
    console.log(response);
  }
}
)

const add = tryconnector.addDevice({ id:'another-two', name: 'two'});
add.then(function(resp){
  if(resp){
    console.log(resp);
  }
})

export default Connector;
