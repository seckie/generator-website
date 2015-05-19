gulp = require 'gulp'
gutil = require 'gulp-util'
coffee = require 'gulp-coffee'
coffeelint = require 'gulp-coffeelint'
jshint = require 'gulp-jshint'
stylus = require 'gulp-stylus'
nib = require 'nib'
jade = require 'gulp-jade'
karma = require('karma').server
notify = require 'gulp-notify'
browserify = require 'browserify'
watchify = require 'watchify'
source = require 'vinyl-source-stream'
browserSync = require 'browser-sync'
_ = require 'lodash'
fs = require 'fs'

publicDir = 'public/'

paths =
  jade: [
    'src/jade/*.jade'
  ]
  html: [
    publicDir + '**/*.html'
  ]
  htmlDir: publicDir
  coffee: [
    'src/coffee/**/*.coffee'
  ]
  coffeeMain: './src/coffee/main.coffee'
  js: [
    publicDir + 'js/**/*.js'
  ]
  jsDir: publicDir + 'js'
  bundleName: 'bundle.js'
  stylus: [ 'src/stylus/**/*.styl' ]
  cssDir: publicDir + 'css'
  spriteImg: [
    'src/sprite/*'
  ]
  spriteImgName: [
    'main.png'
  ]
  spriteCSSName: [
    'sprite-main.styl'
  ]
  spriteImgDest: publicDir + 'img/sprite'
  spriteCSSDest: 'src/stylus/sprite'

errorHandler = (e) ->
  args = Array.prototype.slice.call(arguments)
  notify.onError(
    title: 'Compile Error'
    message: '<%= error %>'
    sound: false
  ).apply(@, args)
  @.emit('end')

jadeLocalVar =
  build: false
gulp.task 'jade-before-build', (cb) ->
  jadeLocalVar.build = true
  cb()
gulp.task 'jade', () ->
  gulp.src(paths.jade)
    .pipe(jade(
        pretty: true
        locals: jadeLocalVar
      ).on('error', errorHandler))
    .pipe gulp.dest(paths.htmlDir)

gulp.task 'coffee', () ->
  gulp.src(paths.coffee)
    .pipe(coffee().on('error', errorHandler))
    .pipe(coffeelint(
        'no_trailing_whitespace':
          'level': 'error'
      ).on('error', errorHandler))
    .pipe(gulp.dest(paths.jsDir))
    .pipe browserSync.reload( stream: true )

gulp.task 'browserify', () ->
  browserify(
      entries: [ paths.coffeeMain ]
      extensions: [ '.coffee' ]
      debug: true
      fullPath: false
    )
    .transform('coffeeify')
    .bundle()
    .on('error', errorHandler)
    .pipe(source(paths.bundleName))
    .pipe(gulp.dest(paths.jsDir))
    .pipe browserSync.reload( stream: true )

gulp.task 'browserify-watch', () ->
  opts = _.assign {}, watchify.args,
    entries: [ paths.coffeeMain ]
    extensions: [ '.coffee' ]
    debug: true
    fullPath: false
  b = wathify browserify(opts)
  b.transform 'coffeeify'
  b.on 'update', bundle
  b.on 'log', gutil.log
  bundle = () ->
    b.bundle()
      .on('error', errorHandler)
      .pipe(source(paths.bundleName))
      .pipe(gulp.dest(paths.jsDir))
      .on "end", browserSync.reload( stream: true )

gulp.task 'jshint', () ->
  gulp.src(paths.js)
    .pipe(jshint().on('error', errorHandler))
    .pipe(jshint.reporter('default'))

gulp.task 'test', (cb) ->
  karma.start(
    configFile: __dirname + '/karma.conf.coffee'
  , cb)

gulp.task 'stylus', () ->
  gulp.src(paths.stylus)
    .pipe(stylus(
      use: [ nib() ]
    ).on('error', errorHandler))
    .pipe(gulp.dest(paths.cssDir))
    .pipe browserSync.reload({ stream: true })

gulp.task 'sprite', (cb) ->
  path = (paths.spriteImgDest).replace(publicDir, '/')
  for src, i in paths.spriteImg
    stream = spritesmith(
      imgName: paths.spriteImgName[i]
      cssName: paths.spriteCSSName[i]
      imgPath: path + '/' + paths.spriteImgName[i]
      algorithm: 'binary-tree'
      engine: 'gmsmith'
      imgOpts: { exportOpts: { quality: 100 } }
      padding: 2
    ).on('error', errorHandler)
    spriteData = gulp.src(src).pipe(stream)
    spriteData.img.pipe(gulp.dest(paths.spriteImgDest))
    spriteData.css.pipe(gulp.dest(paths.spriteCSSDest))
  cb()

gulp.task 'browser-sync', () ->
  browserSync(
    server:
      baseDir: './public'
    startPath: '/'
  )

gulp.task 'watch', () ->
  gutil.log('start watching')
  gulp.watch paths.coffee, [ 'coffee' ]
  gulp.watch paths.stylus, [ 'stylus' ]
  gulp.watch paths.jade, [ 'jade' ]
  gulp.watch(paths.html)
    .on 'change', browserSync.reload


# commands
gulp.task 'default', [
  'browser-sync'
  'watch'
]
gulp.task 'deploy', [
  'jade-before-build'
  'jade'
  'coffee'
  'stylus'
]
