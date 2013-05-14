var path = require('path'),
    test = require('tap').test,
    log = require('../lib/log'),
    fn = require('../');

log.pause();

function noop() {}

function getEnv(args) {
    return {
        args: args || [],
        opts: {}
    };
}

// error conditions, no side effects

test('no param', function(t) {
    t.plan(4);

    function cb(err) {
        t.true(err instanceof Error, 'instance of Error');
        t.equal(err.toString(), 'Error: No parameters.');
        t.equal(err.usage.slice(0, 6), 'Usage:');
        t.equal(err.errno, 3);
    }

    fn(getEnv(), cb)
});

test('missing param', function(t) {
    var env = getEnv(['zzz']);

    t.plan(4);

    function cb(err) {
        t.true(err instanceof Error, 'instance of Error');
        t.equal(err.toString(), 'Error: Missing subtype, name or path.');
        t.equal(err.usage.substring(0, 6), 'Usage:');
        t.equal(err.errno, 3);
    }

    fn(env, cb);
});

test('missing param, --debug', function(t) {
    var env = getEnv(['zzz']);

    env.opts = {loglevel: 'debug'}; //nopt alias

    t.plan(4);

    function cb(err) {
        t.true(err instanceof Error, 'instance of Error');
        t.equal(err.toString(), 'Error: Missing subtype, name or path.');
        t.equal(err.usage.substring(0, 6), 'Usage:');
        t.equal(err.errno, 3);
    }

    fn(env, cb);
});

test('bad param', function(t) {
    var env = getEnv(['omfg', 'bieber']);

    t.plan(4);

    function cb(err) {
        t.true(err instanceof Error, 'instance of Error');
        t.equal(err.toString(), 'Error: omfg is not a valid archetype or path.');
        t.equal(err.usage.substring(0, 6), 'Usage:');
        t.equal(err.errno, 5);
    }

    fn(env, cb);
});

test('create custom nonesuch/path', function(t) {
    var env = getEnv(['custom', 'nonesuch/path']);

    t.plan(4);

    function cb(err) {
        t.true(err instanceof Error, 'instance of Error');
        t.equal(err.toString(), 'Error: Custom archtype path is invalid.');
        t.equal(err.usage.substring(0, 6), 'Usage:');
        t.equal(err.errno, 5);
    }

    fn(env, cb)
});

test('create custom path (missing name)', function(t) {
    var d = path.join(__dirname, 'fixtures', 'symlinked'),
        env = getEnv(['custom', d]);

    t.plan(4);

    function cb(err) {
        t.true(err instanceof Error, 'instance of Error');
        t.equal(err.toString(), 'Error: Missing name.');
        t.equal(err.usage.substring(0, 6), 'Usage:');
        t.equal(err.errno, 3);
    }

    fn(env, cb);
});

test('create path/to/fixtures (missing name)', function(t) {
    var d = path.join(__dirname, 'fixtures', 'symlinked'),
        env = getEnv([d]);

    t.plan(4);

    function cb(err) {
        t.true(err instanceof Error, 'instance of Error');
        t.equal(err.toString(), 'Error: Missing subtype, name or path.');
        t.equal(err.usage.substring(0, 6), 'Usage:');
        t.equal(err.errno, 3);
    }

    var d = path.join(__dirname, 'fixtures', 'symlinked');
    fn(env, cb);
});

// fn.getSourceDir tests

test('getSourceDir app foo', function(t) {
    var actual = fn.getSourceDir('app', ['foo']),
        expected = 'archetypes/app/default';

    t.equal(actual.slice(-expected.length), expected);
    t.end();
});

test('getSourceDir app nonesuch foo', function(t) {
    var actual = fn.getSourceDir('app', ['nonesuch', 'foo']);

    t.ok(actual instanceof Error);
    t.equal(actual.toString(), 'Error: Invalid subtype.');
    t.equal(actual.errno, 5);
    t.equal(actual.usage.slice(0, 6), 'Usage:');
    t.end();
});

