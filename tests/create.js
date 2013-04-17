var test = require('tap').test,
    resolve = require('path').resolve,

    fs = require('fs'),
    fn = require('../lib/create');


test('[side-effects] create from fixture', function(t) {
    var from = resolve(__dirname, 'fixtures', 'symlinked'),
        to = resolve(__dirname, 'artifacts'),
        scan;

    t.plan(3);

    function cb(err, msg) {
        t.false(err, 'null error');
        t.equal(+msg, 6, 'fs node count');
    }

    scan = fn(from, to, {}, cb);
    scan.on('ignored', function(err, pathname) {
        t.equal(pathname.slice(-12), '.placeholder', '.placeholder ignored');
    });
});

test('create nonesuch', function(t) {
    var from = 'oh hey, no. sorry.',
        to = resolve(__dirname, 'artifacts'),
        scan;

    t.plan(6);

    function cb(err, msg) {
        t.false(err, 'null error');
    }

    scan = fn(from, to, {}, cb);
    scan.on('error', function(err, pathname, stat) {
        t.equal(pathname, from);
        t.equal(err.code, 'ENOENT');
        t.equal(err.errno, 34);
        t.equal(pathname, err.path);
        t.false(stat);
    });
});
