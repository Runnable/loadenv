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
var createCount = require('callback-count');

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
 * @param {boolean} [addGitInfo] If `true` then git information will also
 *   be pulled into the process env. Defaults to true.
 */
function readDotEnvConfigs(debugName, addGitInfo) {
  // Skip if environment has already been loaded.
  if (hasLoadedEnvironment === true) {
    return;
  }
  hasLoadedEnvironment = true;

  addGitInfo = exists(addGitInfo) ? addGitInfo : true;
  var debug = require('debug')(debugName || 'loadenv');

  // Load appropriate environment variables from `/configs`
  var count = createCount(2, finalize);
  loadEnv('.env', count.next);
  loadEnv('.env.' + env, count.next);

  function loadEnv(name, cb) {
    var fullEnvPath = path.resolve(applicationRoot, './configs/' + name);
    fs.stat(fullEnvPath, function (err, stat) {
      if (err) {
        debug('Error loading ' + fullEnvPath + ', skipping.');
      }
      else {
        dotenv.config({ path: fullEnvPath });
      }
      cb();
    });
  }

  function finalize(err) {
    if (err) { return debug(err); }
    process.env = eson()
      .use(function (key, val) {
        return !isNaN(val) ? parseInt(val) : val;
      })
      .parse(JSON.stringify(process.env));

    if (addGitInfo) {
      process.env._VERSION_GIT_COMMIT =
        execSync('git rev-parse HEAD');
      process.env._VERSION_GIT_BRANCH =
        execSync('git rev-parse --abbrev-ref HEAD');
    }

    process.env.ROOT_DIR = applicationRoot;
    debug(process.env);
  }
}

module.exports = readDotEnvConfigs;
