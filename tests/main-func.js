var path = require('path'),
    fs = require('fs'),
    test = require('tap').test,

    log = require('../lib/log'),
    fn = require('../'),

    artifacts = path.join(__dirname, 'artifacts'),
    fixtures = path.resolve(__dirname, 'fixtures');


//log.pause();

function getEnv(args, opts) {
    return {
        args: args || [],
        opts: opts || {}
    };
}

// these tests create files/dirs in tests/artifacts

test('[func] create --directory functest', function(t) {
    var opts = {directory: path.join(artifacts, 'funcmojit' + process.pid)},
        args = ['mojit', 'simple', 'simplemojit'];


    function cb(err, msg) {
        var expected = path.join(opts.directory, 'mojits', 'simplemojit');
        t.ok(fs.existsSync(expected), expected);

        expected = path.join(expected, 'controller.server.js');
        t.ok(fs.existsSync(expected, expected));
    }

    t.plan(2);
    fn(getEnv(args, opts), cb);
});

test('paths in names are treated like a --dir option', function(t) {
    var name = path.join(artifacts, 'pathname' + process.pid, 'ok'),
        args = ['mojit', 'simple', name];

    function cb(err) {
        var expected = path.join(artifacts, 'pathname' + process.pid, 'mojits', 'ok');
        t.ok(fs.existsSync(expected), expected);
    }

    t.plan(1);
    fn(getEnv(args), cb);
});

test('[func] create app simple simpleapp', function(t) {
    var opts = {directory: artifacts},
        name = 'simpleapp' + process.pid,
        env = getEnv(['app', 'simple', name], opts);

    function npmi(err, dest, cb) {
        var expected = path.join(artifacts, name);
        t.equal(dest, expected);
        cb(null, 'ok');
    }

    function cb(err, msg) {
        var dest = path.join(artifacts, name);
        t.false(err instanceof Error, 'no error');
        t.ok(fs.existsSync(dest));
        t.ok(fs.existsSync(path.join(dest, 'server.js')));
    }

    t.plan(4);

    fn.npmi = npmi;
    fn(env, cb);
});

test('[func] create custom fixtures/barefile.txt.hb', function(t) {
    var dest = path.join(artifacts, 'barefile' + process.pid),
        opts = {directory: dest},
        archetype = path.resolve(fixtures, 'barefile.txt.hb'),
        name = 'myfile' + process.pid + '.txt',
        args = ['custom', archetype, name],
        env = getEnv(args, opts);

    t.plan(2);

    function cb(err, msg) {
        var newfile = path.join(dest, name);

        t.false(err instanceof Error, 'no error');
        t.ok(fs.statSync(newfile).isFile());
    }

    fn(env, cb);
});

test('[func] create fixtures/barefile.txt.hb foo/. (dotname test)', function(t) {
    var archetype = path.resolve(fixtures, 'barefile.txt.hb'),
        foo = 'foo' + process.pid,
        name = path.join(artifacts, foo) + path.sep + '.',
        env = getEnv([archetype, name], {});

    function cb(err, msg) {
        var newdir = path.join(artifacts, foo),
            newfile = path.join(newdir, 'barefile.txt');

        t.false(err instanceof Error, 'no error');
        t.ok(fs.statSync(newdir).isDirectory());
        t.ok(fs.statSync(newfile).isFile());
    }

    t.plan(3);
    fn(env, cb);
});

test('[func] invalid dest dir', function(t) {
    var archetype = path.resolve(fixtures, 'barefile.txt.hb'),
        name = path.join(__filename, 'foo'),
        env = getEnv([archetype, name], {});

    function cb(err, msg) {
        t.ok(err instanceof Error, 'error was expected');
        t.equal(err.errnum, 9);
        t.equal(err.message, 'Destination directory is invalid.');
    }

    t.plan(2);
    fn(env, cb);
});

