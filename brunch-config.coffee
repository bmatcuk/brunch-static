exports.config =
  paths:
    public: '.'
    watched: ['src']

  files:
    javascripts:
      joinTo: 'index.js'
      order:
        after: 'src/brunch-static.coffee'

  modules:
    wrapper: false
    definition: false

  sourceMaps: false

  overrides:
    production:
      optimize: false

