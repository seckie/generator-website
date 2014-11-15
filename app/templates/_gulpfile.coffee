gulp = require('gulp')
gutil = require('gulp-util')

coffee = require('gulp-coffee')
coffeelint = require('gulp-coffeelint')
compass = require('gulp-compass')
concat = require('gulp-concat')
uglify = require('gulp-uglify')
jshint = require('gulp-jshint')
styledocco = require('gulp-styledocco')
browserSync = require('browser-sync')

path = require('path')
fs = require('fs')

paths = {
  coffee: [ 'src/coffee/**/*.coffee' ]
  js: [ 'public/js/script.js' ]
  staticJs: [
    'bower_components/jquery-1.11.1.min/index.js'
  ]
  staticJsDest: [
    'public/js/jquery-1.11.1.min.js'
  ]
  scss: [ 'src/scss/**/*.scss' ]
  lib: [
    'bower_components/jquery/dist/jquery.min.js'
    'bower_components/underscore/underscore.js'
    'bower_components/backbone/backbone.js'
  ]
  doc: 'public/docs'
}


###
 * Coffee Script
###



gulp.task('coffee', (callback) ->
  coffeeStream = coffee({ bare: true }).on('error', (err) ->
    gutil.log(err)
    coffeeStream.end()
  )
  coffeelintStream = coffeelint(
    'no_trailing_whitespace':
      'level': 'error'
  ).on('error', (err) ->
    gutil.log(err)
    coffeelintStream.end()
  )
  gulp.src(paths.coffee)
    .pipe(coffeelintStream)
    .pipe(coffeelint.reporter())
    .pipe(coffeeStream)
    .pipe(gulp.dest('public/js'))
    .pipe(browserSync.reload({ stream: true }))
)


###
 * jshint
###

gulp.task('jshint', (callback) ->
  jshintStream = jshint().on('error', (err) ->
    gutil.log(err)
    jshintStream.end()
  )
  gulp.src(paths.js)
    .pipe(jshintStream)
    .pipe(jshint.reporter('default'))
)


###
 * Sass & Compass
###

gulp.task('compassDev', (callback) ->
  stream = compass(
    config_file: './config-dev.rb'
    css: 'public/css'
    sass: 'src/scss'
#     bundle_exec: true # exec with 'bundler'
  ).on('error', (err) ->
    gutil.log(err)
    stream.end()
  )

  gulp.src(paths.scss)
    .pipe(stream)
    .pipe(browserSync.reload({ stream: true }))
)

gulp.task('compassPro', (callback) ->
  stream = compass(
    config_file: './config.rb'
    css: 'public/css'
    sass: 'src/scss'
#     bundle_exec: true # exec with 'bundler'
  ).on('error', (err) ->
    gutil.log(err)
    stream.end()
  )

  gulp.src(paths.scss)
    .pipe(stream)
    .pipe(browserSync.reload({ stream: true }))
)

gulp.task('styledocco', [ 'compassPro' ], (callback) ->
  stream = styledocco(
    out: paths.doc
    name: '"Style Guide"'
    preprocessor: '"sass --compass"'
#     preprocessor: '"bundle exec sass --compass"'
    verbose: true
#     include: [
#       'public/fs/sp/common/css/global.css'
#       'public/fs/sp/css/style.css'
#     ]
  )
  gulp.src(paths.scss).pipe(stream)

  callback()
)



###
 * Concat
###

gulp.task('buildLib', () ->
  concatStream = concat('lib.js')
  uglifyStream = uglify(
    mangle: false
    preserveComments: 'all'
  )
  gulp.src(paths.lib)
    .pipe(concatStream)
    .pipe(uglifyStream)
    .pipe(gulp.dest('public/js/'))
    .pipe(browserSync.reload({ stream: true }))
)


###
 * Copy
###

gulp.task('copy', () ->
  for sr, i in paths.staticJs
    src = paths.staticJs[i]
    dest = paths.staticJsDest[i]
    fs.createReadStream(src).pipe(fs.createWriteStream(dest))
)

###
 * server
###
gulp.task('browser-sync', () ->
  browserSync(
    server:
      baseDir: './public'
  )
)


###
 * command
###

gulp.task('default', [
  'coffee'
  'jshint'
  'compassDev'
], () ->
  # watch
  gulp.watch(paths.coffee, [
    'coffee',
     browserSync.reload
  ])
  gulp.watch(paths.scss, [
    'compassDev',
     browserSync.reload
  ])
  gulp.watch(paths.html).on('change', browserSync.reload)
)

gulp.task('deploy', [
  'copy'
  'buildLib'
  'coffee'
  'jshint'
  'styledocco'
])

