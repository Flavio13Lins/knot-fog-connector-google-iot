const iot = require('@google-cloud/iot');


class Connector {
  constructor(settings) { // eslint-disable-line no-useless-constructor, no-unused-vars
    this.client = null;
    this.iotAgentUrl = `http://${settings.iota.hostname}:${settings.iota.port}`;
    this.iotAgentMQTT = `mqtt://${settings.iota.hostname}`;
    this.projectId = settings.credential.project_id;
  }

  async start() { // eslint-disable-line no-empty-function
    this.client = new iot.v1.DeviceManagerClient();
    this.deviceId = 'my-device';
    this.region = 'us-central1';
    this.registryId = 'my-registry';
    this.mqttClientId = `projects/${this.projectId}/locations/${this.region}/registries/${this.registryId}/devices/${this.deviceId}`;
  }

  async deviceExists(id) {
    const { projectId, region, registryId } = this;
    const deviceId = id;
    try {
      const devicePath = await this.client.devicePath(projectId, region, registryId, deviceId);
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
    const { projectId, region, registryId } = this;
    const registryPath = await this.client.registryPath(projectId, region, registryId);
    try {
      if (await this.deviceExists(newDevice.id)) {
        return { id: newDevice.id, name: '' };
      }
    } catch (error) {
      return error;
    }
    let device = {
      id: newDevice.id,
    };
    const request = {
      parent: registryPath,
      device,
    };
    try {
      const responses = await this.client.createDevice(request);
      [device] = responses;
    } catch (error) {
      return error;
    }
    return {
      id: device.id, name: device.id, token: device.numId, ref: device.name,
    };
  }

  async removeDevice(id) { // eslint-disable-line no-empty-function, no-unused-vars
    const { projectId, region, registryId } = this;
    const deviceId = id;
    const devicePath = await this.client.devicePath(projectId, region, registryId, deviceId);
    try {
      const response = await this.client.deleteDevice({ name: devicePath });
      return response;
    } catch (error) {
      return error;
    }
  }

  async listDevices() { // eslint-disable-line no-empty-function
    const { projectId, region, registryId } = this;
    const registryPath = await this.client.registryPath(projectId, region, registryId);
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
            projectId, region, registryId, device.id,
          );
          const [deviceContent] = await this.client.getDevice({
            name: devicePath,
          });
          const schema = deviceContent.metadata;
          const ref = deviceContent.name;
          return {
            id: device.id, name: device.id, token: device.numId, ref, schema,
          };
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
    const { projectId, region, registryId } = this;
    const deviceId = id;
    try {
      const devicePath = await this.client.devicePath(
        projectId, region, registryId, deviceId,
      );
      try {
        await this.client.getDevice({
          name: devicePath,
        }).then(async ([response]) => {
          const newdevice = {
            metadata: schemaList,
            name: response.name,
          };
          const request = {
            device: newdevice,
            updateMask: { paths: ['metadata'] },
          };
          await this.client.updateDevice(request);
        });
      } catch (error) {
        return error;
      }
    } catch (error) {
      return error;
    }
    return 'Device updated.';
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
