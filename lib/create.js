/*
 * Copyright (c) 2011-2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp').sync,
    log = require('./log'),

    Scan = require('scanfs'),

    // empty files named ".placeholder" are used to materialize
    // otherwise empty dirs from git, but we should ignore them
    ignore = [/^\.(git|svn)/, '.placeholder'];


function error(err, pathname) {
    log.error(err);
}

function saver(base_from, base_to) {
    return function saveas(pathname) {
        var subpath = pathname.substring(base_from.length);
        return path.join(base_to, subpath);
    };
}

function mkdir(err, pathname) {
    var dest = this.saveas(pathname);
    log.info('mkdirp %s', dest);
    mkdirp(dest);
}

function copy(err, pathname) {
    var dest = this.saveas(pathname);
    log.info('copy %s -> %s', pathname, dest);
    fs.createReadStream(pathname)
        .pipe(fs.createWriteStream(dest));
}

function templatizer(err, pathname) {
    var dest = this.saveas(pathname);
    log.info('render %s -> %s', pathname, dest);
    fs.createReadStream(pathname)
        .pipe(fs.createWriteStream(dest));
}

function isTemplate(err, pathname, stat) {
    if (stat.isFile() && pathname.match(/[.]hb$/)) {
        return 'template';
    }
}

function main(from, to, data, cb) {
    var scan = new Scan(ignore);

    function ondone(count) {
        cb(null, count);
    }

    scan.typeSetter = isTemplate;
    scan.saveas = saver(from, to);
    scan.on('dir', mkdir);
    scan.on('file', copy);
    scan.on('template', templatizer);
    scan.on('error', error);
    scan.on('done', ondone);
    scan.relatively(from);
    return scan;
}

module.exports = main;
