/*
 * Copyright (c) 2011-2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
/*jshint node:true */
'use strict';

var path = require('path'),
    util = require('util'),
    fs = require('fs'),
    exec = require('child_process').exec,
    hb = require('handlebars'),
    log = require('./log'),
    reservedWords = require('./conf/reserved-words'),

    archetypePath = path.resolve(__dirname, './archetypes');


/**
 * Determine the path to some archtype and ensure that it exists (or die)
 * @param {String} type Is one of: app, mojit, custom
 * @param {String} subtype If type is 'custom', this is the path to the source
 *   directory of the archtype files to use. Otherwise, it's a subdirectory of
 *   the mojito framework archetype path (archetypePath).
 * @return {String} absolute filesystem path
 */
function getArchetypeSrcDir(type, subtype) {
    var stat, srcdir, errmsg;

    if (type === 'custom') {
        srcdir = path.resolve(subtype);
        errmsg = 'Custom archetype path does not exist: ' + srcdir;
    } else {
        srcdir = path.resolve(archetypePath, type, subtype);
        errmsg = 'Invalid archetype "' + type + '"';
    }

    try {
        stat = fs.statSync(srcdir);
        if (!stat.isDirectory()) {
            log.error('Archetype path is not a directory', exports.usage, true);
        }
    } catch (err) {
        log.error(errmsg, exports.usage, true);
    }

    return srcdir;
}

/**
 * Convert a CSV string into a context object.
 * @param {string} s A string of the form: 'key1:value1,key2:value2'.
 * @return {Object} The context object after conversion.
 */
function contextCsvToObject(s) {
    var ctx = {},
        pairs = s.split(','),
        pair,
        i;

    for (i = 0; i < pairs.length; i += 1) {
        pair = pairs[i].split(':');
        if (pair[0]) {
            if (!pair[1]) {
                warn('Missing value for context key: ' + pair[0]);
            } else {
                ctx[pair[0]] = pair[1];
            }
        }
    }

    return ctx;
}

/**
 * @param {String} name
 * @return {String} name The cleaned up name of the app, mojit, etc. to create.
 */
function cleanName(name) {
    var newname = name && name.replace(/[^a-z_0-9]+/ig, '_'),
        msg;

    if (!name) {
        log.error('Missing a target name to create', exports.usage, true);
        process.exit(1);
    }

    if (-1 !== reservedWords.indexOf(newname)) {
        msg = 'Name cannot be one of: ' + reservedWords.join(', ') + '\n';
        log.error(msg, exports.usage, true);
    }

    if (name !== newname) {
        msg = ['changing name ', name, ' to ', newname,
            ' so it is usable as a javascript identifier'].join('"');
        log.info(msg);
    }

    return newname;
}

function process_template(archetype_path, file, mojit_dir, template) {

    var archetype_file = path.join(archetype_path, file),
        new_file = path.join(mojit_dir, file.substring(0, file.length - 3)),
        stat,
        tmpl,
        compiled,
        output;

    /* going to check for file size and use compileText to avoid
       possible problems with any handlebars templateRoot settings
     */
    stat = fs.statSync(archetype_file);
    if (stat.size > 0) {
        tmpl = fs.readFileSync(archetype_file, 'utf8');
        compiled = hb.compile(tmpl);
        output = compiled(template);
        fs.writeFileSync(new_file, output);
    } else {
        fs.writeFileSync(new_file, '');
    }
}

function process_file(archetype_path, file, mojit_dir, template) {
    if (/\.hb$/.test(file)) {
        // Process as a HB template
        process_template(archetype_path, file, mojit_dir, template);
    } else {
        // Just copy the file over
        util.pump(
            fs.createReadStream(path.join(archetype_path, file)),
            fs.createWriteStream(path.join(mojit_dir, file)),
            function (err) {
                if (err) {
                    log.warn('Failed to copy file: ' + file);
                }
            }
        );
    }
}

