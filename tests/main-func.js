var path = require('path'),
    fs = require('fs'),
    test = require('tap').test,
    fn = require('../');


// these tests create files/dirs in tests/artifacts

test('[func] create --directory maintest', function(t) {
    var opts = {directory: path.join(__dirname, 'artifacts', 'maintest' + process.pid)},
        args = ['mojit', 'simple', 'simplemojit'];

    t.plan(3);

    function cb(err, msg) {
        t.false(err instanceof Error);
        t.equal(msg, 'Done.');
        t.equal(arguments.length, 2);
    }

    fn(args, opts, {}, cb);
});

test('[func] create app simple simpleapp', function(t) {
    var opts = {},
        name = 'simpleapp' + process.pid,
        args = ['app', 'simple', name],
        oldcwd = process.cwd(),
        tmpcwd = path.resolve(__dirname, 'artifacts');

    t.plan(4);

    function cb(err, msg) {
        var dest = path.join(tmpcwd, name);

        t.equal(tmpcwd, process.cwd());
        t.false(err instanceof Error, 'no error');
        t.ok(fs.statSync(dest).isDirectory());
        t.ok(fs.statSync(path.join(dest, 'server.js')).isFile());
        process.chdir(oldcwd);
    }

    fs.mkdir(tmpcwd, function() {
        process.chdir(tmpcwd);
        fn(args, opts, {}, cb);
    });
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
        t.ok(fs.statSync(newfile).isFile());
    }

    fn(args, opts, {}, cb);
});

test('[func] create custom fixtures/barefile.txt.hb', function(t) {
    var name = 'myfile-mykey' + process.pid + '.txt',
        dest = path.join(__dirname, 'artifacts'),
        opts = {directory: dest, keyval: 'mykey:myval'},
        archetype = path.resolve(__dirname, 'fixtures', 'barefile.txt.hb'),
        args = ['custom', archetype, name];

    t.plan(2);

    function cb(err, msg) {
        var newfile = path.join(dest, name);

        t.false(err instanceof Error, 'no error');
        t.ok(fs.statSync(newfile).isFile());
    }

    fn(args, opts, {}, cb);
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
        t.ok(fs.statSync(newfile).isFile());
    }

    fn(args, opts, {}, cb);
});
