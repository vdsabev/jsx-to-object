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
      // TODO: Refactor
      case 'JSXElement':
        const element = {
          type: node.openingElement.name.name
        };

        if (node.openingElement.attributes.length > 0) {
          element.props = '{ ' + node.openingElement.attributes.map((attr) => `${attr.name.name}: ${attr.value ? attr.value.raw : 'true'}`).join(', ') + ' }';
        }

        if (node.children.length > 0) {
          const childrenStart = code.substring(node.openingElement.range[1]);
          const childrenEnd = code.substring(node.closingElement.range[0]);
          element.children = '[' + parse(' '.repeat(childrenStart) + code.substring(childrenStart, childrenEnd), node.children) + ']';
        }

        const elementCode = /[a-z]/.test(element.type.charAt(0)) ?
          // Intrinsic element
          `({ ${[
            element.type ? `type: '${element.type}'` : null,
            element.props ? `props: ${element.props}` : null,
            element.children ? `children: ${element.children}` : null
          ].filter(identity).join(', ')} })`
          :
          // Component
          // NOTE: Replacing the component with a function call means we can't utilize caching provided by some Virtual DOM libraries
          `${element.type}(${[element.props || 'null', element.children].filter(identity).join(', ')})`
        ;

        parsedCode = [
          code.substring(0, node.range[0]),
          elementCode,
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

const prefixProp = (obj, key) => obj[key] != null ? `${key}: ${obj[key]}` : null;

const identity = (x) => x;

module.exports = jsxToObject;
// console.log(jsxToObject('<A b="c">d</A>'));
