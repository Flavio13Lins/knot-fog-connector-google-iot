const iot = require('@google-cloud/iot');

class Connector {
  constructor(settings) { // eslint-disable-line no-useless-constructor, no-unused-vars
    this.client = new iot.v1.DeviceManagerClient();
    this.iotAgentUrl = `http://${settings.iota.hostname}:${settings.iota.port}`;
    this.iotAgentMQTT = `mqtt://${settings.iota.hostname}`;
  }

  async start() { // eslint-disable-line no-empty-function
  }

  async deviceExists(id) {
    const projectId = await this.client.getProjectId();
    const cloudRegion = 'us-central1';
    const registryId = 'my-registry';
    const deviceId = id;
    try {
      const devicePath = await this.client.devicePath(projectId, cloudRegion, registryId, deviceId);
      await this.client.getDevice({ name: devicePath });
    } catch (error) {
      const errorCode = error.code;
      if (errorCode === 5) {
        return false;
      }
      return error;
    }
    return true;
  }

  async addDevice(newDevice) { // eslint-disable-line no-empty-function, no-unused-vars
    const projectId = await this.client.getProjectId();
    const cloudRegion = 'us-central1';
    const registryId = 'my-registry';
    const registryPath = await this.client.registryPath(projectId, cloudRegion, registryId);
    try {
      if (await this.deviceExists(newDevice.id)) {
        return { id: newDevice.id, name: '' };
      }
    } catch (error) {
      return error;
    } // Prepared to create new device
    // const rsaFileName = "rsa_private"+newDevice.id;+".pem";
    // const certfic = openssl('openssl req -x509 -newkey rsa:2048 -keyout openssl/'+rsaFileName+' -nodes -out openssl/rsa_cert'+newDevice+'.pem -subj "/CN=unused"')
    // console.log(certfic);
    let device = {
      id: newDevice.id,
      credencials: [{
          publicKey: {
            format: 'RSA_X509_PEM',
            // key: certific.toString(),
          },
      },],
    }
    const request = {
      parent: registryPath,
      device,
    }
    try{
      const responses = await this.client.createDevice(request);
      [device] = responses;
    } catch (error) {
      return error;
    }
    
    return { id: device.id, name: device.id, token: device.numId, ref: device.name };
  }

  async removeDevice(id) { // eslint-disable-line no-empty-function, no-unused-vars
    const projectId = await this.client.getProjectId();
    const cloudRegion = 'us-central1';
    const registryId = 'my-registry';
    const deviceId = id;
    const devicePath = await this.client.devicePath(projectId, cloudRegion, registryId, deviceId);
    try {
      const response = await this.client.deleteDevice({ name: devicePath });
      return response;
    } catch (error) {
      return error;
    }
  }

  async listDevices() { // eslint-disable-line no-empty-function
    const projectId = await this.client.getProjectId();
    const cloudRegion = 'us-central1';
    const registryId = 'my-registry';
    const registryPath = await this.client.registryPath(projectId, cloudRegion, registryId);

    try {
      const responses = await this.client.listDevices({
        parent: registryPath,
      });
      const [response] = responses;
      if (response.length === 0) {
        return [];
      }
      return Promise.all(response.map(async (device) => {
        try {
          const devicePath = await this.client.devicePath(
            projectId, cloudRegion, registryId, device.id,
          );
          const [deviceContent] = await this.client.getDevice({
            name: devicePath,
          });
          const schema = deviceContent.metadata;
          const ref = deviceContent.name;

          return { id: device.id, name: device.id, token: device.numId, ref, schema };
        } catch (error) {
          return error;
        }
      }));
    } catch (error) {
      return error;
    }
  }

  // Device (fog) to cloud

  async publishData(id, dataList) { // eslint-disable-line no-empty-function, no-unused-vars
  }

  async updateSchema(id, schemaList) { // eslint-disable-line no-empty-function, no-unused-vars
    const projectId = await this.client.getProjectId();
    const cloudRegion = 'us-central1';
    const registryId = 'my-registry';
    const deviceId = id;
    try {
      const devicePath = await this.client.devicePath(
        projectId, cloudRegion, registryId, deviceId,
      );
      try{
        const [device] = await this.client.getDevice({
          name: devicePath,
        })
        device.metadata = schemaList;
        console.log(device);
        const updatedDevice = await this.client.updateDevice({ name: device.name }); 
        // erro: TypeError: Cannot read property 'name' of undefined
        // at DeviceManagerClient.updateDevice
        console.log(updatedDevice, device.name);
      } catch (error) {
        console.error('erro2:', error);
        return null;
      }
      return updateDevice;
    } catch (error) {
      console.error('error1:', error);
      return error;
    }
  }

  async updateProperties(id, properties) { // eslint-disable-line no-empty-function, no-unused-vars
  }

  // Cloud to device (fog)

  // cb(event) where event is { id, sensorId }
  async onDataRequested(cb) { // eslint-disable-line no-empty-function, no-unused-vars
  }

  // cb(event) where event is { id, sensorId, data }
  async onDataUpdated(cb) { // eslint-disable-line no-empty-function, no-unused-vars
  }

  // Connection callbacks
  async onDisconnected(cb) { // eslint-disable-line no-empty-function, no-unused-vars
  }

  async onReconnected(cb) { // eslint-disable-line no-empty-function, no-unused-vars
  }
}

export { Connector }; // eslint-disable-line import/prefer-default-export
