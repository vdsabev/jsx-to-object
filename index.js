'use strict';

const esprima = require('esprima');
const defaultFactory = require('./factory');

const jsxToObject = (code, { factory } = {}) => {
  if (!factory) factory = defaultFactory;

  var tree = esprima.parseScript(code, { jsx: true, range: true });
  // return JSON.stringify(tree, null, 2);
  return parse(code, tree.body, { factory });
};

// https://facebook.github.io/jsx/
const parse = (code, nodes) => {
  let parsedCode = code;
  for (const node of nodes) {
    switch (node.type) {
      case 'JSXElement':
        parsedCode = [
          code.substring(0, node.range[0]),
          `({ type: '${node.openingElement.name.name}' })`,
          code.substring(node.range[1])
        ].join('');
        break;
      case 'ExpressionStatement':
        parsedCode = parse(code, [node.expression]);
        break;
      case 'VariableDeclaration':
        parsedCode = parse(code, node.declarations);
        break;
      case 'VariableDeclarator':
        parsedCode = parse(code, [node.init]);
        break;
    }
  }
  return parsedCode;
};

module.exports = jsxToObject;
// console.log(jsxToObject('<a />'));
