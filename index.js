/*
 * Copyright (c) 2011-2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
'use strict';

var path = require('path'),
    fs = require('fs'),
    log = require('./lib/log'),
    util = require('./lib/utils'),

    srcpaths = ['.', path.resolve(__dirname, 'archetypes')];


function run(params, options, meta, callback) {
function main(args, opts, meta, cb) {
}


module.exports = main;

module.exports.usage = [
    'Usage: mojito create [options] <type> [subtype] <name>',
    'Usage: mojito create [options] custom <path/to/archetype> <name>',
    'Usage: mojito create [options] <path/to/archetype> <name>',
    '  - type: "app", or "mojit"',
    '  - subtype: if type is "app", or "mojit", possible values are "default", "full",',
    '    and "simple". If omitted, subtype "default" is used.',
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
    '  -k [string]      Short for --keyval'].join('\n');

module.exports.options = [
    {shortName: 'k', hasValue: true,  longName: 'keyval'},
    {shortName: 'p', hasValue: true,  longName: 'port'}
];

