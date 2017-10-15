'use strict';

var factory = require('./factory');
var jsxToObject = require('./index');

const format = (obj) => `(${JSON.stringify(obj)})`;

module.exports = {
  'factory': {
    'should convert array to object': (test) => {
      test.expect(1);
      test.deepEqual(factory(1, 2, 3), { type: 1, props: 2, children: 3 });
      test.done();
    }
  },
  'jsxToObject': {
    'should ignore whitespaces in JSX tags': (test) => {
      test.expect(3);
      test.equal(jsxToObject('<a />'), jsxToObject('<a/>'));
      test.equal(jsxToObject('<a />'), jsxToObject('<a></a>'));
      test.equal(jsxToObject('<a />'), jsxToObject('< a >< / a >'));
      test.done();
    },

    'should convert intrinsic tag element type': (test) => {
      test.expect(1);
      test.equal(jsxToObject('<a />'), format({ type: 'a' }));
      test.done();
    },
    'should convert intrinsic tag element type & props': (test) => {
      test.expect(1);
      test.equal(jsxToObject('<a b="c" />'), format({ type: 'a', props: { b: 'c' } }));
      test.done();
    },
    'should convert intrinsic tag element type, props, & children': (test) => {
      test.expect(1);
      test.equal(jsxToObject('<a b="c">d</a>'), format({ type: 'a', props: { b: 'c' }, children: ['d'] }));
      test.done();
    },

    'should convert components': (test) => {
      test.expect(1);
      test.equal(jsxToObject('<A b="c">d</A>'), format({ type: 'A', props: { b: 'c' }, children: ['d'] }));
      test.done();
    }
  }
};
