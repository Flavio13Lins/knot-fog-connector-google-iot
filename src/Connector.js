const iot = require('@google-cloud/iot');
const mqtt = require('mqtt');
const jwt = require('jsonwebtoken');

const createJwt = (projectId, privateKey, algorithmName) => {
  // Create a JWT to authenticate this device. The device will be disconnected
  // after the token expires, and will have to reconnect with a new token. The
  // audience field should always be set to the GCP project id.
  const token = {
    iat: parseInt(Date.now() / 1000, 10),
    exp: parseInt(Date.now() / 1000, 10) + 20 * 60, // 20 minutes
    aud: projectId,
  };
  return jwt.sign(token, privateKey, { algorithm: algorithmName });
};

class Connector {
  constructor(settings) { // eslint-disable-line no-useless-constructor, no-unused-vars
    this.client = null;
    this.iotAgentUrl = `http://${settings.iota.hostname}:${settings.iota.port}`;
    this.iotAgentMQTT = `mqtt://${settings.iota.hostname}`;
    this.projectId = settings.credential.project_id;
    this.privateKey = settings.privatePem;
    this.devicesCert = settings.certPem;
  }

  async start(deviceId) { // eslint-disable-line no-empty-function
    this.client = new iot.v1.DeviceManagerClient();
    if (!deviceId) {
      this.deviceId = 'my-device';
    } else {
      this.deviceId = deviceId;
    }
    this.region = 'us-central1';
    this.registryId = 'my-registry';
    this.mqttClientId = `projects/${this.projectId}/locations/${this.region}/registries/${this.registryId}/devices/${this.deviceId}`;
    const connectionArgs = {
      host: 'mqtt.googleapis.com',
      port: '8883',
      clientId: this.mqttClientId,
      password: createJwt(this.projectId, this.privateKey, 'RS256'),
      username: 'unused',
      protocol: 'mqtts',
      secureProtocol: 'TLSv1_2_method',
    };
    this.mqttClient = mqtt.connect(connectionArgs);

    this.mqttClient.on('connect', (success) => {
      if (!success) {
        console.log('Client not connected...');
      } else {
        console.log('Connected!!!');
      }
    });

    this.mqttClient.on('close', () => {
      console.log('close');
      // shouldBackoff = true;
      this.mqttClient.disconnect();
    });

    this.mqttClient.on('error', (err) => {
      console.log('error', err);
    });

    this.mqttClient.on('message', (topic, message) => {
      console.log(
        topic,
        ' of topic and message received: ',
        Buffer.from(message, 'base64').toString('ascii'),
      );
    });
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
    const cert = this.devicesCert;
    let device = {
      id: newDevice.id,
      credentials: [
        {
          publicKey: {
            format: 'RSA_X509_PEM',
            key: cert,
          },
        },
      ],
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
    const { projectId, region, registryId } = this;
    const deviceId = id;
    console.log('iniciando publish');
    if (id !== 'my-device') {
      this.mqttClientId = `projects/${projectId}/locations/${region}/registries/${registryId}/devices/${id}`;
      const connectionArgs = {
        host: 'mqtt.googleapis.com',
        port: '8883',
        clientId: this.mqttClientId,
        username: 'unused',
        protocol: 'mqtts',
        secureProtocol: 'TLSv1_2_method',
      };
      this.mqttClient = mqtt.connect(connectionArgs);
    }
    const mqttTopic = `/devices/${deviceId}/events`;
    const payload = `${registryId}/${deviceId}-payload-0011`;
    // Publish "payload" to the MQTT topic. qos=1 means at least once delivery.
    // Cloud IoT Core also supports qos=0 for at most once delivery.
    console.log('Publishing message:', payload);
    this.mqttClient.publish(mqttTopic, payload, { qos: 1 }, (err) => {
      if (!err) {
        console.log('ok', payload);
      } else {
        console.log(err);
      }
    });
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
