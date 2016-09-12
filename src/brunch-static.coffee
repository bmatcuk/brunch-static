anymatch = require 'anymatch'
mkdirp = require 'mkdirp'
touch = require 'touch'
path = require 'path'
fs = require 'fs'

module.exports = class BrunchStatic
  # We say we are a "template" plugin because javascript plugins will
  # append to the javascript file. This is a problem because,
  # if wrapping is enabled (like commonjs), this will cause a bunch of
  # empty crap to be written to the javascript file. Stylesheets, on the
  # other hand, don't have any wrapping but will trigger compilation watchers
  # as if the CSS has been changed. Instead, templates that return an empty string
  # to brunch after compiling will just result in an unwrapped but empty
  # line to the JS, which will be removed by minifying anyway. It's a hack =(
  brunchPlugin: true
  type: 'template'

  constructor: (config) ->
    @outputDir = path.join(path.resolve(process.cwd()), config?.paths?.public or 'public')
    @watchDirs = config?.paths?.watched or ['app', 'test', 'vendor']

    @options = config?.plugins?.static
    @processors = []
    if @options?.processors?.constructor is Array
      @processors = @options.processors
    if @options.pathTransform
      @pathTransform = @options.pathTransform

    # brunch is expecting pattern to be a regex with a test() method
    @.pattern =
      test: (filename) =>
        @getProcessor(filename) isnt null

  getProcessor: (filename) ->
    map = (p) ->
      if p.handles.constructor is Function
        (f) -> p.handles f
      else
        p.handles
    processorIdx = anymatch @processors.map(map), filename, true
    if processorIdx is -1 then null else @processors[processorIdx]

  pathTransform: (filename) -> filename

  compile: (data, filename, callback) ->
    # compile the file
    processor = @getProcessor filename
    unless processor
      callback null, ''
      return
    try
      processor.compile data, filename, (err, files, dependencies) =>
        if err
          callback err
          return
        unless files
          callback null, ''
          return

        for file in files
          # compute output path - remove the watched path from the front,
          # and turn it into an absolute path.
          basePath = file.filename
          for watched in @watchDirs
            if basePath.indexOf(watched) is 0
              basePath = path.relative watched, basePath
              break
          outputPath = path.join @outputDir, @pathTransform basePath

          # write file
          mkdirp path.dirname(outputPath), (err) =>
            if err
              console.log("ERROR: " + err);
            else
              fs.writeFile outputPath, file.content, (err) ->
                if err
                  console.log("ERROR: " + err);

        # done
        callback null, {data: '', dependencies: dependencies}
    catch err
      callback err

