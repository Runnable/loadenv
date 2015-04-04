'use strict';

/**
 * Reads .env configs from your app's `configs/` directory and loads them into
 * the process environment (via dotenv). Additionally checks for a `NODE_ENV`
 * and loads additional configs that match `configs/.env.${NODE_ENV}`.
 * @module loadenv
 * @author Ryan Sandor Richards, Anand Patel
 */

var fs = require('fs');
var path = require('path');
var dotenv = require('dotenv');
var eson = require('eson');
var execSync = require('exec-sync');
var applicationRoot = require('app-root-path').toString();
var env = process.env.NODE_ENV;
var exists = require('101/exists');
var async = require('async');

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
 */
function readDotEnvConfigs(debugName) {
  // Skip if environment has already been loaded.
  if (hasLoadedEnvironment === true) {
    return;
  }
  hasLoadedEnvironment = true;

  var debug = require('debug')(debugName || 'loadenv');

  // Load appropriate environment variables from `/configs`
  loadEnv('.env.' + env);
  loadEnv('.env');

  // Finalize the load
  process.env = eson()
    .use(function (key, val) {
      return !isNaN(val) ? parseInt(val) : val;
    })
    .parse(JSON.stringify(process.env));

  try {
    process.env._VERSION_GIT_COMMIT =
      execSync('git rev-parse HEAD');
    process.env._VERSION_GIT_BRANCH =
      execSync('git rev-parse --abbrev-ref HEAD');
  }
  catch (e) {
    debug('Could not load git information.');
  }

  process.env.ROOT_DIR = applicationRoot;
  debug(process.env);

  /**
   * Loads a specific environment with the given name.
   * @param {string} name Name of the environment file to load.
   */
  function loadEnv(name) {
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

module.exports = readDotEnvConfigs;
