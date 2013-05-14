/*
 * Copyright (c) 2011-2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
'use strict';

var spawn = require('child_process').spawn,
    which = require('which').sync,
    util = require('./utils');


function getbin(name) {
    try {
        return which(name);
    } catch(err) {
        console.log('no', name);
    }
}

function npmInstall(err, dir, cb) {
    var opts = {cwd: dir},
        bin = getbin('npm') || getbin('ynpm'),
        proc,
        after;

    if (err) {
        cb(err);
        return;
    }

    if (!bin) {
        cb(util.error(7, 'npm or ynpm was not found in your shell path.'));
        return;
    }

    /*jshint validthis:true */
    after = function onexit(code) {
        var err = null,
            msg = 'Done.';
        if (code !== 0) {
            err = util.error(code, 'Installing dependencies failed.');
            msg = '';
        }
        cb(err, msg);
    }.bind(this);

    proc = spawn(bin, ['install'], opts);
    proc.stderr.setEncoding('utf8');
    proc.stderr.pipe(process.stderr);

    proc.stdout.setEncoding('utf8');
    proc.stdout.pipe(process.stdout);

    proc.on('error', after);
    proc.on('exit', after);
}

module.exports = npmInstall;
