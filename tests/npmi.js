var test = require('tap').test,
    path = require('path'),
    log = require('../lib/log'),

    fn = require('../lib/npmi'),
    mockpath = path.resolve(__dirname, 'fixtures', 'mockbin'),
    oldpath = process.env.PATH;


log.pause();

test('no *npm', function(t) {
    t.plan(4);
    process.env.PATH = mockpath;

    function cb(err, msg) {
        t.ok(err instanceof Error);
        t.ok(err.errno > 0);
        t.equal(err.message, 'npm or ynpm was not found in your shell path.');
        t.equal(msg, undefined);
        process.env.PATH = oldpath;
    }

    fn('.', cb);
});

test('npm-fail', function(t) {
    t.plan(4);
    process.env.PATH = path.join(mockpath, 'npm-fail');

    function cb(err, msg) {
        t.ok(err instanceof Error);
        t.equal(err.errno, 7);
        t.equal(err.message, 'Installing dependencies failed.');
        t.equal(msg, '');
        process.env.PATH = oldpath;
    }

    fn('.', cb);
});

test('npm-ok', function(t) {
    t.plan(2);
    process.env.PATH = path.join(mockpath, 'npm-ok');

    function cb(err, msg) {
        t.same(err, null);
        t.equal(msg, 'Done.');
        process.env.PATH = oldpath;
    }

    fn('.', cb);
});

test('ynpm-ok', function(t) {
    t.plan(2);
    process.env.PATH = path.join(mockpath, 'ynpm-ok');

    function cb(err, msg) {
        t.same(err, null);
        t.equal(msg, 'Done.');
        process.env.PATH = oldpath;
    }

    fn('.', cb);
});
