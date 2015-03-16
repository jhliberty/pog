'use strict';

module.exports = function () {

  var useBower = false,
      fs = require('fs'),
      mkdirp = require('mkdirp'),
      growly = require('growly'),
      inform = require('../lib/inform')(),
      wrench = require('wrench'),
      ncp = require('ncp').ncp,
      path = require('path'),
      icon = path.join(__dirname, '../') + 'lib/pog.png',
      prompt = require('cli-prompt');
      require('colors');

  return {

    // GENERATE THE
    init: function(data) {

      var self = this,
          path = data.pathName;

      self.emptyDirectory(path, function(empty) {

        // IF DIRECTORY IS NOT EMPTY, CONTINUE WITH THE INSTALLATION
        if ( empty ) {
          self.create(data);
        } else {

          // ENABLE SOCKETS
          prompt.multi([{
            label: '   ERROR: '.red + 'Destination directory is not empty, continue? '.white,
            key: 'override',
            type: 'boolean',
            'default': 'no'
          }], function(allow) {

            // INSTALL IN NON-EMPTY DIRECTORY IS USER REQUESTS IT
            if ( allow.override ) {
              console.log('   WARN: '.yellow + 'installing in non-empty directory');
              process.stdin.destroy();
              self.create(data);
            } else {
              console.log('   ABORTED: '.red + 'Installation cancelled (directory not empty).');
            }
          });

        }
      });
    },

    // ERROR HANDLER
    error : function ( err ) {

      console.log('ERROR: '.red);
      return console.error(err);

    },

    create : function( program ) {

      var self = this,
          path = program.pathName;

      inform.copy();

      self.mkdir(path, function() {

        // console.log('   copying files...'.white );

        ncp(__dirname + '../../node_modules/pog-core', path, function(err) {

          if (err) return self.error(err); // HANDLE ERRORS

          // OPEN PACKAGE & BOWER FILES
          var bowerFile = path + '/bower.json',
              cfgFile = path + '/config/_settings.js',
              pkgFile = path + '/package.json',
              fileContent = fs.readFileSync(pkgFile),
              bowerContent = fs.readFileSync(bowerFile),
              bower = JSON.parse(bowerContent),
              pkg = JSON.parse(fileContent);

          // UPDATE PACKAGE SETTINGS
          pkg.name = path;
          pkg.description = '';
          pkg.version = '0.0.1';
          pkg.contributors = '';
          pkg.homepage = '';
          pkg.repository = '';
          pkg.bugs = '';
          pkg.licenses = '';

          // UPDATE BOWER SETTINGS
          bower.name = path;
          pkg.version = '0.0.1';


          if ( program.bower !== 'no' ) {
            pkg.dependencies.bower = 'latest';
          }

          // PARSE CONFIG FILE
          fs.readFile(cfgFile, function(err, data) {

            if (err) return self.error(err); // HANDLE ERRORS

            data = data.toString(); // STRINIFY DATA
            data = data.replace(new RegExp('Pog JS', 'g'), path); // UPDATE APP NAME


            if ( program.bower !== 'no' ) {
              data = data.replace(new RegExp('bower : false', 'g'), 'bower : true');
            }

            var css = self.css( program, data, pkg );
            data = css.data;

            var html = self.html( program, data, pkg );
            data = html.data;

            data = self.sockets( program, data );

            bower = self.bower( program, bower );


            // REMOVE CSS DIR
            wrench.rmdirSyncRecursive(path + '/public/css');

            // REPLACE WITH SELECTED PROCESSOR
            if (css.preprocessor !== false) {
              wrench.copyDirSyncRecursive(path + '/lib/templates/css/' + css.preprocessor, path + '/public/css/');
            } else {
              wrench.copyDirSyncRecursive(path + '/lib/templates/css/vanilla', path + '/public/css/');
            }

            // WRITE FILES
            fs.writeFileSync(bowerFile, JSON.stringify(bower, null, 4)); // WRITE BOWER FILE
            fs.writeFileSync(cfgFile, data); // WRITE CONFIG FILE
            fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 4)); // WRITE PACKAGE FILE

            // ADD .CACHE DIR
            if (!fs.existsSync(path + '/public/_cache/')) {
              wrench.mkdirSyncRecursive(path + '/public/_cache/', '0777');
            }

            // RENAME LICENSE TO POG-LICENSE
            if (fs.existsSync(path + '/LICENSE')) {
              fs.renameSync(path + '/LICENSE', path + '/POG-LICENSE');
            }

            // CREATE README FILE
            if (fs.existsSync(path + '/README.md')) {
              fs.writeFileSync(path + '/README.md', '# ' + path + '\n' + 'Information about your app should go here.');
            }

            // CLEANUP UNUSED STUFF
            if (fs.existsSync(path + '/lib/templates')) wrench.rmdirSyncRecursive(path + '/lib/templates');
            if (fs.existsSync(path + '/node_modules')) wrench.rmdirSyncRecursive(path + '/node_modules');
            if (fs.existsSync(path + '/CHANGELOG.md')) fs.unlink(path + '/CHANGELOG.md');
            // if (fs.existsSync(path + '/.jshintrc')) fs.unlink(path + '/.jshintrc');
            if (fs.existsSync(path + '/bower.json') && useBower === false) fs.unlink(path + '/bower.json');

            // TELL THE WORLD WE'RE ALL DONE
            inform.done( program );

          });

        }); // END NCP POG-CORE

      });

    },

    // ENABLE SOCKET.IO
    sockets : function ( program, data ) {

      if ( program.sockets ) data = data.replace(new RegExp('sockets : false', 'g'), 'sockets : true');

      return data;

    },

    // ADD BOWER PACKAGES
    bower : function ( program, bower ) {

      if ( program.bower !== 'no' ) {

        program.bower = program.bower.split(',');

        useBower = true;

        program.bower.forEach(function(element) {
          bower.dependencies[element.split(' ').join('')] = 'latest';
          console.log('   Adding support for '.white + element.blue + ' via bower'.white);
        });

        return bower;

      }

    },


    css : function( program, data, pkg ) {

      var preprocessor;

      // SET CSS ENGINE
      switch (program.css) {
        case 'sass':

          pkg.dependencies['node-sass'] = 'latest';
          data = data.replace(new RegExp('css : \'stylus\'', 'g'), 'css: \'sass\'');
          console.log('   Setting CSS preprocessor to '.white + 'SASS'.blue);
          preprocessor = 'sass';
          break;

        case 'less':

          pkg.dependencies['less-middleware'] = 'latest';
          data = data.replace(new RegExp('css : \'stylus\'', 'g'), 'css: \'less\'');
          console.log('   Setting CSS preprocessor to '.white + 'LESS'.blue);
          preprocessor = 'less';
          break;

        case 'stylus':

          pkg.dependencies.stylus = 'latest';
          data = data.replace(new RegExp('css : \'stylus\'', 'g'), 'css: \'stylus\'');
          console.log('   Setting CSS preprocessor to '.white + 'Stylus'.blue);
          preprocessor = 'stylus';
          break;

        default:

          data = data.replace(new RegExp('css : \'stylus\'', 'g'), 'css: false');
          preprocessor = false;

      }

      return {
        data : data,
        preprocessor : preprocessor,
        pkg : pkg
      };

    },

    html : function( program, data, pkg ) {

      var scriptFile, scriptContent, scriptTemplate, styleFile, styleContent, styleTemplate, headSpace,
          path = program.pathName,
          bowerScripts = '',
          bowerStyles = '';

      // SET TEMPLATING ENGINE
      switch (program.html) {

        // SETUP HANDLEBARS
        case 'handlebars':

          console.log('   Setting view template to '.white + 'Handlebars'.blue);

          pkg.dependencies['koa-handlebars'] = 'latest';
          scriptTemplate = '<script src="{{site.dir.lib}}{{src}}" ></script>' + '\n';
          styleTemplate = '        <link rel="stylesheet" href="{{site.dir.lib}}{{src}}">' + '\n';
          data = data.replace(new RegExp('template : \'jade\'', 'g'), 'template : \'handlebars\'');
          data = data.replace(new RegExp('extension : \'.jade\'', 'g'), 'extension : \'.hbs\'');
          wrench.rmdirSyncRecursive(path + '/app/views');
          wrench.copyDirSyncRecursive(path + '/lib/templates/views/handlebars', path + '/app/views/');

          wrench.rmdirSyncRecursive(path + '/app/controllers');
          wrench.copyDirSyncRecursive(path + '/lib/templates/controllers/handlebars', path + '/app/controllers/');

          // DON'T KEEP MVC CONTROLLER IN APP/CONTROLLERS
          if (fs.existsSync(path + '/app/controllers/mvcController.js')){
            fs.unlink(path + '/app/controllers/mvcController.js');
          }

          break;

        // SETUP NUNJUCKS
        case 'nunjucks':

          console.log('   Setting view template to '.white + 'Nunjucks'.blue);

          headSpace = '        ';

          pkg.dependencies['koa-nunjucks'] = 'latest';
          scriptTemplate = '<script src="{{site.dir.lib}}{{src}}" ></script>' + '\n';
          styleTemplate = '        <link rel="stylesheet" href="{{site.dir.lib}}{{src}}">' + '\n';
          data = data.replace(new RegExp('template : \'jade\'', 'g'), 'template : \'nunjucks\'');
          data = data.replace(new RegExp('extension : \'.jade\'', 'g'), 'extension : \'.nj\'');
          wrench.rmdirSyncRecursive(path + '/app/views');
          wrench.copyDirSyncRecursive(path + '/lib/templates/views/nunjucks', path + '/app/views/');

          wrench.rmdirSyncRecursive(path + '/app/controllers');
          wrench.copyDirSyncRecursive(path + '/lib/templates/controllers/nunjucks', path + '/app/controllers');

          break;

        // SETUP JADE
        default:

          console.log('   Setting view template to '.white + 'Jade'.blue);

          headSpace = '    ';

          pkg.dependencies['koa-jade'] = 'latest';
          scriptTemplate = 'script(src=\'#{site.dir.lib}{{src}}\')\n';
          styleTemplate = '    link(rel="stylesheet", href="#{site.dir.lib}{{src}}")' + '\n';

          wrench.rmdirSyncRecursive(path + '/app/views');
          wrench.copyDirSyncRecursive(path + '/lib/templates/views/jade', path + '/app/views/');

          // UPDATE SCRIPT FILE
          scriptFile = path + '/app/views/_inc/foot.jade';
          scriptContent = fs.readFileSync(scriptFile);

        }


        return {
          data : data,
          pkg : pkg,
          scriptContent : scriptContent,
          scriptFile : scriptFile,
          scriptTemplate : scriptTemplate,
          styleTemplate : styleTemplate
        };

    },

    // CREATE DIRECTORY
    mkdir: function(path, fn) {
      mkdirp(path, '0755', function(err) {
        if (err) throw err;
        return fn && fn();
      });
    },

    // CHECK IF THE LOCATION WE'RE TRYING TO INSTALL TO IN EMPTY
    emptyDirectory: function(path, cb) {
      fs.readdir(path, function(err, files) {
        if (err && 'ENOENT' !== err.code) throw err;
        cb(!files || !files.length);
      });
    },

  };

};
