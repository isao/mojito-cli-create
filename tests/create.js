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
