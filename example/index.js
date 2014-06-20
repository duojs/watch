/**
 * Module Dependencies
 */

var Duo = require('duo');
var Watch = require('..');
var co = require('co');
var root = __dirname;

/**
 * Watch
 */

Watch(root).watch(function(file) {
  console.log('changed: %s', file);
  
  var duo = Duo(root)
   .entry(file)
  
  duo.run = co(duo.run);

  duo.run(function(err) {
    err && console.error(err);
    console.log('rebuilt: %s', file);
  });
});

console.log('waiting for changes...');
