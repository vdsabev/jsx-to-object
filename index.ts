import { parseScript, parseModule } from 'esprima';

export interface JsxToObjectOptions {
  isScript?: boolean;
}

interface VNode {
  type: string;
  props?: string;
  children?: string;
}

interface Node {
  type: string;
  openingElement: NodeElement;
  closingElement: NodeElement;
  range: number[];
  raw: string;
  children: Node[];
  expression: Node[];
  declarations: Node[];
  init: Node[];
  body: Node[];
  argument: Node[];
  declaration: Node[];
}

interface NodeElement {
  name: { name: string };
  attributes: NodeAttribute[];
  range: number[];
}

interface NodeAttribute {
  name: { name: string };
  value: { raw: string };
}

export const jsxToObject = (code: string, options: JsxToObjectOptions = {}) => {
  const getAST = options.isScript ? parseScript : parseModule;
  var tree = getAST(code, { jsx: true, range: true });
  return parse(code, tree.body as any);
};

// https://facebook.github.io/jsx/
const parse = (code: string, nodes: Node | Node[]) => {
  let parsedCode = code;
  console.log(`ENTER:`, parsedCode);

  if (!Array.isArray(nodes)) {
    nodes = [nodes];
  }

  for (const node of nodes) {
    console.log(node);
    switch (node.type) {
      case 'JSXElement':
        const element: VNode = {
          type: node.openingElement.name.name,
        };

        if (node.openingElement.attributes.length > 0) {
          element.props =
            '{ ' +
            node.openingElement.attributes
              .map((attr) => `${attr.name.name}: ${attr.value ? attr.value.raw : 'true'}`)
              .join(', ') +
            ' }';
        }

        if (node.children.length > 0) {
          const childCode = code.slice(node.openingElement.range[1], node.closingElement.range[0]);
          element.children = '[' + parse(childCode, node.children) + ']';
        }

        const elementCode = /[a-z]/.test(element.type.charAt(0))
          ? // Intrinsic element
            '({ ' +
            format([
              element.type ? `type: '${element.type}'` : null,
              element.props ? `props: ${element.props}` : null,
              element.children ? `children: ${element.children}` : null,
            ]) +
            ' })'
          : // Component
            element.type + '(' + format([element.props || 'null', element.children]) + ')';

        parsedCode = [code.slice(0, node.range[0]), elementCode, code.slice(node.range[1])].join('');
        break;
      case 'JSXText':
        parsedCode = [code.slice(0, node.range[0]), `'${node.raw}'`, code.slice(node.range[1])].join('');
        break;
      case 'ExpressionStatement':
        parsedCode = parse(code, node.expression);
        break;
      case 'VariableDeclaration':
        parsedCode = parse(code, node.declarations);
        break;
      case 'VariableDeclarator':
        parsedCode = parse(code, node.init);
        break;
      case 'ArrowFunctionExpression':
      case 'FunctionExpression':
      case 'BlockStatement':
        parsedCode = parse(code, node.body);
        break;
      case 'ReturnStatement':
        parsedCode = parse(code, node.argument);
        break;
      case 'ExportNamedDeclaration':
        parsedCode = parse(code, node.declaration);
        break;
    }
  }

  console.log(`LEAVE:`, parsedCode);
  return parsedCode;
};

const format = (array: string[]) => array.filter(identity).join(', ');

const identity = <T>(x: T) => x;

console.log(jsxToObject('<A b="c">d</A>'));
