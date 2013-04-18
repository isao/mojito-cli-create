/*
 * Copyright (c) 2011-2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
/*jshint strict: false */

var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp').sync,
    split = require('split'),

    log = require('./log'),
    utils = require('./utils'),

    Mapr = require('stream').PassThrough,
    Scan = require('scanfs'),

    // empty files named ".placeholder" are used to materialize
    // otherwise empty dirs from git, but we should ignore them
    ignore = [/^\.(git|svn)/, '.placeholder'],
    TEMPLATE_RE = /[.]hb$/;


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

function copy(err, pathname) {
    var dest = this.saveas(pathname);
    log.debug('copy %s -> %s', pathname, dest);
    fs.createReadStream(pathname)
        .pipe(fs.createWriteStream(dest));
}

function templatizer(err, pathname) {
    var dest = this.saveas(pathname).replace(TEMPLATE_RE, ''),
        out = fs.createWriteStream(dest),
        data = this.data,
        mapr = new Mapr();

    function mapdata() {
        var key = arguments[1];
        return data.hasOwnProperty(key) ? data[key] : key;
    }

    mapr._transform = function(chunk, encoding, cb) {
        var str = String(chunk);
        cb(null, str.replace(/\{\{(\S+?)\}\}/g, mapdata) + '\n');
    };

    log.debug('render %s -> %s', pathname, dest);
    fs.createReadStream(pathname)
        .pipe(split())
        .pipe(mapr)
        .pipe(fs.createWriteStream(dest));
}

function isTemplate(err, pathname, stat) {
    if (stat.isFile() && pathname.match(TEMPLATE_RE)) {
        return 'template';
    }
}

function handleBareFileDir(from, to) {
    var stat = utils.exists(from),
        is_file = stat && stat.isFile(),
        destdir = path.dirname(to);

    if (is_file && !utils.exists(destdir)) {
        // if a --destination option is specified, we may need to mkdirp it
        // this supports the single file archetype use-case
        log.debug('mkdirp --destination', destdir);
        mkdirp(destdir);
    }
}

// todo: enable config TEMPLATE_RE
// todo: modularize templatizer
function main(from, to, data, cb) {
    var scan = new Scan(ignore);

    // special case where "from" is a file, not a directory
    // when "from" is a dir, the dir event invokes mkdirp
    // when "from" is a file, this doesn't happen
    handleBareFileDir(from, to);

    function ondone(count) {
        cb(null, count);
    }

    scan.typeSetter = isTemplate;
    scan.saveas = saver(from, to);
    scan.data = data;

    scan.on('dir', mkdir);
    scan.on('file', copy);
    scan.on('template', templatizer);
    scan.on('error', log.error);
    scan.on('done', ondone);
    scan.relatively(from);
    return scan;
}

module.exports = main;
