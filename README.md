![Release](https://img.shields.io/npm/v/brunch-static.svg)

# brunch-static
Transform static files using brunch.

[Brunch](http://brunch.io) is great for doing all sorts of transpiling, compiling, minifying, uglfying, combining, and other such activities on CSS and Javascript files. But what if you have a file that isn't CSS or Javascript (and doesn't transpile into those things), and you want to convert it into something else in your output? For example, maybe you don't want to write boring HTML when you could be using something more friendly (like [jade](http://jade-lang.com/)). Brunch isn't really designed for that.

**Enter brunch-static.**

brunch-static is a plugin that makes it possible to write _other_ plugins (called "processors") that can operate on files, outputting a "static" file (or files) in your output directory. Several brunch plugins attempt to solve this problem on their own, but they all suffer from some drawback. It is the aim of brunch-static to solve these problems, while making it easy to write a static plugin.

If you want to dive into writing your own processor, [jump down](#writing-brunch-static-processors). Otherwise, keep reading.

## Installation
Install the plugin via npm with `npm install --save-dev brunch-static`

Or manually:

* Add `"brunch-static": "x.y.z"` to `package.json` and run `npm install`
* If you want to use the git version, add: `"brunch-static": "git+ssh://git@github.com:bmatcuk/brunch-static.git"`

## Configuration
brunch-static's only config is a list of processors you want. In your `brunch-config.coffee`, you can add your static processors:

```coffee
exports.config =
  ...
  plugins:
    static:
      pathTransform: ((filename) -> ...)
      processors: [
        ...
      ]
```

* **pathTransform** _(default: `(f) -> f`)_
  > _pathTransform_ converts the input path into the output path. The input to this function will be the file's path, relative to one of Brunch's `paths.watched` directories. For example, if you've configured Brunch to watch the `app` directory and you have a file named `app/pages/index.static.hbs`, then `pages/index.static.hbs` will be passed into _pathTransform_. The value returned from this function will be joined with Brunch's `paths.public` to form the final output path. So, in the earlier example, if you wanted files under the `pages` subdirectory to appear in the root of the output, you might write a _pathTransform_ such as: `(f) -> path.relative 'pages', f`. This would cause `app/pages/index.static.hbs` to output to `public/index.html`.

## Available Processors
Below is a list of available processors. If you'd like your processor to be included in this list, [create an issue](https://github.com/bmatcuk/brunch-static/issues/new) with your project's URL and a description.

* [html-brunch-static](https://github.com/bmatcuk/html-brunch-static)

  Build static websites using brunch and your favorite templating language. Supports layouts and partial views and currently supports the following templating languages:

  * [markdown](https://github.com/bmatcuk/marked-brunch-static)
  * [jade](https://github.com/bmatcuk/jade-brunch-static)
  * handlebars is built-in

## Writing brunch-static Processors
### What Does brunch-static Do?
Ok, so, first, what do you get with brunch-static?

1. brunch-static will write your output file(s), taking care to create subdirectories as necessary.
2. brunch-static will not add any output to the brunch output files.

### Processors
Processors are kind of similar to Brunch plugins theselves: an object that has certain members and methods. It's recommended that your project follows the naming scheme: `whatever-brunch-static` to make it easy to find in npm.

```javascript
var MyStaticProcessor = function(config) { ... };

MyStaticProcessor.prototype = {
  handles: ...,
  compile: function(data, filename, callback) { ... }
};

// export a simple function to make it easier to include in brunch-config.coffee
module.exports = function(config) { return new MyStaticProcessor(config); };
```

* **handles**
  > _handles_ is an [anymatch](https://github.com/es128/anymatch) that will be used to determine if your processor can handle a given file. This means it can either be a string (using globs), a regex, or a function that takes a single parameter (the filename) and returns true if your processor can handle it, or false otherwise.

* **compile**
  > _compile_ is a function that will receive the contents of the file, the file's name, and a callback function. After you have finished processing the file's data, you will need to call the callback function with the following:
  >
  > * `callback(err, files, dependencies)`
  >   * **err** informs brunch-static when something goes wrong. If there were no issues, pass null.
  >   * **files** an array of objects in the form: `[ {filename: "...", content: "..."}, {...}, ... ]`
  >     * **filename** is the relative path of the output file. For example, if the input path was `app/path/to/file.jade`, **filename** might be something like `app/path/to/file.html`. brunch-static will automatically remove any of the "watched" paths from **filename** (like `app` in this example) and place it in the output directory. In this example, the final path might be `public/path/to/file.html`.
  >     * **content** is the result of your processor.
  >   * **dependencies** is an array of relative paths to any dependencies. For example, you might have dependencies on: `[ 'app/path/to/layout.jade', 'app/path/to/partial.jade' ]`.
  >
  > If **files** is null or undefined, nothing will be written. If **dependencies** is null or undefined, no dependencies will be tracked.

