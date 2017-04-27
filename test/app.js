'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('generator-website:app', function () {
  before(function () {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts({someAnswer: true})
      .toPromise();
  });

  it('creates files', function () {
    assert.file([
      'package.json',
      'gulpfile.js',
      'karma.conf.js',
      '.editorconfig',
      '.htmllintrc',
      '.gitignore',
      '.eslintrc.json',
      'src/pug/index.pug',
      'src/pug/include/_base.pug',
      'src/sass/style.sass',
      'src/sass/normalize.css',
      'src/sass/_mixin.sass',
      'src/sass/_var.sass'
    ]);
  });
});
