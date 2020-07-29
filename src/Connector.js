class Connector {
  constructor(settings) { // eslint-disable-line no-useless-constructor, no-unused-vars
    const iot = require('@google-cloud/iot');
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
    }
    return true;
  }

  async addDevice(device) { // eslint-disable-line no-empty-function, no-unused-vars
  }

  async removeDevice(id) { // eslint-disable-line no-empty-function, no-unused-vars
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
      const response = responses[0];
      if (response.length === 0) {
        return [];
      }
      return Promise.all(response.map(async (device) => {
        try {
          const devicePath = await this.client.devicePath(
            projectId, cloudRegion, registryId, device.id,
          );
          const deviceContent = await this.client.getDevice({
            name: devicePath,
          });
          const schemaList = deviceContent[0].metadata;
          const name = deviceContent[0].name;
          return { id: device.id, name, schema: schemaList };
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
