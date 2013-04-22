var test = require('tap').test,
    path = require('path'),
    log = require('../lib/log'),
    fn = require('../lib/npmi');

//log.pause();

test('npmi fail case', function(t) {
    t.plan(2);

    function cb(err, msg) {
        var expected = 'Command failed: ls: zzz: No such file or directory';
        t.equal(msg, 'Done.');
        t.equal(err.message.trim(), expected);
    }

    fn(path.join(__dirname, 'fixtures'), 'ls zzz', cb);
});
