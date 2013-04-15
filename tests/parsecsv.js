var test = require('tap').test,
    fn = require('../').parseCsv;


test('parse "aaa:111,bbb:222,,"', function(t) {
    var expected = {
            aaa:111,
            bbb:222
        };
    t.same(fn('aaa:111,bbb:222,,'), expected);
    t.end();
});

test('later occurances of a key take precedence', function(t) {
    var expected = {
            aaa:888,
            bbb:999
        };
    t.same(fn('aaa:111,bbb:222,aaa:888,bbb:999'), expected);
    t.end();
});

test('empty sections are ignored', function(t) {
    var expected = {
            aaa:111,
            bbb:222
        };
    t.same(fn('aaa:111,:,bbb:222,,,:'), expected);
    t.end();
});

test('keys & values are trimmed, but can contain spaces (technically)', function(t) {
    var expected = {};
    expected['a to the A'] = 'first letter';
    expected['bees wax'] = 'tastes yucky';

    t.same(fn(' a to the A : first letter, bees wax: tastes yucky'), expected);
    t.end();
});

test('parse ":::"', function(t) {
    var expected = {};
    t.same(fn(':::'), expected);
    t.end();
});

test('parse ""', function(t) {
    var expected = {};
    t.same(fn(''), expected);
    t.end();
});

test('parse ",,,"', function(t) {
    var expected = {};
    t.same(fn(',,,'), expected);
    t.end();
});

test('parse ",:,:,,"', function(t) {
    var expected = {};
    t.same(fn(',:,:,,'), expected);
    t.end();
});
