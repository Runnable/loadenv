# loadenv

![Build Status](https://travis-ci.org/Runnable/loadenv.svg?branch=master)
![Dependency Status](https://david-dm.org/Runnable/loadenv.svg)
![devDependency Status](https://david-dm.org/Runnable/loadenv/dev-status.svg)

[![NPM](https://nodei.co/npm/loadenv.png?compact=true)](https://nodei.co/npm/loadenv)

Utility for loading environment variables from a project's `configs/` directory.

## How it works

The module first finds your application's root directory and then attempts to
load environment variables found in the `configs/.env` file. Then, if a specific
`NODE_ENV` exists in the environment at run time it additionally loads variables
from the `configs/.env.${NODE_ENV}` file. *Note*: This module will not work if
installed globally [`npm install loadenv -g`].

### An Example

Suppose you have your project setup with the following configs:

```
configs/.env
  A=1
  B=2
configs/.env.test
  B=3
  C=4
```

If you launched your application without a `NODE_ENV` variable set, and called
into the module like so:

```js
require('loadenv')();
```

then the resulting `process.env` would now contain the following:

```
process.env.A === 1
process.env.B === 2
```

If instead, you launched your application with `NODE_ENV=test` then the
`process.env` would include the following:

```
process.env.A === 1
process.env.B === 3
process.env.C === 4
```

### Logging the Resulting Environment

The module uses debug to log the resulting environment after it has been loaded
from the `configs/` files. By default it uses `debug('loadenv')` but you can
override this by calling into the module with a custom name, like so:

```js
// Pass an options object:
require('loadenv')({
  debugName: 'myapp:env'
});

// Or just use a string if you only need the debug name
require('loadenv')('myapp:env') ;
```

If you were to do so then the module would use `debug('myapp:env')` to log the
resulting output.

### Only Loads Environment Once

No matter how many times you include the module, the environment is only loaded
once. So feel free to sprinkle loads wherever they might be needed to make your
code as modular as possible.

## Developing

If you want to contribute, make sure that all tests pass with 100% coverage
before submitting a pull request. Here's how to run the tests:

```
npm test
```


## LICENSE

MIT
