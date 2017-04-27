'use strict';
var gulp = require('gulp');
var gutil = require('gulp-util');
var path = require('path');

var sass = require('gulp-sass');
//var stylus = require('gulp-stylus');
//var nib = require('nib');
var webpack = require('webpack');
var gulpWebpack = require('gulp-webpack');
var eslint = require('gulp-eslint');
var pug = require('gulp-pug');

//var karma = require('karma').server;
//var spritesmith = require('gulp.spritesmith');

var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var browserSync = require('browser-sync').create();

var PUBLIC_PATH = 'public/';
var GULPFILE_PATH = './gulpfile.js';
var PATHS = {
  pug: ['src/pug/*.pug'],
  pugSrc: ['src/pug/**/!(_)*.pug'],
  html: [PUBLIC_PATH + '**/*.html'],
  htmlDir: PUBLIC_PATH,

  jsSrc: ['src/js/**/*.js'],
  jsSrcMain: './src/js/main.js',

  js: [PUBLIC_PATH + 'js/**/*.js'],
  jsDir: PUBLIC_PATH + 'js',
  jsMain: PUBLIC_PATH + 'js/main.js',

  sass: ['src/sass/**/*.sass'],
//  stylus: ['src/stylus/**/*.styl'],
//  stylusSrc: ['src/stylus/**/!(_)*.styl'],
  css: [PUBLIC_PATH + 'css/**/*.css'],
  cssDir: PUBLIC_PATH + 'css',

  spriteImg: ['src/sprite/*'],
  spriteImgName: ['main.png'],
  spriteCSSName: ['sprite-main.styl'],
  spriteImgDest: PUBLIC_PATH + 'img/sprite',
  spriteCSSDest: 'src/sass/sprite'
//  spriteCSSDest: 'src/stylus/sprite'
};

// methods
function errorHandler (err, stats) {
  if (err || (stats && stats.compilation.errors.length > 0)) {
    const error = err || stats.compilation.errors[0].error;
    notify.onError({ message: '<%= error.message %>' })(error);
  }
}

// build HTML
gulp.task('pug', function () {
  return gulp.src(PATHS.pugSrc)
    .pipe(plumber({ errorHandler: errorHandler }))
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest(PATHS.htmlDir));
});

// build CSS
gulp.task('sass', function () {
  return gulp.src(PATHS.sass)
    .pipe(plumber({ errorHandler: errorHandler }))
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(gulp.dest(PATHS.cssDir))
    .pipe(browserSync.stream());
});
//gulp.task('stylus', function () {
//  return gulp.src(PATHS.stylusSrc)
//    .pipe(plumber({ errorHandler: errorHandler }))
//    .pipe(stylus({use: [nib()]}))
//    .pipe(gulp.dest(PATHS.cssDir))
//    .pipe(browserSync.stream());
//});


// build JavaScript

gulp.task('eslint', function () {
  return gulp.src(PATHS.jsSrc.concat([GULPFILE_PATH]))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

  // webpack
var WEBPACK_OPT = {
  entry: { script: PATHS.jsSrcMain },
  output: {filename: '[name].js'},
  module: {
    loaders: [
      {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader'}
    ],
    resolve: {
      extensions: ['', '.js', '.jsx']
    }
  },
  externals: { }
};
gulp.task('build', function () {
  return gulp.src(PATHS.jsSrcMain)
    .pipe(gulpWebpack(WEBPACK_OPT, null, errorHandler))
    .pipe(gulp.dest(PATHS.jsDir))
    .pipe(browserSync.stream());
});

var WEBPACK_COMPRESS_OPT = {
  output: { filename: '[name].min.js' },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      comments: function (astNode, comment) {
        return /^!\*?/.test(comment.value) ||
               /(@preserve|@license|Copyright)/.test(comment.value);
      },
      mangle: false
    })
  ]
};
gulp.task('compress', function () {
  var opt = Object.assign({}, WEBPACK_OPT, WEBPACK_COMPRESS_OPT);
  return gulp.src(PATHS.jsSrcMain)
    .pipe(gulpWebpack(opt, null, errorHandler))
    .pipe(gulp.dest(PATHS.jsDir))
    .pipe(browserSync.stream());
});

// sprite
gulp.task('sprite', function (cb) {
  var path = (PATHS.spriteImgDest).replace(PUBLIC_PATH, '/');
  PATHS.spriteImg.forEach(function (src, i) {
    var stream = spritesmith({
      imgName: PATHS.spriteImgName[i],
      cssName: PATHS.spriteCSSName[i],
      imgPath: path + '/' + PATHS.spriteImgName[i],
      algorithm: 'binary-tree',
      engine: 'gmsmith',
      imgOpts: {exportOpts: {quality: 100}},
      padding: 2
    }).on('error', errorHandler);
    var spriteData = gulp.src(src).pipe(stream);
    spriteData.img.pipe(gulp.dest(PATHS.spriteImgDest));
    spriteData.css.pipe(gulp.dest(PATHS.spriteCSSDest));
  });
  return cb();
});

// test
//gulp.task('test', function (cb) {
//  return karma.start({
//    configFile: path.join(__dirname, '/karma.conf.js')
//  }, cb);
//});

// server
gulp.task('browser-sync', function () {
  browserSync.init({
    open: false,
    server: {
      baseDir: './public',
      middleware: [
        function (req, res, next) {
          var msg = req.method;
          msg += ' ';
          msg += req.url;
          msg += '  ';
          msg += req.statusCode;
          msg += ' ';
          msg += req.statusMessage;
          console.log(msg);
          next();
        }
      ]
    }
  });
});

// watch
gulp.task('watch', function () {
  gutil.log('start watching');
  gulp.watch(PATHS.pug, ['pug']);
  //gulp.watch(PATHS.stylus, ['stylus']);
  gulp.watch(PATHS.sass, ['sass']);
  gulp.watch(PATHS.jsSrc, ['eslint', 'build']);
  gulp.watch([GULPFILE_PATH], ['eslint']);
});

// commands
gulp.task('default', ['browser-sync', 'sass', 'pug', 'watch']);
