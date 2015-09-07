var BrunchStatic, anymatch, fs, mkdirp, path;

anymatch = require('anymatch');

mkdirp = require('mkdirp');

path = require('path');

fs = require('fs');

module.exports = BrunchStatic = (function() {
  BrunchStatic.prototype.brunchPlugin = true;

  BrunchStatic.prototype.type = 'template';

  function BrunchStatic(config) {
    var ref, ref1, ref2, ref3;
    this.outputDir = path.join(path.resolve(process.cwd()), (config != null ? (ref = config.paths) != null ? ref["public"] : void 0 : void 0) || 'public');
    this.options = config != null ? (ref1 = config.plugins) != null ? ref1["static"] : void 0 : void 0;
    this.processors = [];
    if (((ref2 = this.options) != null ? (ref3 = ref2.processors) != null ? ref3.constructor : void 0 : void 0) === Array) {
      this.processors = this.options.processors;
    }
  }

  BrunchStatic.prototype.pattern = {
    test: function(filename) {
      return anymatch(this.processors.map(function(p) {
        return p.handles;
      }), filename);
    }
  };

  BrunchStatic.prototype.getDependencies = function(data, filename, callback) {
    var deps, fm;
    deps = [];
    fm = frontMatter.loadFront(data);
    if (fm.dependencies != null) {
      deps = fm.dependencies;
    }
    if (fm.layout != null) {
      deps.push(fm.layout);
    }
    return deps;
  };

  BrunchStatic.prototype.compile = function(data, filename, callback) {
    var processor, processorIdx;
    processorIdx = anymatch(this.processors.map(function(p) {
      return p.handles;
    }), filename, true);
    if (processorIdx === -1) {
      callback();
      return;
    }
    processor = this.processors[processorIdx];
    return processor.compile(data, filename, (function(_this) {
      return function(err, content) {
        var basePath, outputPath;
        if (err) {
          callback(err);
          return;
        }
        basePath = processor.transformPath(filename);
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

