'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');


var WebsiteGenerator = yeoman.generators.Base.extend({
  init: function () {
    this.pkg = require('../package.json');

    this.on('end', function () {
      if (this.options['install-modules']) {
        this.installDependencies();
      }
    });
  },

  askFor: function () {
    var done = this.async();

    // have Yeoman greet the user
    this.log(this.yeoman);

    // replace it with a short and sweet description of your generator
    this.log(chalk.magenta('You\'re using the generator of website'));

    var prompts = [{
      type: 'confirm',
      name: 'install-modules',
      message: 'Would you like to install npm modules right now?',
      default: false
    }];

    this.prompt(prompts, function (props) {
      this.someOption = props.someOption;

      done();
    }.bind(this));
  },

  app: function () {
    this.mkdir('public');
    this.mkdir('src/jade');
    this.mkdir('src/jade/include');
    this.mkdir('src/stylus');
    this.mkdir('src/coffee');

    this.copy('_package.json', 'package.json');
    //this.copy('_Gruntfile.coffee', 'Gruntfile.coffee');
    this.copy('gulpfile.js', 'gulpfile.js');
    this.copy('karma.conf.js', 'karma.conf.js');
  },

  projectfiles: function () {
    this.copy('editorconfig', '.editorconfig');
    this.copy('jshintrc', '.jshintrc');
    this.copy('htmllintrc', '.htmllintrc');

    // jade
    this.copy('jade/base.jade', 'src/jade/include/base.jade');
    this.copy('jade/index.jade', 'src/jade/index.jade');
    // stylus
    this.copy('stylus/style.styl', 'src/stylus/style.styl');
    this.copy('stylus/_function.styl', 'src/stylus/_function.styl');
    this.copy('stylus/_mixin.styl', 'src/stylus/_mixin.styl');
  }
});

module.exports = WebsiteGenerator;
