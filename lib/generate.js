'use strict';

module.exports = function () {

  // MODULE DENEPDENCIES
  var mkdirp = require('mkdirp'),
      colors = require('colors'),
      exec = require('child_process').exec,
      fs = require('fs'),
      ncp = require('ncp').ncp,
      os = require('os'),
      pkg = require('../package.json'),
      spawn = require('child_process').spawn,
      version = pkg.version;

  return {

    model : function( name, db ) {

      if ( fs.existsSync('./package.json') ) {

        var app = {},
            pkgFile = './package.json',
            fileContent = fs.readFileSync(pkgFile),
            pkg = JSON.parse(fileContent),
            path = require('path'),
            root = path.resolve('./'),
            appName = pkg.name,
            cfgFile = root + '/config/_settings.js',
            // cfg = fs.readFileSync(cfgFile),
            cfg = require(cfgFile)(app),
            // cfg = require('../../config/_settings.js')(app),
            htmlEngine = pkg.config,
            templates = path.join(__dirname, '../') + 'node_modules/pog-core/lib/templates/',
            modelDir = root + '/app/models/',
            modelFile = 'model.js',
            controllerDir = root + '/app/controllers/',
            controllerFile = 'controllers/' + app.config.engines.html.template + '/mvcController.js';


        // OVERRIDE FILE NAME IF WE'RE USING PARSE
        if ( db === 'parse' ) {
          modelFile = 'model.parse.js';
          controllerFile = 'controller.parse.js';
        }

        if ( fs.existsSync(root + '/app/models') ) {
          mkdirp(root + '/app/models');
        }

        // UPDATE MODEL
        fs.readFile( templates + modelFile , function (err, data) {

          if (err) {
            console.log('Error creating model file:'.red);
            console.log(err);
          } else {
            data = data.toString();
            data = data.replace(new RegExp('{model}', 'g'), name);
            fs.writeFileSync(modelDir + name + 'Model.js', data);
          }

        });


        // UPDATE CONTROLLER
        fs.readFile( templates + controllerFile , function (err, data) {

          if (err) {
            console.log('Error creating controller file:'.red);
            console.log(err);
          } else {

            data = data.toString();
            data = data.replace(new RegExp('{model}', 'g'), name + 'Model');

            fs.writeFileSync(controllerDir + name + 'Controller.js', data);
          }

        });

        process.on('exit', function(){


          if ( fs.existsSync(modelDir + name + 'Model.js') ) {
            console.log('');
            console.log('Success!'.white + ' Pog has generated 2 new files for you:'.white);
            console.log('-> app/models/'.green + name.green + 'Model.js'.green);
            console.log('-> app/controllers/'.green + name.green + 'Controller.js'.green);
            console.log('');
            console.log('The following URL\'s are now ready to use:'.white);
            console.log('-> '.blue + name.blue + '/all'.blue + '  list all items in collection/table'.grey);
            console.log('-> '.blue + name.blue + '/create'.blue + '  create new record'.grey);
            console.log('-> '.blue + name.blue + '/delete/:id'.blue + '  delete record with id ":id"'.grey);
            console.log('-> '.blue + name.blue + '/find'.blue + '  find items that match a query'.grey);
            console.log('-> '.blue + name.blue + '/update/:id'.blue + '  update item with id ":id"'.grey);
            console.log('');
            console.log('Be sure you set the schema for your model in '.white + 'app/models/'.blue + name.blue + '.js'.blue);
            console.log('');
            console.log('Check out the docs for help or more info: '.white + 'https://github.com/pogjs/pog#working-with-data'.blue);
            console.log('');
          } else {
            console.log('');
            console.log('Error: '.red + ' Error generating files: '.white);
            console.log(modelDir + name + 'Model.js');
            console.log('');
          }

        });

        return false;

      } else {

        console.log('');
        console.log('Error: '.red + ' app/controllers could not be found'.white);
        console.log('        Please be sure to run the generate command from the root of your site directory.'.white);
        console.log('');

        return false;

      }
    }
  };

};
