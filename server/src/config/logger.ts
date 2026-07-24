import winston from 'winston';
import { isProduction } from './env';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProduction() ? 'info' : 'debug'),
  format: winston.format.combine(
    winston.format.timestamp(),
    isProduction()
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ level, message, timestamp, ...meta }) => {
            const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
            return `${timestamp} [${level}]: ${message}${metaStr}`;
          })
        )
  ),
  transports: [
    new winston.transports.Console(),
    ...(isProduction()
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
});
