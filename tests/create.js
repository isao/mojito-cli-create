var test = require('tap').test,
    resolve = require('path').resolve,
    fs = require('fs'),

    log = require('../lib/log'),
    fn = require('../lib/create');


log.pause();

test('[func] create from fixtures/symlinked', function(t) {
    var from = resolve(__dirname, 'fixtures', 'symlinked'),
        to = resolve(__dirname, 'artifacts', 'symlinked' + process.pid),
        data = {port:98765, name:'MyAppName'},

        expected_count = 6,
        scan;

    t.plan(4);
    function cb(err, msg) {
        t.false(err, 'no error');
        t.false(msg, 'no msg');
    }

    scan = fn(from, to, data, cb);
    scan.on('ignored', function(err, pathname) {
        var expected = 'mojits/.placeholder';
        t.equal(pathname.slice(-expected.length), expected, '.placeholder ignored');
    });

    scan.on('done', function(count) {
        t.equal(count, expected_count, 'fs node count');
    });
});

test('create nonesuch', function(t) {
    var from = 'oh hey, no. sorry.',
        to = resolve(__dirname, 'artifacts'),
        scan;

    t.plan(8);

    function cb(err, msg) {
        t.equal(err.toString(), 'Error: 1 error');
        t.same(err.messages, ["ENOENT, stat 'oh hey, no. sorry.'"]);
    }

    scan = fn(from, to, {}, cb);
    scan.on('error', function(err, pathname, stat) {
        t.equal(pathname, from);
        t.equal(err.code, 'ENOENT');
        t.equal(err.errno, 34);
        t.same(err.message, "ENOENT, stat 'oh hey, no. sorry.'");
        t.equal(pathname, err.path);
        t.false(stat);
    });
});
