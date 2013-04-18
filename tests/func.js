var path = require('path'),
    fs = require('fs'),
    test = require('tap').test,
    fn = require('../');


test('[func] create --directory fixtures/maintest', function(t) {
    var opts = {directory: path.join(__dirname, 'artifacts', 'maintest')},
        args = ['mojit', 'simple', 'simplemojit'];

    t.plan(3);

    function cb(err, msg) {
        t.false(err instanceof Error);
        t.equal(msg, 2);
        t.equal(arguments.length, 2);
    }

    fn(args, opts, {}, cb);
});


test('[func] create app simple simpleapp', function(t) {
    var opts = {},
        args = ['app', 'simple', 'simpleapp'],
        oldcwd = process.cwd(),
        tmpcwd = path.resolve(__dirname, 'artifacts');

    t.plan(4);

    function cb(err, msg) {
        var dest = path.join(tmpcwd, 'simpleapp');

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
    var dest = path.join(__dirname, 'artifacts'),
        opts = {directory: dest},
        archetype = path.resolve(__dirname, 'fixtures', 'barefile.txt.hb');
        args = ['custom', archetype, 'myfile.txt'];

    t.plan(1);

    function cb(err, msg) {
        //var newfile = path.join(dest, 'myfile.txt');

        t.false(err instanceof Error, 'no error');
        //t.ok(fs.statSync(newfile).isFile());
    }

    fn(args, opts, {}, cb);
});
