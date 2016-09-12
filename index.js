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
    if (this.options.pathTransform) {
      this.pathTransform = this.options.pathTransform;
    }
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

  BrunchStatic.prototype.pathTransform = function(filename) {
    return filename;
  };

  BrunchStatic.prototype.compile = function(data, filename, callback) {
    var err, error, processor;
    processor = this.getProcessor(filename);
    if (!processor) {
      callback(null, '');
      return;
    }
    try {
      return processor.compile(data, filename, (function(_this) {
        return function(err, files, dependencies) {
          var basePath, file, i, j, len, len1, outputPath, ref, watched;
          if (err) {
            callback(err);
            return;
          }
          if (!files) {
            callback(null, '');
            return;
          }
          for (i = 0, len = files.length; i < len; i++) {
            file = files[i];
            basePath = file.filename;
            ref = _this.watchDirs;
            for (j = 0, len1 = ref.length; j < len1; j++) {
              watched = ref[j];
              if (basePath.indexOf(watched) === 0) {
                basePath = path.relative(watched, basePath);
                break;
              }
            }
            outputPath = path.join(_this.outputDir, _this.pathTransform(basePath));
            mkdirp(path.dirname(outputPath), function(err) {
              if (err) {
                return console.log("ERROR: " + err);
              } else {
                return fs.writeFile(outputPath, file.content, function(err) {
                  if (err) {
                    return console.log("ERROR: " + err);
                  }
                });
              }
            });
          }
          return callback(null, {
            data: '',
            dependencies: dependencies
          });
        };
      })(this));
    } catch (error) {
      err = error;
      return callback(err);
    }
  };

  return BrunchStatic;

})();

