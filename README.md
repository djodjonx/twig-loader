# twig-webpack-loader
Webpack loader for compiling Twig.js templates. This loader will allow you to require Twig.js views to your code.
fork from [twig-loader](https://github.com/zimmo-be/twig-loader)

## Installation

`npm install --save-dev twig-webpack-loader`

## Usage

[Documentation: Using loaders](http://webpack.github.io/docs/using-loaders.html?branch=master)

``` javascript

module.exports = {
    //...

    module: {
        loaders: [
            { test: /\.twig$/, loader: "twig-webpack-loader" }
        ]
    },

    node: {
        fs: "empty" // avoids error messages
    }
};
```

## Loading templates

```twig
{# File: dialog.html.twig #}
<p>{{title}}</p>
```

```javascript
// File: app.js
const template = require("dialog.html.twig");
// => returns pre-compiled template as a function and automatically includes Twig.js to your project

const html = template({title: 'dialog title'});
// => Render the view with the given context

```

## Options

|Name|Type|Default|Description|
|--|--|-----|----------|
|data|object or function(context)|{}|The data that is exposed in the templates. Function should return an object'|
|functions|object|undefined|Extends Twig with custom functions
|filters|object|undefined|Extends Twig with custom filters
|tests|object|undefined|Extends Twig with custom tests
|extend|function(Twig)|undefined|Extends Twig with custom tags and more

When you extend another view, it will also be added as a dependency. All twig functions that refer to additional templates are supported: import, include, extends & embed.

## Custom functions, filters, tests and tags

You can use `functions`, `filters`, `tests` and `extend` options to extend Twig. See [here for adding custom functions, filters and tests](https://github.com/twigjs/twig.js/wiki/Extending-twig.js), and [here for adding custom tags](https://github.com/twigjs/twig.js/wiki/Extending-twig.js-With-Custom-Tags).

```js
module.exports = {
  // ...
  rules: [
    // ...
    {
      test: /\.twig$/,
      use: [
        {
          loader: 'twig-webpack-loader',
          options: {
            functions: {
              repeat(value, times) {
                return new Array(times + 1).join(value);
              }
            },
            filters: {
              backwords(value) {
                return value.split(' ').reverse().join(' ');
              }
            },
            tests: {
              theAnswer(value) {
                return value === 42;
              }
            },
            extend(Twig) {
              Twig.exports.extendTag({
                type: 'echo',
                regex: /^echo\s+(.+)$/,
                next: [],
                open: true,
                compile: function (token) {
                  var expression = token.match[1];

                  token.stack = Twig.expression.compile.apply(this, [{
                    type: Twig.expression.type.expression,
                    value: expression
                  }]).stack;

                  delete token.match;
                  return token;
                },
                parse: function (token, context, chain) {
                  return {
                    chain: false,
                    output: Twig.expression.parse.apply(this, [token.stack, context])
                  };
                }
              });
            }
          }
        }
      ]
    }
    // ...
  ]
};
```


## Changelog
0.1.0 / 2019-03-08
==================
 * add options for extend Twig

