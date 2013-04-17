/*
 * Copyright (c) 2011-2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
'use strict';

var log = require('./log'),
    exec = require('child_process').exec;


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

module.exports = npmInstall;
