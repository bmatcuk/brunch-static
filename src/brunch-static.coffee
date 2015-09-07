anymatch = require 'anymatch'
mkdirp = require 'mkdirp'
path = require 'path'
fs = require 'fs'

module.exports = class BrunchStatic
  brunchPlugin: true
  type: 'template'

  constructor: (config) ->
    @outputDir = path.join(path.resolve(process.cwd()), config?.paths?.public or 'public')
    @options = config?.plugins?.static
    @processors = []
    if @options?.processors?.constructor is Array
      @processors = @options.processors

  pattern:
    # brunch is expecting pattern to be a regex with a test() method
    test: (filename) ->
      anymatch @processors.map((p) -> p.handles), filename

  getDependencies: (data, filename, callback) ->
    deps = []
    fm = frontMatter.loadFront data
    deps = fm.dependencies if fm.dependencies?
    deps.push fm.layout if fm.layout?
    deps

  compile: (data, filename, callback) ->
    processorIdx = anymatch @processors.map((p) -> p.handles), filename, true
    if processorIdx is -1
      do callback
      return

    processor = @processors[processorIdx]
    processor.compile data, filename, (err, content) =>
      if err
        callback err
        return

      basePath = processor.transformPath filename
      outputPath = path.join @outputDir, basePath
      mkdirp path.dirname(outputPath), (err) =>
        if err
          callback err
          return

        fs.writeFile outputPath, content, (err) ->
          if err
            callback err
          else
            do callback

