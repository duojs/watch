/**
 * Module Dependencies
 */

var readdir = require('fs').readdirSync;
var write = require('fs').writeFileSync;
var read = require('fs').readFileSync;
var rmdir = require('fs').unlinkSync;
var mkdir = require('mkdirp').sync;
var stat = require('fs').statSync;
var touch = require('touch').sync;
var join = require('path').join;
var assert = require('assert');
var Watcher = require('..');
var Duo = require('duo');

/**
 * Fixtures
 */

var fixtures = join(__dirname, 'fixtures');

/**
 * Tests
 */

describe('duo-watch', function() {

  before(function() {
    var dirs = readdir(fixtures);
    var components = dirs.map(function(dir) {
      return join(dir, 'components');
    });

    for (var i = 0, component; component = components[i++];) {
      try {
        rmdir(component);
      } catch(e) {}
    }
  });

  describe('watch(root, file)', function() {

    it('should detect single file changes', function *() {
      var root = path('single');
      var js = yield duo(root).run();
      var json = manifest(root);
      var watch = yield Watch(root, 'index.js');
      var called = 0;

      watch.watch(function(entry) {
        assert('index.js' == entry);
        called++;
      })

      var a = change(join(root, 'a.js'));
      yield wait(300);

      var b = change(join(root, 'b.js'));
      yield wait(300);

      var index = change(join(root, 'index.js'));
      yield wait(300);

      assert(3 == called, 'expected 3 got ' + called);

      // unchange everything
      index();
      a();
      b();
    })
  })

});

/**
 * Watch
 */

function Watch(root, file) {
  return function(fn) {
    var w = new Watcher(root, file);
    w.sane.on('ready', function(err) {
      fn(err, w);
    });
  }
}

/**
 * change
 */

function change(path) {
  var str = read(path, 'utf-8');
  write(path, str + '!');

  return function() {
    write(path, str);
  }
}

/**
 * wait
 */

function wait(ms) {
  return function(fn) {
    setTimeout(fn, ms);
  }
}

/**
 * mtime
 */

function mtime(path) {
  return stat(path).mtime;
}

/**
 * path
 */

function path(fixture) {
  return join(fixtures, fixture);
}

/**
 * duo
 */

function duo(root, entry) {
  entry = entry || 'index.js';

  return Duo(root)
    .entry(entry);
}

/**
 * Manifest
 */

function manifest(root) {
  manifest = join(root, 'components', 'duo.json');
  return require(manifest);
}
