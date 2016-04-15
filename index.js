'use strict';

var clone = require('clone');
var defaults = require('101/defaults');
var dotenv = require('dotenv');
var eson = require('eson');
var exists = require('101/exists');
var fs = require('fs');
var last = require('101/last');
var path = require('path');
var isEmpty = require('101/is-empty');
var isString = require('101/is-string');

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
 * @param {object} opts Options for the environment load.
 * @param {string} [opts.debugName] Name to use when outputting resulting
 *  environment via debug. Defaults to 'loadenv'.
 * @param {boolean} [opts.ignoreNodeEnv] Flag to ignore loading environment
 *  based on `NODE_ENV` variable.
 * @param {string} [opts.project] Optional project name to use for nested
 *   configurations. This allows you to load a specific project sub-directory
 *   environment files in the `configs/`.
 */
function readDotEnvConfigs(opts) {
  // Skip if environment has already been loaded.
  if (hasLoadedEnvironment) {
    return;
  }
  hasLoadedEnvironment = true;
  originalEnv = clone(process.env);

  if (isString(opts)) {
    var debugName = opts
    opts = { debugName: debugName }
  }

  opts = opts || {};
  defaults(opts, {
    debugName: 'loadenv',
    ignoreNodeEnv: false,
    project: ''
  });

  var debug = require('debug')(opts.debugName);

  if (!isString(opts.project)) {
    throw new Error('loadenv: `projects` option must be a string');
  }

  // Remove trailing slashes from the project option
  if (last(opts.project) === '/') {
    opts.project = opts.project.replace(/\/+$/, '')
  }

  // Load project configuration environment if applicable
  if (!isEmpty(opts.project)) {
    if (!opts.ignoreNodeEnv) {
      loadEnv(opts.project + '/.env.' + nodeEnv)
    }
    loadEnv(opts.project + '/.env');
  }

  // Load root configuration environment in configs/
  if (!opts.ignoreNodeEnv) {
    loadEnv('.env.' + nodeEnv)
  }
  loadEnv('.env');

  // Ensure the environment has the correct types for ints and floats
  process.env = eson()
    .use(function (key, val) {
      if (isString(val) && val.match(/^\s*[+\-]?[0-9]+\s*$/)) {
        return parseInt(val);
      }
      return !isNaN(val) ? parseFloat(val) : val;
    })
    .parse(JSON.stringify(process.env));

  process.env.ROOT_DIR = applicationRoot;
  debug(process.env);

  /**
   * Loads a specific environment with the given name.
   * @param {string} name Name of the environment file to load.
   */
  function loadEnv(name) {
    var fullEnvPath = path.resolve(applicationRoot, './configs/' + name);
    try {
      debug('Loaded environment: ' + fullEnvPath);
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
  if (hasLoadedEnvironment) {
    process.env = originalEnv;
    hasLoadedEnvironment = false;
  }
};
