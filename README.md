# static-brunch
Transform static files using brunch.

[Brunch](http://brunch.io) is great for doing all sorts of transcoding, compiling, minifying, uglfying, combining, and other such "-ing"-ing of CSS and Javascript. But what if you have a file that isn't CSS or Javascript (and doesn't transcode into those things), and you want to convert it into something else in your output? Like, maybe you don't want to write straight HTML when you could be using something more friendly (like [jade](http://jade-lang.com/)). Brunch isn't really designed for that.

*Enter static-brunch.*

static-brunch is a plugin that makes it possible to write _other_ plugins (called "processors") that can operate on files, outputting a "static" file in your output directory. Several brunch plugins attempt to solve this problem on their own, but they all suffer from some drawback. It is the aim of static-brunch to solve these problems, while making it easy to write a static plugin.

If you want to dive into writing your own processor, [jump down](#writing-static-brunch-processors).

## Installation
Install the plugin via npm with `npm install --save static-brunch`

Or manually:

* Add `"static-brunch": "x.y.z"` to `package.json` and run `npm install`
* If you want to use the git version, add: `"static-brunch": "git+ssh://git@github.com:bmatcuk/static-brunch.git"`

## Configuration
static-brunch's only config is a list of processors you want. In your `brunch-config.coffee`, you can add your static processors:

```coffee
exports.config =
  ...
  plugins:
    static:
      processors: [
        ...
      ]
```

## Writing static-brunch Processors
### What Does static-brunch Do?
Ok, so, first, what do you get with static-brunch?

1. static-brunch will write your output file, taking care to create subdirectories as necessary.
2. static-brunch will handle dependencies for interconnected files
3. static-brunch will not add any output to the brunch template file.

### Processors

