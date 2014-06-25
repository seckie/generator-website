gulp = require('gulp')
gutil = require('gulp-util')

coffee = require('gulp-coffee')
coffeelint = require('gulp-coffeelint')
compass = require('gulp-compass')
concat = require('gulp-concat')
uglify = require('gulp-uglify')
jshint = require('gulp-jshint')

path = require('path')
fs = require('fs')

paths = {
  coffee: [ 'src/coffee/**/*.coffee' ]
  js: [ 'public_html/js/script.js' ]
  staticJs: [
    'bower_components/jquery-1.11.1.min/index.js'
  ]
  staticJsDest: [
    'public_html/js/jquery-1.11.1.min.js'
  ]
  scss: [ 'src/scss/**/*.scss' ]
  lib: [
    'bower_components/jquery/dist/jquery.min.js'
    'bower_components/underscore/underscore.js'
    'bower_components/backbone/backbone.js'
  ]
}


###
 * Coffee Script
###

coffeeStream = coffee({ bare: true }).on('error', (err) ->
  gutil.log(err)
  coffeeStream.end()
)

coffeelintStream = coffeelint(
  'no_trailing_whitespace':
    'level': 'error'
)

coffeelintStream.on('error', (err) ->
  gutil.log(err)
  coffeelintStream.end()
)
  

gulp.task('coffee', (callback) ->
  gulp.src(paths.coffee)
    .pipe(coffeelintStream)
    .pipe(coffeelint.reporter())
    .pipe(coffeelint.reporter('fail'))
    .pipe(coffeeStream)
    .pipe(gulp.dest('public_html/js'))
)


###
 * jshint
###

jshintStream = jshint().on('error', (err) ->
  gutil.log(err)
  jshintStream.end()
)

gulp.task('jshint', (callback) ->
  gulp.src(paths.js)
    .pipe(jshintStream)
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
)


###
 * Sass & Compass
###

gulp.task('compassDev', (callback) ->
  stream = compass(
    config_file: './config_dev.rb'
    css: 'public_html/css'
    sass: 'src/scss'
  ).on('error', (err) ->
    gutil.log(err)
    stream.end()
  )

  gulp.src(paths.scss)
    .pipe(stream)
)

gulp.task('compassPro', (callback) ->
  stream = compass(
    config_file: './config_pro.rb'
    css: 'public_html/css'
    sass: 'src/scss'
    project: path.join(__dirname)
  ).on('error', (err) ->
    gutil.log(err)
    stream.end()
  )

  gulp.src(paths.scss)
    .pipe(stream)
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
    .pipe(gulp.dest('public_html/js/'))
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
 * watch & command
###

gulp.watch(paths.coffee, [
  'coffee'
])
gulp.watch(paths.scss, [
  'compassDev'
])

gulp.task('default', [
  'coffee'
  'jshint'
  'compassDev'
])

gulp.task('deploy', [
  'copy'
  'buildLib'
  'coffee'
  'jshint'
  'compassPro'
])

