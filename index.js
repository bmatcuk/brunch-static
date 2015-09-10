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
    var dependency, i, len, processor, ref;
    if (this.dependencies[filename]) {
      ref = this.dependencies[filename];
      for (i = 0, len = ref.length; i < len; i++) {
        dependency = ref[i];
        touch.sync(dependency);
      }
    }
    processor = this.getProcessor(filename);
    if (!processor) {
      callback();
      return;
    }
    return processor.compile(data, filename, (function(_this) {
      return function(err, content, dependencies, dontWrite) {
        var basePath, j, k, len1, len2, outputPath, ref1, watched;
        if (err) {
          callback(err);
          return;
        }
        if (dontWrite) {
          callback();
          return;
        }
        if (dependencies && dependencies.constructor === Array) {
          for (j = 0, len1 = dependencies.length; j < len1; j++) {
            dependency = dependencies[j];
            if (_this.dependencies[dependency]) {
              if (_this.dependencies[dependency].indexOf(filename) === -1) {
                _this.dependencies[dependency].push(filename);
              }
            } else {
              _this.dependencies[dependency] = [filename];
            }
          }
        }
        basePath = filename;
        ref1 = _this.watchDirs;
        for (k = 0, len2 = ref1.length; k < len2; k++) {
          watched = ref1[k];
          if (basePath.indexOf(watched) === 0) {
            basePath = path.relative(watched, basePath);
            break;
          }
        }
        basePath = processor.transformPath(basePath);
        outputPath = path.join(_this.outputDir, basePath);
        return mkdirp(path.dirname(outputPath), function(err) {
          if (err) {
            callback(err);
            return;
          }
          return fs.writeFile(outputPath, content, function(err) {
            if (err) {
              return callback(err);
            } else {
              return callback();
            }
          });
        });
      };
    })(this));
  };

  return BrunchStatic;

})();

