var test = require('tap').test,
    fn = require('../lib/utils').findInPaths,
    resolve = require('path').resolve,
    archdir = resolve(__dirname, '../archetypes');


test('getSource(archtypes/app/default)', function(t) {
    var expected = resolve(__dirname, '../archetypes/app/default');

    t.equals(fn([archdir], 'app/default'), expected);
    t.end();
});

test('getSource() ok for files', function(t) {
    var expected = resolve(__dirname, '../archetypes/app/default/package.json.hb');

    t.equals(fn([archdir], 'app/default/package.json.hb'), expected);
    t.end();
});

test('getSource() nonesuch returns false', function(t) {
    t.false(fn([archdir], 'unicorn'));
    t.equal(false, fn([archdir], 'unicorn'));
    t.end();
});

test('getSource() follows symlinks to dirs', function(t) {
    var expected = resolve(__dirname, 'fixtures/simple'),
        srcdir = resolve(__dirname, 'fixtures');

    t.equals(fn([srcdir], 'simple'), expected);
    t.end();
});

test('getSource() follows symlinks to files', function(t) {
    var expected = resolve(__dirname, 'fixtures/simple/package.json.hb'),
        srcdir = resolve(__dirname, 'fixtures');

    t.equals(fn([srcdir], 'simple/package.json.hb'), expected);
    t.end();
});

