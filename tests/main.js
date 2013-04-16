var test = require('tap').test,
    fn = require('../');


function noop() {}

test('no param', function(t) {
    t.plan(5);

    function cb(err) {
        t.true(err instanceof Error);
        t.true(err.toString().match(/Missing parameters. Please specify a type & name./));
        t.equal(err.usage.substring(0, 6), 'Usage:');
        t.equal(err.code, 1);
    }
    
    t.same(fn([], {}, {}, cb), false);
});

test('missing param', function(t) {
    t.plan(5);

    function cb(err) {
        t.true(err instanceof Error);
        t.true(err.toString().match(/Missing parameter\(s\)[.]/));
        t.equal(err.usage.substring(0, 6), 'Usage:');
        t.equal(err.code, 3);
    }
    
    t.same(fn(['zzz'], {}, {}, cb), false);
});

test('create app foo', function(t) {
    t.plan(1);
    t.true(fn(['app', 'foo'], {}, {}, noop).match(/archetypes\/app\/default/));
});

test('create app nonesuch foo', function(t) {
    t.plan(5);

    function cb(err) {
        t.true(err instanceof Error);
        t.true(err.toString().match(/Invalid subtype/));
        t.equal(err.usage.substring(0, 6), 'Usage:');
        t.equal(err.code, 5);
    }

    t.false(fn(['app', 'nonesuch', 'foo'], {}, {}, cb));
});

test('create mojit nonesuch foo', function(t) {
    t.plan(5);

    function cb(err) {
        t.true(err instanceof Error);
        t.true(err.toString().match(/Invalid subtype/));
        t.equal(err.usage.substring(0, 6), 'Usage:');
        t.equal(err.code, 5);
    }

    t.false(fn(['mojit', 'nonesuch', 'foo'], {}, {}, cb));
});

test('create app {default,simple,full,yahoo} foo', function(t) {
    t.plan(4);
    t.true(fn(['app', 'default', 'foo'], {}, {}, noop).match(/archetypes\/app\/default/));
    t.true(fn(['app', 'simple', 'foo'], {}, {}, noop).match(/archetypes\/app\/simple/));
    t.true(fn(['app', 'full', 'foo'], {}, {}, noop).match(/archetypes\/app\/full/));
    t.true(fn(['app', 'yahoo', 'foo'], {}, {}, noop).match(/archetypes\/app\/yahoo/));
});

test('create app {default,simple,full,yahoo} foo', function(t) {
    t.plan(4);
    t.true(fn(['app', 'default', 'foo'], {}, {}, noop).match(/archetypes\/app\/default/));
    t.true(fn(['app', 'simple', 'foo'], {}, {}, noop).match(/archetypes\/app\/simple/));
    t.true(fn(['app', 'full', 'foo'], {}, {}, noop).match(/archetypes\/app\/full/));
    t.true(fn(['app', 'yahoo', 'foo'], {}, {}, noop).match(/archetypes\/app\/yahoo/));
});

test('create mojit {default,simple,full,yahoo} foo', function(t) {
    t.plan(4);
    t.true(fn(['mojit', 'default', 'foo'], {}, {}, noop).match(/archetypes\/mojit\/default/));
    t.true(fn(['mojit', 'simple', 'foo'], {}, {}, noop).match(/archetypes\/mojit\/simple/));
    t.true(fn(['mojit', 'full', 'foo'], {}, {}, noop).match(/archetypes\/mojit\/full/));
    t.false(fn(['mojit', 'yahoo', 'foo'], {}, {}, noop));
});
    


