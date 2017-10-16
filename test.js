'use strict';

var jsxToObject = require('./index');

module.exports = {
  'jsxToObject': {
    'should ignore whitespaces in JSX tags': (test) => {
      test.expect(3);
      test.equal(jsxToObject('<a />'), jsxToObject('<a/>'));
      test.equal(jsxToObject('<a />'), jsxToObject('<a></a>'));
      test.equal(jsxToObject('<a />'), jsxToObject('< a >< / a >'));
      test.done();
    },

    'should convert type': (test) => {
      test.expect(1);
      test.equal(jsxToObject('<a />'), `({ type: 'a' })`);
      test.done();
    },
    'should convert props': (test) => {
      test.expect(1);
      test.equal(jsxToObject('<a b="c" />'), `({ type: 'a', props: { b: "c" } })`);
      test.done();
    },
    'should convert props without value to boolean': (test) => {
      test.expect(1);
      test.equal(jsxToObject('<a b />'), `({ type: 'a', props: { b: true } })`);
      test.done();
    },
    'should convert children': (test) => {
      test.expect(1);
      test.equal(jsxToObject('<a>b</a>'), `({ type: 'a', children: ['b'] })`);
      test.done();
    },
    'should convert type, props, and children': (test) => {
      test.expect(1);
      test.equal(jsxToObject('<a b="c">d</a>'), `({ type: 'a', props: { b: "c" }, children: ['d'] })`);
      test.done();
    },
    'should convert code in functions': (test) => {
      test.expect(2);
      test.equal(jsxToObject('const x = () => <a b="c">d</a>;'), `const x = () => ({ type: 'a', props: { b: "c" }, children: ['d'] });`);
      test.equal(jsxToObject('const x = function () { return <a b="c">d</a>; };'), `const x = function () { return ({ type: 'a', props: { b: "c" }, children: ['d'] }); };`);
      test.done();
    },

    'should work with export statement': (test) => {
      test.expect(1);
      test.equal(jsxToObject('export const x = () => <a b="c">d</a>;'), `export const x = () => ({ type: 'a', props: { b: "c" }, children: ['d'] });`);
      test.done();
    },

    'should convert components': (test) => {
      test.expect(1);
      test.equal(jsxToObject('<A b="c">d</A>'), `A({ b: "c" }, ['d'])`);
      test.done();
    }
  }
};
