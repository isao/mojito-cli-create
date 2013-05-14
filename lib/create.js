/*
 * Copyright (c) 2011-2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
/*jshint strict:false */

var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp').sync,
    log = require('./log'),

    replacer = require('./replacer'),
    Scan = require('scanfs'),

    // empty files named ".placeholder" are used to materialize
    // otherwise empty dirs from git, but we should ignore them
    ignore = [/^\.(git|svn)/, '.placeholder'],
    TEMPLATE_RE = /[.]hb$/,

    // state
    pending,
    errors,
    callback;


function saver(base_from, base_to) {
    return function saveas(pathname) {
        var subpath = pathname.substring(base_from.length);
        return path.join(base_to, subpath);
    };
}

function mkdir(err, pathname) {
    var dest = this.saveas(pathname);
    log.debug('mkdirp %s', dest);
    mkdirp(dest);
}

function errorOndone() {
    var err = null,
        count = errors.length;
    if (count) {
        err = new Error(count + ' error' + (count > 1 ? 's' : ''));
        err.messages = errors;
    }
    return err;
}

function ondone() {
    pending--;
    if (!pending) {
        callback(errorOndone());
    }
}

function onerror(err) {
    errors.push(err.message);
    log.error(err.message);
}

function createWriter(dest) {
    var writer;

    pending++;
    writer = fs.createWriteStream(dest);
    writer.on('close', ondone);

    return writer;
}

function copy(err, pathname) {
    var dest = this.saveas(pathname),
        read = fs.createReadStream(pathname),
        write = createWriter(dest);

    log.debug('(%d) copy %s -> %s', pending, pathname, dest);
    read.pipe(write);
}

function templatizer(err, pathname) {
    var dest = this.saveas(pathname).replace(TEMPLATE_RE, ''),
        read = fs.createReadStream(pathname),
        write = createWriter(dest);

    log.debug('(%d) render %s -> %s', pending, pathname, dest);
    read.pipe(replacer(this.data))
        .pipe(write);
}

function isTemplate(err, pathname, stat) {
    if (stat.isFile() && pathname.match(TEMPLATE_RE)) {
        return 'template';
    }
}

// todo: make this an instance object with methods to set options, like:
// TEMPLATE_RE, ignores; also make state vars props, rm scan patching?
function main(from, to, data, cb) {
    var scan = new Scan(ignore, isTemplate);

    // up-scope state
    callback = cb || log.info;
    errors = [];
    pending = 1;

    scan.saveas = saver(from, to);
    scan.data = data;

    scan.on('dir', mkdir);
    scan.on('file', copy);
    scan.on('template', templatizer);
    scan.on('error', onerror);
    scan.on('done', ondone);
    scan.relatively(from);
    return scan;
}

module.exports = main;
module.exports.TEMPLATE_RE = TEMPLATE_RE;
