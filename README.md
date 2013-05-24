mojito-create  [![Build Status](https://travis-ci.org/yahoo/mojito-cli-create.png)](https://travis-ci.org/yahoo/mojito-cli-create)
=============

This package provides the `create` command for the [`mojito-cli`](https://github.com/yahoo/mojito-cli) tool.

Creating Code from Archetypes
-----------------------------

Archetypes are used to create skeletons for the different types of artifacts in a Mojito application. The skeletons 
only contain stripped down boilerplate code that is easier to create using the command-line tool rather than by hand.

To create a skeleton for a Mojito application:

    $ mojito create app [<archetype-name>] <app-name>

This will create an empty application (i.e., one with no mojits) with the name provided. The application is created 
in a directory named `<app-name>` within the current directory. If no archetype name is provided, the default 
archetype is used.

From the application directory, use the following command to create a skeleton for a mojit:

    $ mojito create mojit [<archetype-name>] <mojit-name>

This will create an empty mojit with the name provided. The command assumes it is being executed within an 
application directory. Thus, the mojit is created in a directory named `<mojit-name>` within the `mojits` subdirectory 
of the application directory. For example, the mojit `MyMojit` would be created in `mojits/MyMojit`.

As with application creation, if no archetype name is provided, the default archetype is used. Depending upon the 
archetype, the skeleton may include any or all of the following: controller, model, view, and binder

Mojito Archetypes
-----------------

Mojito offers the following three archetypes for applications and mojits.

* `simple` - The minimal configuration and code needed to run an application.
* `default` - This archetype is run if no command-line archetype option is specified. It is a happy medium between simple and full.
* `full` - Provides the most comprehensive configuration and code for applications.

Custom Archetypes
-----------------

You can copy the [built-in](https://github.com/yahoo/mojito-cli-create/tree/master/archetypes) archetypes and modify 
them to suit your work-flow, or create your own. Then you can specify the path to specific archetype, like so:

    $ mojito create custom <path/to/archtype> <name>

If a file in the archetype source ends with `.hb` then the contents of the file will have key/value replacement done 
for the following:

* `{{port}}` -> default port number 8666 or the value passed by option `--port`
* `{{name}}` -> the name passed as the last command line argument that is not a flag or option, like `--port`

You can also specify the option `--keyval` or `-k` to replace  key/value pairs in a string. 
For example, suppose you have the archetype directory `../menus` that has the one file `today.html.hb`
containing the Handlebars expressions `{{dish}}` and `{{side}}`. Running the command 
`mojito create custom ../menus TodaysMenu -k dish:tilapia,side:macaroni` would
create the new directory `TodaysMenu` containing the file `today.html` (notice that the ".hb" extension is removed).
In `today.html`, all occurrences of the strings `{{dish}}` and `{{side}}` would be replaced with 
`tilapia` and `macaroni`.

Discussion/Forums
-----------------

http://developer.yahoo.com/forum/Yahoo-Mojito

Licensing and Contributions
---------------------------

`mojito-cli-create` is licensed under a BSD license (see LICENSE.txt). To contribute to the Mojito project, 
please see [Contributing](https://github.com/yahoo/mojito/wiki/Contributing-Code-to-Mojito).

The Mojito project is a [meritocratic, consensus-based community project](https://github.com/yahoo/mojito/wiki/Governance-Model),
which allows anyone to contribute and gain additional responsibilities.

