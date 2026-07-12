import winston from 'winston';

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

const isDevelopment = process.env.NODE_ENV === 'development';

export const createLogger = (serviceName: string) => {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    defaultMeta: { service: serviceName },
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      isDevelopment ? colorize() : json(),
      isDevelopment ? simple() : json()
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({
        filename: `logs/${serviceName}-error.log`,
        level: 'error',
      }),
      new winston.transports.File({
        filename: `logs/${serviceName}-combined.log`,
      }),
    ],
  });
};

export const logger = createLogger('quickbite');
