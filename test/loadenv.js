var Lab = require('lab');
var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var Code = require('code');
var expect = Code.expect;

describe('loadenv', function() {
  before(function (done) {
    require('../index.js')();
    done();
  });

  it('should load default environment variables', function (done) {
    expect(process.env.DEFAULT_A).to.equal(123);
    expect(process.env.DEFAULT_C).to.equal('E=MC^2');
    done();
  });

  it('should load test environment variables', function (done) {
    expect(process.env.DEFAULT_B).to.equal('HELLO TEST');
    expect(process.env.SPECIAL_D).to.equal('ONLY IN TEST');
    done();
  });

  it('should not load environment after already loaded', function(done) {
    var original = process.env.SPECIAL_D;
    process.env.SPECIAL_D = 'different'
    require('../index.js')();
    expect(process.env.SPECIAL_D).to.equal('different');
    process.env.SPECIAL_D = original;
    done();
  });
});
