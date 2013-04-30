var path = require('path'),
    fs = require('fs'),
    mkdirp = require('mkdirp').sync,
    log = require('../lib/log'),
    test = require('tap').test,

    fn = require('../'),

    artifacts = path.resolve(__dirname, 'artifacts'),
    mockpath = path.resolve(__dirname, 'fixtures', 'mockbin', 'npm-ok'),
    oldpath = process.env.PATH;


log.pause();

mkdirp(path.join(__dirname, 'artifacts'));

function getEnv(args, opts) {
    return {
        args: args || [],
        opts: opts || {}
    };
}


// these tests create files/dirs in tests/artifacts //

test('[func] create mojit --directory maintest', function(t) {
    var opts = {directory: path.join(__dirname, 'artifacts', 'maintest' + process.pid)},
        args = ['mojit', 'simple', 'simplemojit'];

    t.plan(3);

    function cb(err, msg) {
        t.false(err instanceof Error);
        t.equal(msg, 'Done.');
        t.equal(arguments.length, 2);
    }

    fn(getEnv(args, opts), cb);
});

// hacks process path & cwd //
// creates tests/artifacts/simpleapp + pid
test('[func] create app simple FIXME', function(t) {
    var opts = {},
        name = 'simpleapp' + process.pid,
        args = ['app', 'simple', name],
        oldcwd = process.cwd();

    t.plan(5);

    function cb(err, msg) {
        var dest = path.join(artifacts, name);

        t.equal(artifacts, process.cwd());
        t.false(err instanceof Error, 'no error');
        t.same(msg, 'Done.');
        t.ok(fs.statSync(dest).isDirectory());
        t.ok(fs.statSync(path.join(dest, 'server.js')).isFile());
        process.chdir(oldcwd);
        process.env.PATH = oldpath;
    }

    process.chdir(artifacts);
    process.env.PATH = mockpath;
    fn(getEnv(args, opts), cb);
});

test('[func] create custom fixtures/barefile.txt.hb', function(t) {
    var name = 'myfile-missing-key' + process.pid + '.txt',
        dest = path.join(__dirname, 'artifacts'),
        opts = {directory: dest},
        archetype = path.resolve(__dirname, 'fixtures', 'barefile.txt.hb'),
        args = ['custom', archetype, name];

    t.plan(2);

    function cb(err, msg) {
        var newfile = path.join(dest, name);

        t.false(err instanceof Error, 'no error');
        setTimeout(function() {
            t.ok(fs.statSync(newfile).isFile(), 'created ' + name);
        }, 66);
    }

    fn(getEnv(args, opts), cb);
});

test('[func] create custom fixtures/barefile.txt.hb', function(t) {
    var name = 'myfile-mykey' + process.pid + '.txt',
        dest = path.join(__dirname, 'artifacts'),
        opts = {directory: dest, keyval: 'mykey:myval'},
        archetype = path.resolve(__dirname, 'fixtures', 'barefile.txt.hb'),
        args = ['custom', archetype, name];

    t.plan(2);

    function cb(err, msg) {
        var newfile = path.join(dest, name),
            expected = fs.readFileSync(path.join(dest, name), 'utf8'),
            actual = fs.readFileSync(newfile, 'utf8');

        t.false(err instanceof Error, 'no error');
        t.equal(actual, expected, 'contents of template file as expected');
    }

    fn(getEnv(args, opts), cb);
});

test('[func] create path/to/barefile.txt.hb . (dot-name-test)', function(t) {
    var name = '.',
        dest = path.join(__dirname, 'artifacts'),
        opts = {directory: dest, keyval: 'mykey:dot-name-test'},
        archetype = path.resolve(__dirname, 'fixtures', 'barefile.txt.hb'),
        args = [archetype, name],
        newfile = path.join(dest, 'barefile.txt');

    t.plan(2);

    function cb(err, msg) {
        t.false(err instanceof Error, 'no error');
        setTimeout(function() {
            t.ok(fs.statSync(newfile).isFile(), 'created ' + name);
        }, 66);
    }

    fn(getEnv(args, opts), cb);
});


test('[func] barefile source with dest dir that needs mkdirp', function(t) {
    var name = 'myfile' + process.pid + '.txt',
        dest = path.join(__dirname, 'artifacts', 'newdest' + process.pid),
        opts = {directory: dest},
        archetype = path.resolve(__dirname, 'fixtures', 'barefile.txt.hb'),
        args = ['custom', archetype, name];

    t.plan(2);

    function cb(err, msg) {
        var newfile = path.join(dest, name);

        t.false(err instanceof Error, 'no error');
        setTimeout(function() {
            t.ok(fs.statSync(newfile).isFile(), 'created ' + name);
        }, 66);
    }

    fn(getEnv(args, opts), cb);
});
