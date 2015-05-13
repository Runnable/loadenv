'use strict';

var fs = require('fs');
var path = require('path');
var dotenv = require('dotenv');
var eson = require('eson');
var exists = require('101/exists');
var clone = require('clone');

/**
 * Reads .env configs from your app's `configs/` directory and loads them into
 * the process environment (via dotenv). Additionally checks for a `NODE_ENV`
 * and loads additional configs that match `configs/.env.${NODE_ENV}`.
 * @module loadenv
 * @author Ryan Sandor Richards, Anand Patel
 */
module.exports = readDotEnvConfigs;

/**
 * Application root directory.
 * @type {string}
 */
var applicationRoot = __dirname + '/../../';

/**
 * Specified node environment.
 * @type {string}
 */
var nodeEnv = process.env.NODE_ENV;

/**
 * Original process.env state. Set on execution for
 * @type {object}
 */
var originalEnv;

/**
 * Ensures that the environment variables will only be loaded the
 * first time this module is included.
 * @type {boolean}
 */
var hasLoadedEnvironment = false;

/**
 * Loads environment varibles defined in `config/.env*`.
 * @param {string} [debugName] Name to use when outputting resulting environment
 *  via debug. Defaults to 'loadenv'.
 * @param {boolean} [ignoreNodeEnv] Flag to ignore loading environment based
 *  on `NODE_ENV` variable.
 */
function readDotEnvConfigs(debugName, ignoreNodeEnv) {
  // Skip if environment has already been loaded.
  if (hasLoadedEnvironment) {
    return;
  }
  hasLoadedEnvironment = true;
  originalEnv = clone(process.env);

  var debug = require('debug')(debugName || 'loadenv');

  // Load appropriate environment variables from `/configs`
  if (!ignoreNodeEnv) {
    loadEnv('.env.' + nodeEnv);
  }
  loadEnv('.env');

  // Finalize the load
  process.env = eson()
    .use(function (key, val) {
      return !isNaN(val) ? parseInt(val) : val;
    })
    .parse(JSON.stringify(process.env));

  process.env.ROOT_DIR = applicationRoot;
  debug(process.env);

  /**
   * Loads a specific environment with the given name.
   * @param {string} name Name of the environment file to load.
   */
  function loadEnv(name) {
    console.log('aprr', applicationRoot);
    var fullEnvPath = path.resolve(applicationRoot, './configs/' + name);
    try {
      fs.statSync(fullEnvPath);
      dotenv.config({ path: fullEnvPath });
    }
    catch (e) {
      debug('Could not load environment "' + fullEnvPath + '"');
    }
  }
}

/**
 * Restores process.env to its original state.
 */
readDotEnvConfigs.restore = function () {
  process.env = originalEnv;
  hasLoadedEnvironment = false;
};
