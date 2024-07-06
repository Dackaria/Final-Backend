import winston from "winston";

const customLevelsOptions = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5
  },
  colors: {
    fatal: 'red',
    error: 'magenta',
    warning: 'yellow',
    info: 'blue',
    http: 'green',
    debug: 'white'
  }
}

// DEV LOGGER
const devLogger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: "debug",
      format: winston.format.combine(
        winston.format.colorize({colors: customLevelsOptions.colors}),
        winston.format.simple()
      )
    }),
    new winston.transports.File({
      filename: `errors-development.log`,
      level: "error",
    }),
  ],
});


// PROD LOGGER
const prodLogger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.colorize({colors: customLevelsOptions.colors}),
        winston.format.simple()
      )
    }),
    new winston.transports.File({
      filename: `errors-production.log`,
      level: "error",
    }),
  ],
});

// Implementation
const loggersImplementation = {
  development: devLogger,
  production: prodLogger,
};

export function dynamicLogger(req, res, next) {
  req.logger = loggersImplementation[`${process.env.NODE_ENV}`];
  next();
}