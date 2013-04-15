/*
 * Copyright (c) 2011-2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
/*jshint node:true */
'use strict';

var path = require('path'),
    fs = require('fs'),
    log = require('./log'),

    srcpaths = ['.', path.resolve(__dirname, 'archetypes')];


function exists(filepath) {
    var stat = false;
    try {
        stat = fs.statSync(filepath);
    } catch(err) {
        log.debug('%s does not exist', filepath);
    }
    return stat;
}

function findInPaths(paths, target) {
    var filepath;
    function checkpath(basedir) {
        filepath = path.resolve(basedir, target);
        return exists(filepath);
    }
    return paths.some(checkpath) ? filepath : false;
}

function parseCsv(str) {
    var out = {};

    function splitcolon(item) {
        return item.split(':');
    }

    function onpair(pair) {
        if (pair.length && pair[0].length) {
            out[pair[0].trim()] = pair[1].trim();
        }
    }

    (str || '').split(',').map(splitcolon).forEach(onpair);
    return out;
}

function run(params, options, meta, callback) {
}


module.exports = run;

module.exports.usage = [
    'mojito create {type} [subtype or source directory] {name} [options]',
    '  - type: "app", "mojit", or "custom".',
    '  - archetype: optional template. Possible values are default, full, simple',
    '      If the type is "custom" then this is the path to your own archetype',
    '      directory.',
    '  - name: name of the app or mojit to create',
    '',
    'Example: mojito create app Foo',
    "  (creates directory 'Foo' containing new Mojito application)",
    '',
    'Example: mojito create mojit Bar',
    '  (creates directory "Bar" containing new Mojit)',
    '',
    'OPTIONS: ',
    '  --port [number]  Specifies default port for your Mojito app to run on.',
    '  -p [number]      Short for --port',
    '  -keyval [string] key value pairs to pass to a custom archetype template',
    '                   a key/value is separated by colons, key/value pairs by',
    '                   commas: "key1:val1,key2:val2',
    '  -k [string]      Short for --keyval'].join("\n");

module.exports.options = [
    {shortName: 'k', hasValue: true,  longName: 'keyval'},
    {shortName: 'p', hasValue: true,  longName: 'port'}
];

module.exports.findInPaths = findInPaths;
module.exports.parseCsv = parseCsv;
