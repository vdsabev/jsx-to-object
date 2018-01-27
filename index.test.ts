import { jsxToObject } from './index';

describe(`jsxToObject`, () => {
  it(`should ignore whitespaces in JSX tags`, (test) => {
    expect(jsxToObject('<a />')).toEqual(jsxToObject('<a/>'));
    expect(jsxToObject('<a />')).toEqual(jsxToObject('<a></a>'));
    expect(jsxToObject('<a />')).toEqual(jsxToObject('< a >< / a >'));
  });

  it(`should convert type`, (test) => {
    expect(jsxToObject('<a />')).toBe(`({ type: 'a' })`);
  });

  it(`should convert props`, (test) => {
    expect(jsxToObject('<a b="c" />')).toBe(`({ type: 'a', props: { b: "c" } })`);
  });

  it(`should convert props without value to boolean`, (test) => {
    expect(jsxToObject('<a b />')).toBe(`({ type: 'a', props: { b: true } })`);
  });

  it(`should convert children`, (test) => {
    expect(jsxToObject('<a>b</a>')).toBe(`({ type: 'a', children: ['b'] })`);
  });

  it(`should convert type, props, and children`, (test) => {
    expect(jsxToObject('<a b="c">d</a>')).toBe(`({ type: 'a', props: { b: "c" }, children: ['d'] })`);
  });

  it(`should convert code in functions`, (test) => {
    expect(jsxToObject('const x = () => <a b="c">d</a>;')).toBe(
      `const x = () => ({ type: 'a', props: { b: "c" }, children: ['d'] });`
    );

    expect(jsxToObject('const x = function () { return <a b="c">d</a>; };')).toBe(
      `const x = function () { return ({ type: 'a', props: { b: "c" }, children: ['d'] }); };`
    );
  });

  it(`should work with export statement`, (test) => {
    expect(jsxToObject('export const x = () => <a b="c">d</a>;')).toBe(
      `export const x = () => ({ type: 'a', props: { b: "c" }, children: ['d'] });`
    );
  });

  it(`should convert components`, (test) => {
    expect(jsxToObject('<A b="c">d</A>')).toBe(`A({ b: "c" }, ['d'])`);
  });
});
