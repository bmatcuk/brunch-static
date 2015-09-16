var BrunchStatic, anymatch, fs, mkdirp, path, touch;

anymatch = require('anymatch');

mkdirp = require('mkdirp');

touch = require('touch');

path = require('path');

fs = require('fs');

module.exports = BrunchStatic = (function() {
  BrunchStatic.prototype.brunchPlugin = true;

  BrunchStatic.prototype.type = 'template';

  function BrunchStatic(config) {
    var ref, ref1, ref2, ref3, ref4;
    this.outputDir = path.join(path.resolve(process.cwd()), (config != null ? (ref = config.paths) != null ? ref["public"] : void 0 : void 0) || 'public');
    this.watchDirs = (config != null ? (ref1 = config.paths) != null ? ref1.watched : void 0 : void 0) || ['app', 'test', 'vendor'];
    this.options = config != null ? (ref2 = config.plugins) != null ? ref2["static"] : void 0 : void 0;
    this.processors = [];
    if (((ref3 = this.options) != null ? (ref4 = ref3.processors) != null ? ref4.constructor : void 0 : void 0) === Array) {
      this.processors = this.options.processors;
    }
    this.dependencies = {};
    this.pattern = {
      test: (function(_this) {
        return function(filename) {
          return _this.getProcessor(filename) !== null;
        };
      })(this)
    };
  }

  BrunchStatic.prototype.getProcessor = function(filename) {
    var map, processorIdx;
    map = function(p) {
      if (p.handles.constructor === Function) {
        return function(f) {
          return p.handles(f);
        };
      } else {
        return p.handles;
      }
    };
    processorIdx = anymatch(this.processors.map(map), filename, true);
    if (processorIdx === -1) {
      return null;
    } else {
      return this.processors[processorIdx];
    }
  };

  BrunchStatic.prototype.compile = function(data, filename, callback) {
    var dependency, err, fn, i, len, processor, ref;
    if (this.dependencies[filename]) {
      ref = this.dependencies[filename];
      fn = (function(_this) {
        return function(dependency) {
          return touch(dependency, {
            nocreate: true
          }, function(err) {
            var idx;
            if (err) {
              idx = _this.dependencies[filename].indexOf(dependency);
              if (idx !== -1) {
                return _this.dependencies[filename].splice(idx, 1);
              }
            }
          });
        };
      })(this);
      for (i = 0, len = ref.length; i < len; i++) {
        dependency = ref[i];
        fn(dependency);
      }
    }
    processor = this.getProcessor(filename);
    if (!processor) {
      callback();
      return;
    }
    try {
      return processor.compile(data, filename, (function(_this) {
        return function(err, files, dependencies) {
          var basePath, file, idx, j, k, key, l, len1, len2, len3, len4, m, outputPath, ref1, ref2, results, watched;
          if (err) {
            callback(err);
            return;
          }
          if (!files) {
            callback();
            return;
          }
          if (dependencies && dependencies.constructor === Array) {
            ref1 = Object.keys(_this.dependencies);
            for (j = 0, len1 = ref1.length; j < len1; j++) {
              key = ref1[j];
              while ((idx = _this.dependencies[key].indexOf(filename)) !== -1) {
                _this.dependencies[key].splice(idx, 1);
              }
            }
            for (k = 0, len2 = dependencies.length; k < len2; k++) {
              dependency = dependencies[k];
              if (_this.dependencies[dependency]) {
                _this.dependencies[dependency].push(filename);
              } else {
                _this.dependencies[dependency] = [filename];
              }
            }
          }
          results = [];
          for (l = 0, len3 = files.length; l < len3; l++) {
            file = files[l];
            basePath = file.filename;
            ref2 = _this.watchDirs;
            for (m = 0, len4 = ref2.length; m < len4; m++) {
              watched = ref2[m];
              if (basePath.indexOf(watched) === 0) {
                basePath = path.relative(watched, basePath);
                break;
              }
            }
            outputPath = path.join(_this.outputDir, basePath);
            results.push(mkdirp(path.dirname(outputPath), function(err) {
              if (err) {
                callback(err);
                return;
              }
              return fs.writeFile(outputPath, file.content, function(err) {
                if (err) {
                  return callback(err);
                } else {
                  return callback();
                }
              });
            }));
          }
          return results;
        };
      })(this));
    } catch (_error) {
      err = _error;
      return callback(err);
    }
  };

  return BrunchStatic;

})();

