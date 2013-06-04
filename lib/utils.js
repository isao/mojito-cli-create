/*
 * Copyright (c) 2011-2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
'use strict';

var resolve = require('path').resolve,
    getstat = require('fs').statSync,
    log = require('./log');


function error(code, msg) {
    var err = new Error(msg);
    err.errno = code;
    return err;
}

function exists(filepath) {
    var stat = false;
    try {
        stat = getstat(filepath);
    } catch(err) {
    }
    return stat;
}

/**
 * Find the path of some target, looking in one or more directories. Similar to
 * $PATH resolution of a POSIX executable in the shell.
 * @param {array} paths One or more filesystem paths
 * @param {string} target A filesystem name or subpath
 * @return {string|false} Resolved pathname of target if exists, false otherwise
 */
function findInPaths(paths, target) {
    var pathname;

    function checkpath(basedir) {
        var stat;
        pathname = resolve(basedir, target);
        stat = exists(pathname);
        log.debug('archetype%s in path %s', stat ? '' : ' not', basedir);
        return stat;
    }

    return paths.some(checkpath) && pathname;
}

/**
 * @param {string|null} str Mojito context strings are comma-separated key/value
 *   pairs like "key1:val1,key2:val2", or "device:iphone,lang:en-US"
 * @return {object} An object/hash/dict representing the parsed context string.
 *   Returns an empty object if `str` is a falsey value.
 */
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
    error: error,
    exists: exists,
    findInPaths: findInPaths,
    parseCsvObj: parseCsvObj
};
