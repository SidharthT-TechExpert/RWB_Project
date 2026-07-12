import { createLogger } from '../logger';

const logger = createLogger('rabbitmq');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let channelModel: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let channel: any = null;
let available = false;

export const connectRabbitMQ = async () => {
  const url = process.env.RABBITMQ_URL;

  if (!url) {
    logger.info('RABBITMQ_URL not set — event bus disabled (fine for local dev)');
    return null;
  }

  if (channel) return channel;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const amqplib = require('amqplib');
    channelModel = await amqplib.connect(url);
    channel = await channelModel.createChannel();
    available = true;
    logger.info('RabbitMQ connected');

    channelModel.on('error', (err: Error) => {
      logger.warn(`RabbitMQ error: ${err.message}`);
      available = false;
    });

    channelModel.on('close', () => {
      logger.warn('RabbitMQ disconnected — retrying in 10s');
      available = false;
      channel = null;
      channelModel = null;
      setTimeout(() => connectRabbitMQ().catch(() => {}), 10000);
    });

    return channel;
  } catch (err) {
    logger.warn(`RabbitMQ unavailable — events disabled: ${(err as Error).message}`);
    available = false;
    return null;
  }
};

export const publishEvent = async (
  exchange: string,
  routingKey: string,
  data: unknown
): Promise<void> => {
  if (!available) return;

  try {
    const ch = await connectRabbitMQ();
    if (!ch) return;
    await ch.assertExchange(exchange, 'topic', { durable: true });
    ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(data)), {
      persistent: true,
      contentType: 'application/json',
    });
  } catch (err) {
    logger.warn(`Failed to publish ${exchange}.${routingKey}: ${(err as Error).message}`);
  }
};

export const consumeEvent = async (
  exchange: string,
  routingKey: string,
  queue: string,
  handler: (data: unknown) => Promise<void>
): Promise<void> => {
  const ch = await connectRabbitMQ();
  if (!ch) return;

  try {
    await ch.assertExchange(exchange, 'topic', { durable: true });
    await ch.assertQueue(queue, { durable: true });
    await ch.bindQueue(queue, exchange, routingKey);

    ch.consume(queue, async (msg: { content: Buffer } | null) => {
      if (!msg) return;
      try {
        const data = JSON.parse(msg.content.toString());
        await handler(data);
        ch.ack(msg);
      } catch (err) {
        logger.error('Event handler error:', err);
        ch.nack(msg, false, false);
      }
    });

    logger.info(`Consuming: ${exchange}.${routingKey}`);
  } catch (err) {
    logger.warn(`Failed to set up consumer: ${(err as Error).message}`);
  }
};
