var gulp = require('gulp');
var gutil = require('gulp-util');

var coffee = require('gulp-coffee');
var coffeelint = require('gulp-coffeelint');
var compass = require('gulp-compass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');

var path = require('path');
var fs = require('fs');

var paths = {
  coffee: [ 'src/coffee/**/*.coffee' ],
  js: [ 'public_html/js/script.js' ],
  staticJs: [
    'bower_components/jquery-1.11.1.min/index.js'
  ],
  staticJsDest: [
    'public_html/js/jquery-1.11.1.min.js'
  ],
  scss: [ 'src/scss/**/*.scss' ],
  lib: [
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/underscore/underscore.js',
    'bower_components/backbone/backbone.js'
  ]
};


/**
 * Coffee Script
 */

var coffeeStream = coffee({ bare: true }).on('error', function (err) {
  gutil.log(err);
  coffeeStream.end();
});

var coffeelintStream = coffeelint({
  'no_trailing_whitespace': {
    'level': 'error'
  }
});

coffeelintStream.on('error', function (err) {
  gutil.log(err);
  coffeelintStream.end();
});

gulp.task('coffee', function (callback) {
  return gulp.src(paths.coffee)
    .pipe(coffeelintStream)
    .pipe(coffeelint.reporter())
    .pipe(coffeelint.reporter('fail'))
    .pipe(coffeeStream)
    .pipe(gulp.dest('public_html/js'));
});


/**
 * jshint
 */

var jshintStream = jshint().on('error', function (err) {
  gutil.log(err);
  jshintStream.end();
});

gulp.task('jshint', function (callback) {
  return gulp.src(paths.js)
    .pipe(jshintStream)
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});


/**
 * Sass & Compass
 */

gulp.task('compassDev', function (callback) {
  var stream = compass({
    config_file: './config_dev.rb',
    css: 'public_html/css',
    sass: 'src/scss'
  }).on('error', function (err) {
    gutil.log(err);
    stream.end();
  });

  return gulp.src(paths.scss)
    .pipe(stream);
});

gulp.task('compassPro', function (callback) {
  var stream = compass({
    config_file: './config_pro.rb',
    css: 'public_html/css',
    sass: 'src/scss',
    project: path.join(__dirname)
  }).on('error', function (err) {
    gutil.log(err);
    stream.end();
  });

  return gulp.src(paths.scss)
    .pipe(stream);
});


/**
 * Concat
 */

gulp.task('buildLib', function () {
  var concatStream = concat('lib.js');
  var uglifyStream = uglify({
    mangle: false,
    preserveComments: 'all'
  }); 
  return gulp.src(paths.lib)
    .pipe(concatStream)
    .pipe(uglifyStream)
    .pipe(gulp.dest('public_html/js/'));
});


/**
 * Copy
 */

gulp.task('copy', function () {
  for (var i=0,l=paths.staticJs.length; i<l ; i++) {
    var src = paths.staticJs[i],
        dest = paths.staticJsDest[i];
    fs.createReadStream(src).pipe(fs.createWriteStream(dest));
  }
});


/**
 * watch & command
 */

gulp.watch(paths.coffee, [
  'coffee'
]);
gulp.watch(paths.scss, [
  'compassDev'
]);

gulp.task('default', [
  'coffee',
  'jshint',
  'compassDev',
]);

gulp.task('deploy', [
  'copy',
  'buildLib',
  'coffee',
  'jshint',
  'compassPro',
]);

