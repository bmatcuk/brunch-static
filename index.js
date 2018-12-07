var BrunchStatic, anymatch, fs, mkdirp, path, touch;

anymatch = require('anymatch');

mkdirp = require('mkdirp');

touch = require('touch');

path = require('path');

fs = require('fs');

module.exports = BrunchStatic = (function() {
  class BrunchStatic {
    constructor(config) {
      var ref, ref1, ref2, ref3, ref4;
      this.outputDir = path.join(path.resolve(process.cwd()), (config != null ? (ref = config.paths) != null ? ref.public : void 0 : void 0) || 'public');
      this.watchDirs = (config != null ? (ref1 = config.paths) != null ? ref1.watched : void 0 : void 0) || ['app', 'test', 'vendor'];
      this.options = config != null ? (ref2 = config.plugins) != null ? ref2.static : void 0 : void 0;
      this.processors = [];
      if (((ref3 = this.options) != null ? (ref4 = ref3.processors) != null ? ref4.constructor : void 0 : void 0) === Array) {
        this.processors = this.options.processors;
      }
      if (this.options.pathTransform) {
        this.pathTransform = this.options.pathTransform;
      }
      // brunch is expecting pattern to be a regex with a test() method
      this.pattern = {
        test: (filename) => {
          return this.getProcessor(filename) !== null;
        }
      };
    }

    getProcessor(filename) {
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
    }

    pathTransform(filename) {
      return filename;
    }

    compile(data, filename, callback) {
      var err, processor;
      // compile the file
      processor = this.getProcessor(filename);
      if (!processor) {
        callback(null, '');
        return;
      }
      try {
        return processor.compile(data, filename, (err, files, dependencies) => {
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
            // compute output path - remove the watched path from the front,
            // and turn it into an absolute path.
            basePath = file.filename;
            ref = this.watchDirs;
            for (j = 0, len1 = ref.length; j < len1; j++) {
              watched = ref[j];
              if (basePath.indexOf(watched) === 0) {
                basePath = path.relative(watched, basePath);
                break;
              }
            }
            outputPath = path.join(this.outputDir, this.pathTransform(basePath));
            // write file
            mkdirp(path.dirname(outputPath), (err) => {
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
        });
      } catch (error) {
        err = error;
        return callback(err);
      }
    }

  };

  // We say we are a "template" plugin because javascript plugins will
  // append to the javascript file. This is a problem because,
  // if wrapping is enabled (like commonjs), this will cause a bunch of
  // empty crap to be written to the javascript file. Stylesheets, on the
  // other hand, don't have any wrapping but will trigger compilation watchers
  // as if the CSS has been changed. Instead, templates that return an empty string
  // to brunch after compiling will just result in an unwrapped but empty
  // line to the JS, which will be removed by minifying anyway. It's a hack =(
  BrunchStatic.prototype.brunchPlugin = true;

  BrunchStatic.prototype.type = 'template';

  return BrunchStatic;

}).call(this);

