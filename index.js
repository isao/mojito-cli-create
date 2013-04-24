/*
 * Copyright (c) 2011-2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
'use strict';

var path = require('path'),
    log = require('./lib/log'),
    util = require('./lib/utils'),
    npmi = require('./lib/npmi'),
    create = require('./lib/create'),

    // todo: make user configurable
    SRCPATHS = [path.resolve(__dirname, 'archetypes'), './archetypes'];


function errorWithUsage(code, msg) {
    var err = util.error(code, msg);
    err.usage = module.exports.usage;
    return err;
}

function pathify(subpath) {
    return util.findInPaths(SRCPATHS, subpath); // full path if exists, or false
}

function checkName(name) {
    return name.indexOf(path.sep) !== -1;
}

function getDestinationDir(type, destopt, name) {
    var parts = [destopt || '.'];

    if ('mojit' === type.toLowerCase()) {
        parts.push('mojits'); // BC - type "mojit" goes inside mojits dir
    }

    parts.push(name);
    return path.resolve.apply(null, parts);
}

function subtypePath(type, args) {
    var subtype = args.length > 1 ? args.shift() : 'default';
    return path.join(type, subtype).toLowerCase(); // i.e. 'app/full'
}

function getSourceDir(type, args) {
    var source, err;

    // get archetype source directory based on first one OR two arguments
    switch (type.toLowerCase()) {
    case 'app':
    case 'mojit':
        // 1. mojito create [options] <app|mojit> [full|simple|default] <name>
        source = pathify(subtypePath(type, args));
        err = 'Invalid subtype.';
        break;

    case 'custom':
        // 2. mojito create [options] custom <path/to/archetype> <name>
        source = pathify(args.shift());
        err = 'Custom archtype path is invalid.';
        break;

    default:
        // 3. mojito create [options] <path/to/archetype> <name>
        //    (this *should* be the only supported syntax)
        source = pathify(type);
        err = type + ' is not a valid archetype or path.';
    }

    return source || errorWithUsage(5, err);
}

function amMissingArgs(type, args) {
    var err = false;

    if (!type) {
        err = 'No parameters.';

    } else if (!args.length) {
        err = 'Missing subtype, name or path.';
    }

    return err && errorWithUsage(3, err);
}

function main(args, opts, meta, cb) {
    var type = args.shift() || '',
        source = amMissingArgs(type, args) || getSourceDir(type, args),
        name = args.shift(),
        keyval = util.parseCsvObj(opts.keyval),
        dest;

    if (opts.debug) {
        log.level = 'debug';
    }

    if (source instanceof Error) {
        cb(source);
        return;

    } else if (!name) {
        cb(errorWithUsage(3, 'Missing name.'));
        return;

    } else if (checkName(name)) {
        cb(util.error(3, 'Path separators not allowed in names.'));
        return;
    }

    if (('.' === name) && util.exists(source).isFile()) { // 2nd stat, fixme
        name = path.basename(source);
    }

    dest = getDestinationDir(type, opts.directory, name);
    keyval.name = opts.name || path.basename(dest);
    keyval.port = opts.port || 8666;

    log.info('Source: %s', source);
    log.info('Destination: %s', dest);

    function npmCb(err) {
        if (!err && ('app' === type)) {
            log.info('Ok, "%s" created.', name);
            log.info('Installing mojito application "' + dest + '’s" dependencies with npm.');
            npmi(dest, cb);
        } else {
            cb(err, 'Done.');
        }
    }

    create(source, dest, keyval, npmCb);
}

exports = main;

exports.usage = [
    'Usage: mojito create [options] <app|mojit> [full|simple|default] <name>',
    'Usage: mojito create [options] custom <path/to/archetype> <name>',
    'Usage: mojito create [options] <path/to/archetype> <name>',
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

exports.options = [
    {shortName: 'd', hasValue: true,  longName: 'directory'},
    {shortName: 'k', hasValue: true,  longName: 'keyval'},
    {shortName: 'p', hasValue: true,  longName: 'port'}
];

exports.test = {getSourceDir: getSourceDir};

module.exports = exports;
