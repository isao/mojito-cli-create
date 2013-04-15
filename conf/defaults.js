var resolve = require('path').resolve;

module.exports = {
    'clobber': false,
    'remove': false,
    'port': 8666,
    'sources': ['.', resolve(__dirname, '../archetypes')]
};
