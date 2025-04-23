import pino from 'pino';

const config = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
    level: 'debug',
  },
  test: {
    level: 'error',
  },
  production: {
    level: 'info',
  },
};

const env = process.env.NODE_ENV || 'development';

export const logger = pino({
  ...config[env],
  base: {
    env,
  },
  hooks: {
    logMethod(inputArgs, method) {
      if (inputArgs.length >= 2) {
        const arg1 = inputArgs[0];
        const arg2 = inputArgs[1];
        if (typeof arg1 === 'object' && arg1 !== null) {
          // The first argument is an object, just call the method
          method.apply(this, inputArgs);
        } else {
          // The first argument is not an object, convert it to an object
          method.apply(this, [{ msg: arg1 }, arg2, ...inputArgs.slice(2)]);
        }
      }
    },
  },
});
