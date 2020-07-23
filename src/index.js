import { Connector } from './Connector.js';

//======================================================//

/* Teste acessando informacoes do import do Connector e list devices */
/* */
const settings = {
    iota: {
        hostname: "localhost",
        port: "8080"
    }
};
const tryconnector = new Connector(settings); //usando construtor

tryconnector.listDevices(); //listando devices

/* */
//======================================================//

/* Teste do start rapido com list registries */
/*
const iot = require('@google-cloud/iot');

const client = new iot.v1.DeviceManagerClient();
async function quickstart() {
  const projectId = await client.getProjectId();
  const parent = client.locationPath(projectId, 'us-central1');
  const [resources] = await client.listDeviceRegistries({
    parent
  });
  console.log(`${resources.length} resource(s) found.`);

  for (const resource of resources) {
    console.log(resource);
  }

}

quickstart(); 
 */
//======================================================//

/* Teste com storeage com get buckets */
/*
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
// Makes an authenticated API request.
async function listBuckets() {
    try {
        const results = await storage.getBuckets();
        const [buckets] = results;
        console.log('Buckets:');
        buckets.forEach((bucket) => {
        console.log(bucket.name);
        });
    } catch (err) {
        console.error('ERROR:', err);
    }
}
listBuckets();
*/
//======================================================//
export default Connector;
