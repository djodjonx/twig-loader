const path = require("path");
const hashGenerator = require("hasha");
const _ = require("lodash");
const mapcache = require("./mapcache");

module.exports = (id, tokens, pathToTwig) => {
  const includes = [];
  const resourcePath = mapcache.get(id);
  const processDependency = (token) => {
    includes.push(token.value);
    token.value = hashGenerator(path.resolve(path.dirname(resourcePath), token.value));
  };

  const processToken = (token) => {
    if (token.type == "logic" && token.token.type) {
      switch(token.token.type) {
        case 'Twig.logic.type.block':
        case 'Twig.logic.type.if':
        case 'Twig.logic.type.elseif':
        case 'Twig.logic.type.else':
        case 'Twig.logic.type.for':
        case 'Twig.logic.type.spaceless':
        case 'Twig.logic.type.macro':
          _.each(token.token.output, processToken);
          break;
        case 'Twig.logic.type.extends':
        case 'Twig.logic.type.include':
          _.each(token.token.stack, processDependency);
          break;
        case 'Twig.logic.type.embed':
          _.each(token.token.output, processToken);
          _.each(token.token.stack, processDependency);
          break;
        case 'Twig.logic.type.import':
        case 'Twig.logic.type.from':
          if (token.token.expression != '_self') {
            _.each(token.token.stack, processDependency);
          }
          break;
      }
    }
  };

  const parsedTokens = JSON.parse(tokens);

  _.each(parsedTokens, processToken);

  const output = [
    `const twig = require("${pathToTwig}").twig`,
    `const template = twig({id: '${JSON.stringify(id)}', data: '${JSON.stringify(parsedTokens)}', allowInlineIncludes: true, rethrow: true});\n`,
    `module.exports = (context) => template.render(context);`
  ];

  if (includes.length > 0) {
    _.each(_.uniq(includes), (file) => {
      output.unshift(`require(${JSON.stringify(file)});\n`);
    });
  }

  return output.join('\n');
};