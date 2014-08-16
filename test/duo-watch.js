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

  describe('watch(root)', function() {

    it('should detect single file changes', function *() {
      var root = path('single');
      var js = yield duo(root).run();
      var watch = yield Watch(root);
      var called = 0;

      watch.watch(function(entry) {
        assert('index.js' == entry);
        called++;
      })

      touch(join(root, 'a.js'));
      yield wait(300);

      touch(join(root, 'b.js'));
      yield wait(300);

      touch(join(root, 'index.js'));
      yield wait(300);

      assert(3 == called, 'expected 3 got ' + called);
    });

    it('should detect multiple changes', function *() {
      var root = path('multiple');
      var home = duo(root, 'home.js');
      var admin = duo(root, 'admin.js');
      var entries = ['home.js', 'home.js', 'admin.js', 'admin.js'];

      yield [home.run(), admin.run()];

      var watch = yield Watch(root);

      watch.watch(function(entry) {
        var i = entries.indexOf(entry);
        if (~i) entries.splice(i, 1);
      })

      // trigger "change"
      touch(join(root, 'dep.js'));
      yield wait(300);

      // trigger "change"
      touch(join(root, 'component.json'));
      yield wait(300);

      assert(!entries.length);
    });

    it('should detect component.json changes', function *() {
      var root = path('single');
      var js = yield duo(root).run();
      var watch = yield Watch(root);
      var called = 0;


      watch.watch(function(entry) {
        assert('index.js' == entry);
        called++;
      })

      touch(join(root, 'component.json'));
      yield wait(300);

      assert(1 == called, 'expected 1 got ' + called);
    });
  })

});

/**
 * Watch
 */

function Watch(root) {
  return function(fn) {
    var w = new Watcher(root);
    w.sane.on('ready', function(err) {
      fn(err, w);
    });
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
