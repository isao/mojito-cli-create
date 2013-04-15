/*
 * Copyright (c) 2011-2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
'use strict';

var resolve = require('path').resolve,
    getstat = require('fs').statSync,
    log = require('./log');


function exists(filepath) {
    var stat = false;
    try {
        stat = getstat(filepath);
    } catch(err) {
        log.debug('%s does not exist', filepath);
    }

    return stat;
}

function findInPaths(paths, target) {
    var filepath;
    function checkpath(basedir) {
        filepath = resolve(basedir, target);
        return exists(filepath);
    }

    return paths.some(checkpath) ? filepath : false;
}

function parseCsvObj(str) {
    var out = {};

    function splitcolon(item) {
        return item.split(':');
    }

    function onpair(pair) {
        if ((pair.length > 1) && pair[0].length) {
            // extra join to restore colon values like "a:b:c" -> {a: "b:c"}
            out[pair[0].trim()] = pair.slice(1).join(':').trim();
        }
    }

    (str || '').split(',').map(splitcolon).forEach(onpair);
    return out;
}

module.exports = {
	exists: exists,
	findInPaths: findInPaths,
	parseCsvObj: parseCsvObj
};
