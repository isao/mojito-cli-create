/*
 * Copyright (c) 2011-2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
'use strict';

var log = require('./log'),
    exec = require('child_process').exec;


function npmInstall(cmd, dir, cb) {
    var shellcmd = ['cd', dir, '&&', cmd].join(' ');

    function onexec(err, stdout, stderr) {
        if (err) {
            log.error('err:', err);
            log.error('Could not install dependencies.');
        }
        if (stdout.trim().length) {
            log.info(stdout);
        }
        if (stderr.trim().length) {
            log.error(stderr);
        }

        cb(err, 'Done.');
    }

    exec(shellcmd, onexec);
}

module.exports = npmInstall;