function process_directory(archetype_path, dir, mojit_dir, template, force) {
    //    log.log('process_directory(' + archetype_path + ', ' + dir +
    //        ', ' + mojit_dir + ', ' + template + ',' + force + ')');
    var new_dir = path.join(mojit_dir, dir),
        files;

    try {
        fs.mkdirSync(new_dir, parseInt('755', 8));
    } catch (err) {
        if (err.message.match(/EEXIST/)) {
            log.warn('Overwriting existing directory: ' + new_dir);
        } else if (err.message.match(/ENOENT/) &&
                   mojit_dir.indexOf('mojits') === 0) {
            if (!force) {
                log.error('Please cd into a Mojito application before creating' +
                    ' a Mojit.\nTo force Mojit creation, use --force.');
                process.exit(1);
            }
        } else {
            log.error('Unexpected error: ' + err.message);
            process.exit(127);
        }
    }

    // log.info('created dir: ' + new_dir);
    // log.info('reading dir: ' + path.join(archetype_path, dir));

    files = fs.readdirSync(path.join(archetype_path, dir));
    files.forEach(function (f) {
        var s = fs.statSync(path.join(archetype_path, '/', dir, '/', f));

        if (f.charAt(0) === '.') {
            return;
        }
        if (s.isDirectory()) {
            process_directory(path.join(archetype_path, '/', dir), f,
                path.join(mojit_dir, '/', dir), template, force);
        } else {
            process_file(path.join(archetype_path, '/', dir), f,
                new_dir, template);
        }
    });
}

function npmInstall(dir) {
    log.info('Installing app "' + dir + '" dependencies with npm.');
    exec('cd ' + dir + ' && npm -s i', function(err, stdout, stderr) {
        if (err) {
            log.error('Could not install dependencies.');
        }
        if (stdout.trim().length) {
            log.info(stdout);
        }
        if (stderr.trim().length) {
            log.error(stderr);
        }
    });
}

function run(params, options, meta, callback) {
    var port = options.port || 8666,
        force = options.force || false,
        inputs = contextCsvToObject(options.keyval || ''),
        srcdir,
        destdir,

        // params[0] must be "app", "mojit", "custom"
        type = params[0] ? params[0].toLowerCase() : '',

        // params[1] may be "default", "simple", "full", "hybrid", path, name
        subtype = params[1],

        // params[2] may be name
        name = params[2];

    // If we have no name then the "subtype" might be it
    if (!name && 'hybrid' !== subtype) {
        name = subtype;
        subtype = 'default';
    }

    // check name, convert to js compat name, or die
    name = cleanName(name);

    // Validate type, which dictates destination path/name
    switch (type) {
    case 'app':
    case 'custom':
        destdir = path.resolve(name);
        break;
    case 'mojit':
        destdir = path.resolve('mojits', name);
        break;
    default:
        log.info(module.exports.usage);
        callback('Unknown type "' + type + '", use "app", "mojit", or "custom".');
        return;
    }

    // get path to mojito's archetypes dir, or a custom one, or die
    srcdir = getArchetypeSrcDir(type, subtype);

    log.info('creating ' + type + " type named '" + name + "'");
    log.info('(using "' + subtype + '" archetype)');

    // Define the inputs
    inputs.name = name;
    inputs.port = port;

    process_directory(srcdir, '/', destdir, inputs, force);
    log.info(type + ' ' + name + ' created.');

    if ('app' === type) {
        npmInstall(name);
    }

    callback();
}


/**
 * Standard run method hook export.
 */
module.exports = run;

/**
 * Standard usage string export.
 */
module.exports.usage = [
    'mojito create {type} [subtype or source directory] {name} [options]',
    '  - type: "app", "mojit", or "custom".',
    '  - archetype: optional template. Possible values are default, full, simple',
    '      "app" types also have a "hybrid" archetype which creates an app and a',
    '      mojit with common configurations for use with hybrid app.',
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
    'Example: mojito create app hybrid Baz',
    '  (creates directory "Baz" containing new hybrid app and mojit)',
    '',
    'OPTIONS: ',
    '  --port [number]  Specifies default port for your Mojito app to run on.',
    '  -p [number]      Short for --port',
    '  --force          Forced mojit creation even outside a Mojito app.',
    '  -f               Short for --force',
    '  -keyval [string] key value pairs to pass to a custom archetype template',
    '                   a key/value is separated by colons, key/value pairs by',
    '                   commas: "key1:val1,key2:val2',
    '  -k [string]      Short for --keyval'].join("\n");


/**
 * Standard options list export.
 */
module.exports.options = [{
    shortName: 'f',
    longName: 'force',
    hasValue: false
}, {
    shortName: 'k',
    longName: 'keyval',
    hasValue: true
}, {
    shortName: 'p',
    longName: 'port',
    hasValue: true
}];
