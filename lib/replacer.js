/*
 * Copyright (c) 2011-2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
var through = require('through');

/**
 * do key/value replacement on a through-stream. example usage:
 *
 *   fs.createReadStream(source)
 *      .pipe(replacer(data))
 *      .pipe(fs.createWriteStream(dest));
 *
 * @param {object} kvs template placeholders their and replacement values
 * @param {regexp} rgx? regex for string replacement, defaults to {{this_type}}
 * @param {string} eol? end-of-line delimiter, defaults to newline
 * @return {function} a through stream https://github.com/dominictarr/through
 */
function replacer(kvs, rgx, eol) {
    /*jshint strict:false */
    var sofar = '';
    rgx = rgx || /\{\{(\S+)\}\}/g;
    eol = eol || '\n';

    function replaceCb(match, key) { // mdn http://cl.ly/OPzu
        return kvs.hasOwnProperty(key) ? kvs[key] : match;
    }

    function write(buffer) {
        var pieces = (sofar + buffer).split(eol);
        sofar = pieces.pop(); // save last bit until we get a whole line
        this.queue(pieces.join(eol).replace(rgx, replaceCb));
    }

    function end() {
        /*jshint eqnull:true*/
        if (sofar != null) {
            this.queue(sofar);
        }
        this.queue(null);
    }

    return through(write, end);
}

module.exports = replacer;
