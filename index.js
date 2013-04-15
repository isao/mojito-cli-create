/*
 * Copyright (c) 2011-2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
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
        if ((pair.length > 1) && pair[0].length) {
            // extra join to restore colon values like "a:b:c" -> {a: "b:c"}
            out[pair[0].trim()] = pair.slice(1).join(':').trim();
        }
    }

    (str || '').split(',').map(splitcolon).forEach(onpair);
    return out;
}

function run(params, options, meta, callback) {
}


module.exports = run;

module.exports.usage = [
    'mojito create [options] <type> <subtype> <name>',
    'mojito create [options] <type> <name>',
    'mojito create [options] custom <path/to/archetype> <name>',
    //'mojito create [options] <path/to/archetype> <name>',
    '  - type: "app", "mojit", or "custom".',
    '  - subtype: optional, possible values are default, full, simple',
    '      if omitted "default": is used',
    '  - name: string to use for created file or directory/app/mojit',
    '',
    'Example: mojito create app Foo',
    '  (creates directory "Foo" containing a new Mojito application named "Foo")',
    '',
    'Example: mojito create mojit Bar',
    '  (creates directory "Bar" containing new Mojit named "Bar")',
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
