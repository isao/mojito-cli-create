var path = require('path'),
    test = require('tap').test,
    fn = require('../');


function noop() {}


// error conditions, no side effects

test('no param', function(t) {
    t.plan(4);

    function cb(err) {
        t.true(err instanceof Error, 'instance of Error');
        t.equal(err.toString(), 'Error: No parameters.');
        t.equal(err.usage.slice(0, 6), 'Usage:');
        t.equal(err.errno, 3);
    }

    fn([], {}, {}, cb)
});

test('missing param', function(t) {
    t.plan(4);

    function cb(err) {
        t.true(err instanceof Error, 'instance of Error');
        t.equal(err.toString(), 'Error: Missing subtype, name or path.');
        t.equal(err.usage.substring(0, 6), 'Usage:');
        t.equal(err.errno, 3);
    }

    fn(['zzz'], {}, {}, cb);
});

test('missing param, --debug', function(t) {
    var opts = {debug: true};

    t.plan(4);

    function cb(err) {
        t.true(err instanceof Error, 'instance of Error');
        t.equal(err.toString(), 'Error: Missing subtype, name or path.');
        t.equal(err.usage.substring(0, 6), 'Usage:');
        t.equal(err.errno, 3);
    }

    fn(['zzz'], opts, {}, cb);
});

test('bad param', function(t) {
    t.plan(4);

    function cb(err) {
        t.true(err instanceof Error, 'instance of Error');
        t.equal(err.toString(), 'Error: omfg is not a valid archetype or path.');
        t.equal(err.usage.substring(0, 6), 'Usage:');
        t.equal(err.errno, 5);
    }

    fn(['omfg', 'bieber'], {}, {}, cb);
});

test('create custom nonesuch/path', function(t) {
    t.plan(4);

    function cb(err) {
        t.true(err instanceof Error, 'instance of Error');
        t.equal(err.toString(), 'Error: Custom archtype path is invalid.');
        t.equal(err.usage.substring(0, 6), 'Usage:');
        t.equal(err.errno, 5);
    }

    fn(['custom', 'nonesuch/path'], {}, {}, cb)
});

test('create custom path (missing name)', function(t) {
    t.plan(4);

    function cb(err) {
        t.true(err instanceof Error, 'instance of Error');
        t.equal(err.toString(), 'Error: Missing name.');
        t.equal(err.usage.substring(0, 6), 'Usage:');
        t.equal(err.errno, 3);
    }

    var d = path.join(__dirname, 'fixtures', 'symlinked');
    fn(['custom', d], {}, {}, cb);
});

test('create path/to/fixtures (missing name)', function(t) {
    t.plan(4);

    function cb(err) {
        t.true(err instanceof Error, 'instance of Error');
        t.equal(err.toString(), 'Error: Missing subtype, name or path.');
        t.equal(err.usage.substring(0, 6), 'Usage:');
        t.equal(err.errno, 3);
    }

    var d = path.join(__dirname, 'fixtures', 'symlinked');
    fn([d], {}, {}, cb)
});

// fn.test.getSourceDir tests

test('getSourceDir app foo', function(t) {
    var actual = fn.test.getSourceDir('app', ['foo']),
        expected = 'archetypes/app/default';

    t.equal(actual.slice(-expected.length), expected);
    t.end();
});

test('getSourceDir app nonesuch foo', function(t) {
    var actual = fn.test.getSourceDir('app', ['nonesuch', 'foo']);

    t.ok(actual instanceof Error);
    t.equal(actual.toString(), 'Error: Invalid subtype.');
    t.equal(actual.errno, 5);
    t.equal(actual.usage.slice(0, 6), 'Usage:');
    t.end();
});

test('getSourceDir app default foo', function(t) {
    var actual = fn.test.getSourceDir('app', ['default', 'foo']),
        expected = 'archetypes/app/default';

    t.equal(actual.slice(-expected.length), expected);
    t.end();
});

test('getSourceDir app simple foo', function(t) {
    var actual = fn.test.getSourceDir('app', ['simple', 'foo']),
        expected = 'archetypes/app/simple';

    t.equal(actual.slice(-expected.length), expected);
    t.end();
});

test('getSourceDir app full foo', function(t) {
    var actual = fn.test.getSourceDir('app', ['full', 'foo']),
        expected = 'archetypes/app/full';

    t.equal(actual.slice(-expected.length), expected);
    t.end();
});

test('getSourceDir app yahoo foo', function(t) {
    var actual = fn.test.getSourceDir('app', ['yahoo', 'foo']),
        expected = 'archetypes/app/yahoo';

    t.equal(actual.slice(-expected.length), expected);
    t.end();
});

test('getSourceDir mojit default foo', function(t) {
    var actual = fn.test.getSourceDir('mojit', ['default', 'foo']),
        expected = 'archetypes/mojit/default';

    t.equal(actual.slice(-expected.length), expected);
    t.end();
});

test('getSourceDir mojit simple foo', function(t) {
    var actual = fn.test.getSourceDir('mojit', ['simple', 'foo']),
        expected = 'archetypes/mojit/simple';

    t.equal(actual.slice(-expected.length), expected);
    t.end();
});

test('getSourceDir mojit full foo', function(t) {
    var actual = fn.test.getSourceDir('mojit', ['full', 'foo']),
        expected = 'archetypes/mojit/full';

    t.equal(actual.slice(-expected.length), expected);
    t.end();
});

test('type and subtype case-insensitive', function(t) {
    var actual, expected;
    
    actual = fn.test.getSourceDir('APP', ['FULL', 'foo']);
    expected = 'archetypes/app/full';
    t.equal(actual.slice(-expected.length), expected);

    actual = fn.test.getSourceDir('aPP', ['Full', 'foo']),
    t.equal(actual.slice(-expected.length), expected);

    actual = fn.test.getSourceDir('mOJit', ['sIMPle', 'foo']);
    expected = 'archetypes/mojit/simple';
    t.equal(actual.slice(-expected.length), expected);

    actual = fn.test.getSourceDir('mOJit', ['DEFAULT', 'foo']);
    expected = 'archetypes/mojit/default';
    t.equal(actual.slice(-expected.length), expected);

    t.end();
});

test('getSourceDir custom nonesuch foo', function(t) {
    var actual = fn.test.getSourceDir('custom', ['nonesuch', 'foo']);

    t.ok(actual instanceof Error);
    t.equal(actual.toString(), 'Error: Custom archtype path is invalid.');
    t.equal(actual.errno, 5);
    t.equal(actual.usage.slice(0, 6), 'Usage:');
    t.end();
});

test('getSourceDir nonesuch foo', function(t) {
    var actual = fn.test.getSourceDir('nonesuch', ['foo']);

    t.ok(actual instanceof Error);
    t.equal(actual.toString(), 'Error: nonesuch is not a valid archetype or path.');
    t.equal(actual.errno, 5);
    t.equal(actual.usage.slice(0, 6), 'Usage:');
    t.end();
});

test('getSourceDir nonesuch nonesuch foo', function(t) {
    var actual = fn.test.getSourceDir('nonesuch', ['nonesuch', 'foo']);

    t.ok(actual instanceof Error);
    t.equal(actual.toString(), 'Error: nonesuch is not a valid archetype or path.');
    t.equal(actual.errno, 5);
    t.equal(actual.usage.slice(0, 6), 'Usage:');
    t.end();
});
