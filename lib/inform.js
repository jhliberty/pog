module.exports = function () {

  var growly = require('growly'),
      path = require('path'),
      icon = path.join(__dirname, '../') + 'lib/pog.png';

      growly.register('Pog', icon);

  return {

    done : function( data ) {
      // LET USER KNOW WE'RE DONE
      console.log('');
      console.log('   - - - - - - - - - - - - - - - - - - - - - - -');
      console.log('   Success! '.green + data.name.green + ' is all setup!'.green);
      console.log('   - - - - - - - - - - - - - - - - - - - - - - -');
      console.log('');
      console.log('   To get up & running, you just need to run these 2 commands:'.white);
      console.log();
      console.log('   1. install dependencies:'.blue + '      you only need to do this once'.grey);
      console.log('      $'.grey + ' cd %s && npm install && pog install'.white, data.pathName);
      console.log();
      console.log('   2. launch the app with gulp:'.blue);
      console.log('      $'.grey + ' gulp start'.white);
      console.log('');
      console.log('   Check out the docs for help or more info: '.white);
      console.log('   https://github.com/pogjs/pog'.blue);
      console.log('');

      growly.notify( data.name + ' is all setup!', { title: 'Success!' });

    },

    start : function() {

      console.log('');
      console.log('   - - - - - - - - - - - - - - - - - - - - - - - -');
      console.log('    Just a few questions, and you\'ll be all set!'.blue);
      console.log('   - - - - - - - - - - - - - - - - - - - - - - - - ');
      console.log('');

    },

    copy : function() {

      console.log('');
      console.log('   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
      console.log('    Cool, that\'s enough questions. Now we just need to copy a few files...'.blue);
      console.log('   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
      console.log('');

    }

  };

};
