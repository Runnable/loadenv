var Lab = require('lab');
var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var afterEach = lab.afterEach;
var Code = require('code');
var expect = Code.expect;

var sinon = require('sinon');
var dotenv = require('dotenv');
var rewire = require('rewire');
var loadenv = rewire('../index.js');

// simulate applicationRoot value as it would be derrived if module was in node_modules/
loadenv.__set__('applicationRoot', require('app-root-path')+'/node_modules/loadenv/../../');

describe('loadenv', function() {
  afterEach(function (done) {
    loadenv.restore();
    done();
  });

  it('should load default environment variables', function (done) {
    loadenv('loadenv', true);
    expect(process.env.DEFAULT_A).to.equal(123);
    expect(process.env.DEFAULT_B).to.equal('HELLO WORLD');
    expect(process.env.DEFAULT_C).to.equal('E=MC^2');
    done();
  });

  it('should load test environment variables', function (done) {
    loadenv();
    expect(process.env.DEFAULT_B).to.equal('HELLO TEST');
    expect(process.env.SPECIAL_D).to.equal('ONLY IN TEST');
    done();
  });

  it('should not load environment after already loaded', function(done) {
    loadenv();
    var original = process.env.SPECIAL_D;
    process.env.SPECIAL_D = 'different';
    loadenv();
    expect(process.env.SPECIAL_D).to.equal('different');
    done();
  });

  it('should log a warning if it cannot find an env file', function (done) {
    sinon.stub(dotenv, 'config', function() {
      throw new Error('Boom');
    });
    var error = null;
    try {
      loadenv();
    }
    catch (err) {
      error = err;
    }
    dotenv.config.restore();
    done(error);
  });
});
