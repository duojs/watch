/**
 * Module dependencies
 */

var debug = require('debug')('duo-watch');
var assert = require('assert');
var sane = require('sane');
var path = require('path');
var fs = require('fs');
var join = path.join;

/**
 * Export `Watch`
 */

module.exports = Watch;

/**
 * Initialize `Watch`
 *
 * @param {String} root
 * @param {String} glob (optional)
 */

function Watch(root, glob) {
  if (!(this instanceof Watch)) return new Watch(root, glob);
  assert(root, 'must pass a root into watch');
  
  this.mappingPath = join(root, 'components', 'duo.json');
  this.watched = function(){};
  this.idx = this.index();
  
  this.glob = glob || '**/*.{js,css}';
  this.root = root;

  // file watching
  this.sane = sane(root, glob)
    .on('change', this.change.bind(this));
}

/**
 * deps - get an array of dependencies
 */

Watch.prototype.deps = function(file, out) {
  out = out || [];
  
  var files = this.mapping[file].deps;
  var root = this.root;
  var file;
  
  for (var req in files) {
    file = files[req];
    out.push(file);
    this.deps(file, out);
  }

  return out;
};

/**
 * index
 */

Watch.prototype.index = function() {
  this.mapping = this.json(this.mappingPath);

  this.entries = entries(this.mapping);
  var idx = {};

  for (var i = 0, entry; entry = this.entries[i]; i++) {
    idx[entry] = this.deps(entry);
  }

  return idx;
};



/**
 * onchange
 */

Watch.prototype.change = function(file) {
  debug('changed: %s', file);
  var idx = this.idx = this.idx || this.index();

  var fn = this.watched;

  // is an entry
  if (idx[file]) return fn(file);

  // get all the affected entries
  for (var entry in idx) {
    ~idx[entry].indexOf(file) && fn(entry);
  }
};

/**
 * watch
 */

Watch.prototype.watch = function(fn) {
  var self = this;
  this.watched = watched;
  return this;

  function watched(file) {
    self.idx = false;
    return fn(file);
  }
};

/**
 * JSON
 */

Watch.prototype.json = function (path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (e) {
    return {};
  }
}

/**
 * close
 */

Watch.prototype.close = function() {
  this.sane.close();
  return this;
};


/**
 * Entries
 */

function entries(json) {
  var out = [];

  for (var dep in json) {
    json[dep].entry && out.push(dep);
  }

  return out;
}
