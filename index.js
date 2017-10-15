'use strict';

const esprima = require('esprima');

const jsxToObject = (code) => {
  var tree = esprima.parseScript(code, { jsx: true, range: true });
  // return JSON.stringify(tree, null, 2);
  return parse(code, tree.body);
};

// https://facebook.github.io/jsx/
const parse = (code, nodes) => {
  let parsedCode = code;
  for (const node of nodes) {
    switch (node.type) {
      case 'JSXElement':
        let type;
        if (node.openingElement.name.name) {
          type = `type: '${node.openingElement.name.name}'`;
        }

        let props;
        if (node.openingElement.attributes.length > 0) {
          props = 'props: { ' + node.openingElement.attributes.map((attr) => `${attr.name.name}: ${attr.value ? attr.value.raw : 'true'}`).join(', ') + ' }';
        }

        let children;
        if (node.children.length > 0) {
          const childrenStart = code.substring(node.openingElement.range[1]);
          const childrenEnd = code.substring(node.closingElement.range[0]);
          console.log(' '.repeat(childrenStart) + code.substring(childrenStart))
          children = 'children: [' + parse(' '.repeat(childrenStart) + code.substring(childrenStart, childrenEnd), node.children) + ']';
        }

        parsedCode = [
          code.substring(0, node.range[0]),
          `({ ${[type, props, children].filter(identity).join(', ')} })`,
          code.substring(node.range[1])
        ].join('');
        break;
      case 'JSXText':
        parsedCode = [
          code.substring(0, node.range[0]),
          `'${node.raw}'`,
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

const identity = (x) => x;

module.exports = jsxToObject;
// console.log(jsxToObject('<a b="c"></a>'));
