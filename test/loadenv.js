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

// Set applicationRoot value as it would be if in `node_modules/`
loadenv.__set__(
  'applicationRoot',
  require('app-root-path')+'/node_modules/loadenv/../../'
);

describe('loadenv', function() {
  afterEach(function (done) {
    loadenv.restore();
    done();
  });

  it('should not try to restore the environment if it has not been loaded', function(done) {
    var env = process.env;
    loadenv.restore();
    expect(process.env).to.equal(env);
    done();
  });

  it('should accept string arguments as debugName option', function (done) {
    expect(function () {
      loadenv('wowza')
    }).to.not.throw()
    done()
  })

  it('should not throw on a null env value', function(done) {
    process.env.neat = null;
    expect(function () {
      loadenv({ ignoreNodeEnv: true });
    }).to.not.throw();
    done();
  });

  it('should load default environment variables', function (done) {
    loadenv({ ignoreNodeEnv: true });
    expect(process.env.DEFAULT_A).to.equal(123);
    expect(process.env.DEFAULT_B).to.equal('HELLO WORLD');
    expect(process.env.DEFAULT_C).to.equal('E=MC^2');
    expect(process.env.DEFAULT_D).to.equal(56.97);
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

  it('should load the project environment', function(done) {
    loadenv({
      project: 'sub-project',
      ignoreNodeEnv: true
    });
    expect(process.env.DEFAULT_A).to.equal(123);
    expect(process.env.DEFAULT_B).to.equal('HELLO WORLD');
    expect(process.env.DEFAULT_C).to.equal('wow');
    expect(process.env.DEFAULT_D).to.equal(56.97);
    done();
  });

  it('should load the project with a node environment', function(done) {
    loadenv({ project: 'sub-project' });
    expect(process.env.DEFAULT_A).to.equal(123);
    expect(process.env.DEFAULT_B).to.equal('HELLO TEST');
    expect(process.env.DEFAULT_C).to.equal('wow');
    expect(process.env.DEFAULT_D).to.equal(56.97);
    expect(process.env.DEFAULT_E).to.equal("ONLY IN PROJECT TEST");
    expect(process.env.SPECIAL_D).to.equal('THIS IS PROJECT TEST');
    done();
  });

  it('should throw when given a non-string project', function(done) {
    expect(function () {
      loadenv({ project: 203 });
    }).to.throw(/option must be a string/);
    done();
  });

  it('should remove trailing slashes from project paths', function(done) {
    loadenv({ project: 'sub-project///' });
    expect(process.env.DEFAULT_E).to.equal("ONLY IN PROJECT TEST");
    expect(process.env.SPECIAL_D).to.equal('THIS IS PROJECT TEST');
    done();
  });
});
