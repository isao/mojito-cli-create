/*
 * Copyright (c) 2011-2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
'use strict';

var path = require('path'),
    mkdirp = require('mkdirp').sync,

    log = require('./lib/log'),
    util = require('./lib/utils'),
    create = require('./lib/create'),

    // default name of archetype directories
    ARCHETYPES = 'archetypes',

    // todo: make user configurable
    SRCPATHS = [path.resolve(__dirname, ARCHETYPES), path.join('../', ARCHETYPES)];


function errorWithUsage(code, msg) {
    var err = util.error(code, msg);
    err.usage = module.exports.usage;
    return err;
}

function makeDestinationDir(from, to) {
    var stat = util.exists(from),
        is_file = stat && stat.isFile(),
        dest = is_file ? path.dirname(to) : to,
        dstat = util.exists(dest),
        is_dir = dstat && dstat.isDirectory(),
        error = null;

    if (!dstat || !is_dir) {
        try {
            log.debug('mkdirp ', dest);
            mkdirp(dest);
        } catch(err) {
            error = util.error(9, 'Destination directory is invalid.');
        }
    }

    return error;
}

function getDestinationDir(type, destopt, name) {
    var parts = [destopt];

    if ('mojit' === type.toLowerCase()) {
        parts.push('mojits'); // BC - type "mojit" goes inside mojits dir
    }

    return path.resolve.apply(null, parts.concat(name));
}

function subtypePath(type, args) {
    var subtype = args.length > 1 ? args.shift() : 'default';
    return path.join(type, subtype).toLowerCase(); // i.e. 'app/full'
}

function getSourceDir(type, args, paths) {
    var source, err;

    // returns the first path in `paths` where `subpath` exists, or false
    function find(subpath) {
        return util.findInPaths(paths, subpath);
    }

    // get archetype source directory based on first one OR two arguments
    switch (type.toLowerCase()) {
    case 'app':
    case 'mojit':
        // 1. mojito create [options] <app|mojit> [full|simple|default] <name>
        source = find(subtypePath(type, args));
        err = 'Invalid subtype.';
        break;

    case 'custom':
        // 2. mojito create [options] custom <path/to/archetype> <name>
        source = find(args.shift());
        err = 'Custom archetype path is invalid.';
        break;

    default:
        // 3. mojito create [options] <path/to/archetype> <name>
        source = find(type);
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

// prepend "mojito/archetype" to the array of directories in which to find
// archetype templates, if provided.
function getSourcePaths(env) {
    var paths = [];

    // env.mojito is the full path to <cwd>/node_modules/mojito
    // OR the resolved full path of the --libmojito command line option
    if (env.mojito && env.mojito.path) {
        paths.push(path.join(env.mojito.path, ARCHETYPES));
    }

    // future: can add or modify this array further based on env opts or configs
    return paths.concat(SRCPATHS);
}

function exec(source, dest, keyval, cb) {
    var dircheck = makeDestinationDir(source, dest);

    log.info('Name:', keyval.name);
    log.info('Source:', source);
    log.info('Destination:', dest);

    if (dircheck) {
        cb(dircheck);
        return;
    }

    create(source, dest, keyval, cb);
}

function main(env, cb) {
    var type = env.args.shift() || '',
        paths = getSourcePaths(env),
        source = amMissingArgs(type, env.args) || getSourceDir(type, env.args, paths),
        name = env.args.shift(),
        keyval = util.parseCsvObj(env.opts.keyval),
        dest = env.opts.directory || '.';

    if (env.opts.loglevel) {
        log.level = env.opts.loglevel;
        log.silly('logging level set to', env.opts.loglevel);
    }

    if (source instanceof Error) {
        cb(source);
        return;
    }

    if (!name) {
        cb(errorWithUsage(3, 'Missing name.'));
        return;
    }

    if (name.indexOf(path.sep) !== -1) {
        // assume a name like foo/bar/baz is like --dir foo/bar & name baz
        // if --dir is already specified, use it too
        dest = path.resolve(dest, path.dirname(name));
        name = path.basename(name);
    }

    // enable shortcut for destination file/dir name
    if ('.' === name) {
        name = path.basename(source).replace(create.TEMPLATE_RE, '');
    }

    dest = getDestinationDir(type, dest, name);
    keyval.name = keyval.name || name;
    keyval.port = env.opts.port || 8666;

    function npmCb(err) {
        log.info('Installing mojito application "' + dest + '’s" dependencies with npm.');
        module.exports.npmi(err, dest, cb);
    }

    exec(source, dest, keyval, 'app' === type ? npmCb : cb);
}

module.exports = main;

module.exports.usage = [
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
    'Options: ',
    '  --directory <path> Optional destination directory',
    '  -d <path>          Short for --directory',
    '  --port <number>    Specifies default port for your Mojito app to run on.',
    '  -p [number]        Short for --port.',
    '  --keyval <string>  key value pairs to pass to a custom archetype template',
    '                     a key/value is separated by colons, key/value pairs by',
    '                     commas: "key1:val1,key2:val2',
    '  -k <string>        Short for --keyval'].join('\n');

module.exports.options = [
    {shortName: 'd', hasValue: true, longName: 'directory'},
    {shortName: 'k', hasValue: true, longName: 'keyval'},
    {shortName: 'p', hasValue: true, longName: 'port'}
];

module.exports.getSourceDir = getSourceDir;
module.exports.getSourcePaths = getSourcePaths;
module.exports.npmi = require('./lib/npmi');
