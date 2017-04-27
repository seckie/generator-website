'use strict';
var Generator = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

module.exports = Generator.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the awesome ' + chalk.red('generator-website') + ' generator!'
    ));

    var prompts = [{
      type: 'confirm',
      name: 'install-dependencies',
      message: 'Would you like to install dependencieds right now?',
      default: false
    }];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      this.props = props;
    }.bind(this));
  },

  writing: function () {
    var files = [
      ['_package.json', 'package.json'],
      ['gulpfile.js', 'gulpfile.js'],
      ['karma.conf.js', 'karma.conf.js'],
      ['editorconfig', '.editorconfig'],
      ['htmllintrc', '.htmllintrc'],
      ['babelrc', '.babelrc'],
      ['gitignore', '.gitignore'],
      // jade
      ['jade/base.jade', 'src/jade/include/base.jade'],
      ['jade/index.jade', 'src/jade/index.jade'],
      // stylus
      ['stylus/style.styl', 'src/stylus/style.styl'],
      ['stylus/_function.styl', 'src/stylus/_function.styl'],
      ['stylus/_mixin.styl', 'src/stylus/_mixin.styl'],
      // sass
      ['sass/style.sass', 'src/sass/style.sass'],
      ['sass/normalize.css', 'src/sass/normalize.css'],
      ['sass/_mixin.sass', 'src/sass/_mixin.sass'],
      ['sass/_var.sass', 'src/sass/_var.sass']
    ];
    files.forEach(file => {
      this.fs.copy(
        this.templatePath(file[0]),
        this.destinationPath(file[1])
      );
    });
  },

  install: function () {
    if (!this.options['skip-install'] &&
      this.options['install-dependencies']) {
      this.installDependencies();
    }
  }
});
