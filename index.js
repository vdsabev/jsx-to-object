'use strict';

const walk = require('acorn/dist/walk');
const acorn = require('acorn-jsx');

const defaultFactory = require('./factory');

const jsxToObject = (code, { evaluate, factory } = {}) => {
  // NOTE: Yes, we're using `eval` here! Do you have a better idea? Please, create an issue, or better yet - a PR!
  if (!evaluate) evaluate = eval;
  if (!factory) factory = defaultFactory.toString();

  var ast = acorn.parse(code, { plugins: { jsx: true } });

  let result = code;
  walk.full(ast, (node) => {
    if (node.type === 'JSXElement') {
      const expression = code.substring(node.start, node.end);
      console.log(expression);
      const evaluatedExpression = JSON.stringify(evaluate(`(${factory})${expression}`));
      result = code.substring(0, node.start) + `(${evaluatedExpression})` + code.substring(node.end);
    }
  });

  return result;
};

module.exports = jsxToObject;