test('getSourceDir app default foo', function(t) {
    var actual = fn.getSourceDir('app', ['default', 'foo']),
        expected = 'archetypes/app/default';

    t.equal(actual.slice(-expected.length), expected);
    t.end();
});

test('getSourceDir app simple foo', function(t) {
    var actual = fn.getSourceDir('app', ['simple', 'foo']),
        expected = 'archetypes/app/simple';

    t.equal(actual.slice(-expected.length), expected);
    t.end();
});

test('getSourceDir app full foo', function(t) {
    var actual = fn.getSourceDir('app', ['full', 'foo']),
        expected = 'archetypes/app/full';

    t.equal(actual.slice(-expected.length), expected);
    t.end();
});

test('getSourceDir app yahoo foo', function(t) {
    var actual = fn.getSourceDir('app', ['yahoo', 'foo']),
        expected = 'archetypes/app/yahoo';

    t.equal(actual.slice(-expected.length), expected);
    t.end();
});

test('getSourceDir mojit default foo', function(t) {
    var actual = fn.getSourceDir('mojit', ['default', 'foo']),
        expected = 'archetypes/mojit/default';

    t.equal(actual.slice(-expected.length), expected);
    t.end();
});

test('getSourceDir mojit simple foo', function(t) {
    var actual = fn.getSourceDir('mojit', ['simple', 'foo']),
        expected = 'archetypes/mojit/simple';

    t.equal(actual.slice(-expected.length), expected);
    t.end();
});

test('getSourceDir mojit full foo', function(t) {
    var actual = fn.getSourceDir('mojit', ['full', 'foo']),
        expected = 'archetypes/mojit/full';

    t.equal(actual.slice(-expected.length), expected);
    t.end();
});

test('type and subtype case-insensitive', function(t) {
    var actual, expected;

    actual = fn.getSourceDir('APP', ['FULL', 'foo']);
    expected = 'archetypes/app/full';
    t.equal(actual.slice(-expected.length), expected);

    actual = fn.getSourceDir('aPP', ['Full', 'foo']),
    t.equal(actual.slice(-expected.length), expected);

    actual = fn.getSourceDir('mOJit', ['sIMPle', 'foo']);
    expected = 'archetypes/mojit/simple';
    t.equal(actual.slice(-expected.length), expected);

    actual = fn.getSourceDir('mOJit', ['DEFAULT', 'foo']);
    expected = 'archetypes/mojit/default';
    t.equal(actual.slice(-expected.length), expected);

    t.end();
});

test('getSourceDir custom nonesuch foo', function(t) {
    var actual = fn.getSourceDir('custom', ['nonesuch', 'foo']);

    t.ok(actual instanceof Error);
    t.equal(actual.toString(), 'Error: Custom archtype path is invalid.');
    t.equal(actual.errno, 5);
    t.equal(actual.usage.slice(0, 6), 'Usage:');
    t.end();
});

test('getSourceDir nonesuch foo', function(t) {
    var actual = fn.getSourceDir('nonesuch', ['foo']);

    t.ok(actual instanceof Error);
    t.equal(actual.toString(), 'Error: nonesuch is not a valid archetype or path.');
    t.equal(actual.errno, 5);
    t.equal(actual.usage.slice(0, 6), 'Usage:');
    t.end();
});

test('getSourceDir nonesuch nonesuch foo', function(t) {
    var actual = fn.getSourceDir('nonesuch', ['nonesuch', 'foo']);

    t.ok(actual instanceof Error);
    t.equal(actual.toString(), 'Error: nonesuch is not a valid archetype or path.');
    t.equal(actual.errno, 5);
    t.equal(actual.usage.slice(0, 6), 'Usage:');
    t.end();
});

test('getSourceDir fixtures/barefile.txt.hb foo', function(t) {
    var archetype = 'fixtures/barefile.txt.hb',
        actual = fn.getSourceDir(path.resolve(__dirname, archetype), ['foo']);

    t.equal(typeof actual, 'string');
    t.equal(actual.slice(-archetype.length), archetype);
    t.end();
});
