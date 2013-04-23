var test = require('tap').test,
    path = require('path'),
    log = require('../lib/log'),

    fn = require('../lib/npmi'),
    mock = path.resolve(__dirname, 'fixtures', 'mockpath1', 'npm');


log.pause();

test('exec fail', function(t) {
    t.plan(2);

    function cb(err, msg) {
        t.equal(msg, 'Done.');
        t.equal(err.message.trim(), 'Command failed: test: stderr');
    }

    fn(mock + ' 1', path.join(__dirname, 'fixtures'), cb);
});

test('exec "ok"', function(t) {
    t.plan(2);

    function cb(err, msg) {
        t.equal(msg, 'Done.');
        t.equal(err, null);
    }

    fn(mock + ' 0', path.join(__dirname, 'fixtures'), cb);
});

test('exec "ok" &>/dev/null', function(t) {
    t.plan(2);

    function cb(err, msg) {
        t.equal(msg, 'Done.');
        t.equal(err, null);
    }

    fn(mock + ' 0 &>/dev/null', path.join(__dirname, 'fixtures'), cb);
});
