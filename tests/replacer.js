var test = require('tap').test,
    fn = require('../lib/replacer');


test('end before close', function (t) {
    var ended = false,
        closed = false,
        ts = fn({foo: 42});

    ts.on('end', function () {
        t.ok(!closed);
        ended = true;
    });

    ts.on('close', function () {
        t.ok(ended);
        closed = true;
    });

    ts.write('answer is: {{foo}}\n');
    ts.write('question is {{unknown}}\n');
    ts.end();
    t.ok(ended);
    t.ok(closed);
    t.end();
})
