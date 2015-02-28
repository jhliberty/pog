# Pog JS

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/pogjs/pog?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![npm version](https://badge.fury.io/js/pog.svg)](http://badge.fury.io/js/pog)
[![Dependency Status](https://gemnasium.com/pogjs/pog.png)](https://gemnasium.com/pogjs/pog)

Pog is a modern MVC style framework built on top of [io.js](http://iojs.org) and [koa](http://koajs.com). It's built to be fast, simple and easy to configure, with sane defaults and flexible boilerplates to get you up and running as quickly as possible.

It's a work in progress, check back often for updates.

Full documentation will be coming soon. 


#### DEPENDENCIES
Pog takes advatage of the latest ES6 updates, and requies either io.js or node.js 0.12+ with the --harmony flag.


#### INSTALL COMMAND LINE TOOL

```
$ npm install pog -g
```


#### CREATE A NEW APP

```
$ pog myapp
```

Pog uses Jade by default, but you also have the option of handlebars or nunjucks (more coming soon).

###### CREATE NEW APP WITH NUNJUCKS

```
$ pog myapp --html nunjucks
```

###### CREATE NEW APP WITH HANDLEBARS

```
$ pog myapp --html handlebars
```


#### START THE SERVER

Assuming you have io.js installed
```
$ gulp start
```

or

```
$ iojs server.js
```

or

```
$ node --harmony server.js
```
