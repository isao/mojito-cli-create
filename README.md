mojito-create
=============

This package provides the `create` command for the `mojito-cli` tool.

Creating Code from Archetypes
-----------------------------

Archetypes are used to create skeletons for the different types of artifacts in a Mojito application. The skeletons only contain stripped down boilerplate code that is easier to create using the command-line tool rather than by hand.

To create a skeleton for a Mojito application:

    $ mojito create app [<archetype-name>] <app-name>

This will create an empty application (i.e., one with no mojits) with the name provided. The application is created in a directory named `<app-name>` within the current directory. If no archetype name is provided, the default archetype is used.

From the application directory, use the following command to create a skeleton for a mojit:

    $ mojito create mojit [<archetype-name>] <mojit-name>

This will create an empty mojit with the name provided. The command assumes it is being executed within an application directory. Thus, the mojit is created in a directory named `<mojit-name>` within a mojits subdirectory of the application directory. For example, the mojit MyMojit would be created in mojits/MyMojit.

As with application creation, if no archetype name is provided, the default archetype is used. Depending upon the archetype, the skeleton may include any or all of the controller, model, view, and binder.

Additionally, you can specify the path to specific archetype.

    $ mojito create custom <path/to/archtype> <name>

Mojito Archetypes
-----------------

Mojito offers the following three archetypes for applications and mojits.

* simple - The minimal configuration and code needed to run an application.
* default - This archetype is run if no command-line archetype option is specified. It is a happy medium between simple and full.
* full - Provides the most comprehensive configuration and code for applications.
* hybrid - Creates a hybrid HTML5 application that can be plugged into a future component of Cocktails that will allow HTML5/JavaScript applications to access the features of native devices.

Discussion/Forums
-----------------

http://developer.yahoo.com/forum/Yahoo-Mojito

Licensing and Contributions
---------------------------

`mojito-create` is licensed under a BSD license (see LICENSE.txt). To contribute to the Mojito project, please see [Contributing](https://github.com/yahoo/mojito/wiki/Contributing-Code-to-Mojito).

The Mojito project is a [meritocratic, consensus-based community project](https://github.com/yahoo/mojito/wiki/Governance-Model) which allows anyone to contribute and gain additional responsibilities.

