anymatch = require 'anymatch'
mkdirp = require 'mkdirp'
touch = require 'touch'
path = require 'path'
fs = require 'fs'

module.exports = class BrunchStatic
  brunchPlugin: true
  type: 'template'

  constructor: (config) ->
    @outputDir = path.join(path.resolve(process.cwd()), config?.paths?.public or 'public')
    @watchDirs = config?.paths?.watched or ['app', 'test', 'vendor']

    @options = config?.plugins?.static
    @processors = []
    if @options?.processors?.constructor is Array
      @processors = @options.processors

    @dependencies = {}

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

  compile: (data, filename, callback) ->
    # Callback takes an error and a result. We have two options here: return
    # null for the result, or an empty string. If we return null, brunch will
    # assume we didn't handle the file and try other plugins. It will also
    # ignore our dependency information since we "didn't handle the file". If
    # we return an empty string, brunch will handle dependencies correctly,
    # but it will also append to the template file. If the user has brunch
    # configured to wrap javascript (with commonjs, for example), this will
    # cause a bunch of useless crap to be appended to the template file.
    # Unfortunately, we cannot solve the latter problem without modifying
    # brunch, but we can solve the former problem by tracking dependencies
    # ourselves and using touch.sync() to trigger recompiles in brunch.

    # "touch" dependent files
    if @dependencies[filename]
      touch.sync(dependency) for dependency in @dependencies[filename]

    # compile the file
    processor = @getProcessor filename
    unless processor
      do callback
      return
    processor.compile data, filename, (err, content, dependencies, dontWrite) =>
      if err
        callback err
        return
      if dontWrite
        # if we aren't writing it, we don't care about dependencies
        do callback
        return

      # update dependency information
      if dependencies and dependencies.constructor is Array
        for dependency in dependencies
          if @dependencies[dependency]
            if @dependencies[dependency].indexOf(filename) is -1
              @dependencies[dependency].push filename
          else
            @dependencies[dependency] = [filename]

      # compute output path - remove the watched path from the front,
      # transform it through the processor, then make absolute
      basePath = filename
      for watched in @watchDirs
        if basePath.indexOf(watched) is 0
          basePath = path.relative watched, basePath
          break
      basePath = processor.transformPath basePath
      outputPath = path.join @outputDir, basePath

      # write file
      mkdirp path.dirname(outputPath), (err) =>
        if err
          callback err
          return

        fs.writeFile outputPath, content, (err) ->
          if err
            callback err
          else
            do callback

