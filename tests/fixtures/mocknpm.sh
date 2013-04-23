#!/bin/sh -e

# for mock shell command exec
# pass desired exit code as first arg
exitcode=${1:-7}

echo 'test: stderr' >&2
echo "test: the exit code will be $exitcode"
exit $exitcode
