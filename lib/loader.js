const Twig = require("twig");
const hashGenerator = require("hasha");
const mapcache = require("./mapcache");
const utils = require('loader-utils');

Twig.cache(false);

Twig.extend((Twig) => {
  const compiler = Twig.compiler;
  compiler.module['webpack'] = require("./compiler");
});

module.exports = (source) => {
  const options = utils.getOptions(this) || {};
  const path = require.resolve(this.resource);
  const id = hashGenerator(path);
  let tpl;

  mapcache.set(id, path)

  this.cacheable && this.cacheable();

  if (options.functions) {
    Object.entries(options.functions).forEach(([name, fn]) => Twig.extendFunction(name, fn));
  }

  if (options.filters) {
    Object.entries(options.filters).forEach(([name, fn]) => Twig.extendFilter(name, fn));
  }

  if (options.tests) {
    Object.entries(options.tests).forEach(([name, fn]) => Twig.extendTest(name, fn));
  }

  if (options.extend) {
    Twig.extend(options.extend);
  }

  tpl = Twig.twig({
    id: id,
    path: path,
    data: source,
    allowInlineIncludes: true
  });

  tpl = tpl.compile({
    module: 'webpack',
    twig: 'twig'
  });

  this.callback(null, tpl);
};
