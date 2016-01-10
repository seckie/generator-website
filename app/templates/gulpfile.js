"use strict";
var gulp = require('gulp');
var gutil = require('gulp-util');
var coffee = require('gulp-coffee');
var coffeelint = require('gulp-coffeelint');
var jshint = require('gulp-jshint');
var stylus = require('gulp-stylus');
var nib = require('nib');
var jade = require('gulp-jade');
var karma = require('karma').server;
var notify = require('gulp-notify');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var browserSync = require('browser-sync');
var _ = require('lodash');
var fs = require('fs');
var spritesmith = require("gulp.spritesmith");

var publicDir = 'public/';

var paths = {
  jade: [
    'src/jade/*.jade'
  ],
  html: [
    publicDir + '**/*.html'
  ],
  htmlDir: publicDir,
  coffee: [
    'src/coffee/**/*.coffee'
  ],
  coffeeMain: './src/coffee/main.coffee',
  js: [
    publicDir + 'js/**/*.js'
  ],
  jsDir: publicDir + 'js',
  bundleName: 'bundle.js',
  stylus: [ 'src/stylus/**/*.styl' ],
  cssDir: publicDir + 'css',
  spriteImg: [
    'src/sprite/*'
  ],
  spriteImgName: [
    'main.png'
  ],
  spriteCSSName: [
    'sprite-main.styl'
  ],
  spriteImgDest: publicDir + 'img/sprite',
  spriteCSSDest: 'src/stylus/sprite'
};

var errorHandler = function (e) {
  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: 'Compile Error',
    message: '<%= error %>',
    sound: false
  }).apply(this, args);
  this.emit('end');
};

var jadeLocalVar = {
  build: false
};
gulp.task('jade-before-build', function (cb) {
  jadeLocalVar.build = true;
  return cb();
});
gulp.task('jade', function () {
  return gulp.src(paths.jade)
    .pipe(jade({
        pretty: true,
        locals: jadeLocalVar
      }).on('error', errorHandler))
    .pipe(gulp.dest(paths.htmlDir));
});

gulp.task('coffee', function () {
  return gulp.src(paths.coffee)
    .pipe(coffee().on('error', errorHandler))
    .pipe(coffeelint({
      'no_trailing_whitespace': {
        'level': 'error'
      }
    }).on('error', errorHandler))
    .pipe(gulp.dest(paths.jsDir))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('browserify', function () {
  return browserify({
      entries: [ paths.coffeeMain ],
      extensions: [ '.coffee' ],
      debug: true,
      fullPath: false
    })
    .transform('coffeeify')
    .bundle()
    .on('error', errorHandler)
    .pipe(source(paths.bundleName))
    .pipe(gulp.dest(paths.jsDir))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('browserify-watch', function () {
  var opts = _.assign({}, watchify.args, {
    entries: [ paths.coffeeMain ],
    extensions: [ '.coffee' ],
    debug: true,
    fullPath: false
  });
  var b = wathify(browserify(opts));
  b.transform('coffeeify');
  b.on('update', bundle);
  b.on('log', gutil.log);
  var bundle = function () {
    b.bundle()
      .on('error', errorHandler)
      .pipe(source(paths.bundleName))
      .pipe(gulp.dest(paths.jsDir))
      .on("end", browserSync.reload({ stream: true }));
  };
  return bundle;
});
gulp.task('jshint', function () {
  return gulp.src(paths.js)
    .pipe(jshint().on('error', errorHandler))
    .pipe(jshint.reporter('default'));
});

gulp.task('test', function (cb) {
  return karma.start({
    configFile: __dirname + '/karma.conf.js'
  }, cb);
});

gulp.task('stylus', function () {
  return gulp.src(paths.stylus)
    .pipe(stylus({
      use: [ nib() ]
    }).on('error', errorHandler))
    .pipe(gulp.dest(paths.cssDir))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('sprite', function (cb) {
  var path = (paths.spriteImgDest).replace(publicDir, '/');
  paths.spriteImg.forEach(function (src, i) {
    var stream = spritesmith({
      imgName: paths.spriteImgName[i],
      cssName: paths.spriteCSSName[i],
      imgPath: path + '/' + paths.spriteImgName[i],
      algorithm: 'binary-tree',
      engine: 'gmsmith',
      imgOpts: { exportOpts: { quality: 100 } },
      padding: 2
    }).on('error', errorHandler);
    var spriteData = gulp.src(src).pipe(stream);
    spriteData.img.pipe(gulp.dest(paths.spriteImgDest));
    spriteData.css.pipe(gulp.dest(paths.spriteCSSDest));
  });
  return cb();
});

gulp.task('browser-sync', function () {
  return browserSync({
    server: {
      baseDir: './public'
    },
    startPath: '/'
  });
});

gulp.task('watch', function () {
  gutil.log('start watching');
  gulp.watch(paths.coffee, [ 'coffee' ]);
  gulp.watch(paths.stylus, [ 'stylus' ]);
  gulp.watch(paths.jade, [ 'jade' ]);
  gulp.watch(paths.html)
    .on('change', browserSync.reload);
});


// commands
gulp.task('default', [
  'browser-sync',
  'watch'
]);
gulp.task('deploy', [
  'jade-before-build',
  'jade',
  'coffee',
  'stylus'
]);
