# Pog JS

Pog is a modern MVC style framework built on top of [io](http://iojs.org) and [koa](http://koajs.com). It's built to be fast, simple and easy to configure, with sane defaults and flexible boilerplates to get you up and running as quickly as possible.

It's a work in progress. Check back often for updates.


#### DEPENDENCIES
Pog requies either io.js or node.js 0.12+ with the --harmony flag.


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

```
$ gulp start
```

or

```
$ iojs server.js
```
