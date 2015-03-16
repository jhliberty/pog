module.exports = function () {

  // MODULE DENEPDENCIES
  var mkdirp = require('mkdirp'),
      colors = require('colors'),
      exec = require('child_process').exec,
      fs = require('fs'),
      growly = require('growly'),
      ncp = require('ncp').ncp,
      os = require('os'),
      path = require('path'),
      pkg = require('../package.json'),
      icon = path.join(__dirname, '../') + 'lib/pog.png',
      spawn = require('child_process').spawn,
      version = pkg.version;

  return {

    loopFiles : function( js, css, notInstalled, files ) {

      files.forEach( function(item) {

        if ( item.indexOf('.js') >= 0 ) {
          js.push(item);
        } else if( item.indexOf('.css') >= 0 ) {
          css.push(item);
        } else {
          if ( item !== false) notInstalled.push(item);
        }

        return {
          css : css,
          js : js,
          notInstalled : notInstalled
        };

      });

    },

    bower : function() {

      var self,
          path = '.';

      var resolve = function(pkg) {

        var path;

        try {
          var rc = fs.readFileSync('.bowerrc', 'utf8');
          path = JSON.parse(rc).directory || 'bower_components';
        } catch (err) {
          path = 'bower_components';
        }

        path += '/' + pkg + '/';

        console.log('   INFO: '.blue + 'Loading settings for '.white + pkg.split(' ').join('').blue);

        if ( fs.existsSync(path + '.bower.json') ) {
          var config = fs.readFileSync(path + '.bower.json', 'utf8');
          var main = JSON.parse(config).main;
        } else {
          // console.log('');
          console.log('   - - - - - - - - - - - - - - - - - - - - - - - - -'.red);
          console.log('   ERROR: '.red + 'Could not parse bower.json file for '.white + pkg.split(' ').join('').yellow);
          console.log('   - - - - - - - - - - - - - - - - - - - - - - - - -'.red);
        }



        if ( typeof main !== 'undefined' ) {
          return path + main;
        } else {
          return false;
        }
      };

      var bower = JSON.parse(fs.readFileSync(path + '/bower.json'));

      var bowerScripts = '',
          bowerStyles = '',
          css = [],
          js = [],
          notInstalled = [],
          viewType,
          dependencies = bower.dependencies;


      for (var key in bower.dependencies) {

        var files = resolve(key);

        if ( files !== false ) {

          if ( Array.isArray( files.split(',') ) ) {

            files = files.split(',');

            files.forEach( function(item) {

              if ( item.indexOf('.js') >= 0 ) {
                js.push(item);
              } else if( item.indexOf('.css') >= 0 ) {
                css.push(item);
              } else {
                if ( item !== false) notInstalled.push(item);
              }

              return {
                css : css,
                js : js,
                notInstalled : notInstalled
              };

            });

          } else {

            if ( files.indexOf('.js') >= 0 ) {
              js.push(files);
            } else if( files.indexOf('.css') >= 0 ) {
              css.push(files);
            } else {
              if ( files !== false) notInstalled.push(files);
            }

          }


        }


      }

      var scriptContent, scriptFile, scriptTemplate, styleTemplate, styleFile, styleContent;

      if ( fs.existsSync(path + '/app/views/index.jade') ) {

        viewType = 'jade';
        scriptTemplate = 'script(src=\'#{site.public.components}{{src}}\')\n';
        styleTemplate = '    link(rel="stylesheet", href="#{site.public.components}{{src}}")' + '\n';

        // UPDATE SCRIPT FILE
        scriptFile = path + '/app/views/_inc/foot.jade';
        scriptContent = fs.readFileSync(scriptFile);

        // UPDATE STYLE FILE
        styleFile = path + '/app/views/_inc/head.jade';
        styleContent = fs.readFileSync(styleFile);

      } else if ( fs.existsSync(path + '/app/views/index.hbs') ) {

        viewType = 'hbs';
        scriptTemplate = '<script src="{{site.public.components}}{{src}}" ></script>' + '\n';
        styleTemplate = '        <link rel="stylesheet" href="{{site.public.components}}{{src}}">' + '\n';

        // UPDATE SCRIPT FILE
        scriptFile = path + '/app/views/partials/foot.hbs';
        scriptContent = fs.readFileSync(scriptFile);

        // UPDATE STYLE FILE
        styleFile = path + '/app/views/partials/head.hbs';
        styleContent = fs.readFileSync(styleFile);

      } else if ( fs.existsSync(path + '/app/views/index.ejs') ) {

        viewType = 'ejs';
        scriptTemplate = '<script src="<%= site.public.components %>{{src}}" ></script>' + '\n';
        styleTemplate = '        <link rel="stylesheet" href="<%= site.public.components %>{{src}}">' + '\n';

        // UPDATE SCRIPT FILE
        scriptFile = path + '/app/views/_inc/foot.ejs';
        scriptContent = fs.readFileSync(scriptFile);

        // UPDATE STYLE FILE
        styleFile = path + '/app/views/_inc/head.ejs';
        styleContent = fs.readFileSync(styleFile);

      }


      js.forEach( function(item) {
        bowerScripts += scriptTemplate.replace('{{src}}', item.split('public/components/').join('') );
      });

      css.forEach( function(item) {
        bowerStyles += styleTemplate.replace('{{src}}', item.split('public/components/').join('') );
      });

        if ( viewType === 'jade' ) {

          // WRITE SCRIPTS
          require('prepend')(scriptFile, bowerScripts + '\n', function(error) {
            if (error) {
              console.log('ERROR:'.red);
              console.error(error.message);
            }
          });

          fs.appendFileSync(styleFile, '\n\n' + bowerStyles); // WRITE STYLES

        } else {

          fs.readFile( scriptFile, function (err, data) {
            data = data.toString();
            data = data.replace(new RegExp('</body>', 'g'), '\n' + bowerScripts + '\n\n</body>');
            fs.writeFileSync(scriptFile, data); // WRITE CONFIG FILE
          });

          fs.readFile( styleFile, function (err, data) {
            data = data.toString();
            data = data.replace(new RegExp('</head>', 'g'), '\n' + bowerStyles + '\n\n</head>');
            fs.writeFileSync(styleFile, data); // WRITE CONFIG FILE
          });

        }

      console.log('');
      console.log('   INFO: '.blue + 'Adding bower files to page templates'.white);

      if ( js.length > 0 ) {

        console.log('   INFO: '.blue + 'The following JavaScript files have been appended to '.white + scriptFile);

        js.forEach( function(item) {
          item = item.split('public/lib/').join('');
          console.log( '         > '.grey + 'public/lib/'.grey + item.grey );
        });

        console.log(' ');

      }


      if ( css.length > 0 ) {

        console.log('   INFO: '.blue + 'The following CSS files have been appended to ' + styleFile);

        css.forEach( function(item) {
          item = item.split('public/lib/').join('');
          console.log( '         > '.grey + 'public/lib/'.grey + item.grey );
        });

        console.log(' ');

      }


      if ( css.notInstalled > 0 ) {

        console.info('   INFO: '.blue + 'The following files were installed, but could not be autmatically added to your templates:');

        notInstalled.forEach( function(item) {
          item = item.split('public/lib/').join('');
          console.log( '         > '.grey + 'public/lib/'.grey + item.grey );
        });

        console.log(' ');

      }

      console.log('   - - - - - - - - - - - - - - - - - - - - - - - - - -'.green);
      console.log('   DONE: '.green + 'Bower files have been successfully installed'.white);
      console.log('   - - - - - - - - - - - - - - - - - - - - - - - - - -'.green);
      console.log(' ');


      growly.notify( 'Bower files have been successfully installed', { title: 'Done!' });

      return false;

    }

  };

};
