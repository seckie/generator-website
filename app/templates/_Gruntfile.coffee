module.exports = (grunt) ->
  # require it at the top and pass in the grunt instance
  #require('time-grunt')(grunt)

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-coffeelint'
  grunt.loadNpmTasks 'grunt-contrib-compass'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-rename'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-jshint'

  grunt.initConfig(
    pkg: grunt.file.readJSON('package.json')
    coffee:
      main:
        options:
          bare: true
        files:
          'public_html/js/script.js': [
            # join
            'coffee/script.coffee'
          ]
    coffeelint:
      # DOC: https://github.com/vojtajina/grunt-coffeelint
      # DOC: http://www.coffeelint.org/
      main:
        files:
          src: [ '_coffee/*.coffee' ]
        options:
          'no_trailing_whitespace':
            'level': 'error'
    jshint:
      main:
        options:
          jshintrc: true
        src: [ 'public_html/js/script.js' ]
    compass:
      options:
        httpPath: '/' # You have to reconfigure this option
        sassDir: '_scss'
        cssDir: 'public_html/css'
        imagesDir: 'public_html/img'
        relativeAssets: true
      dev:
        options:
          environment: 'development'
          outputStyle: 'compact'
          noLineComments: true
          assetCacheBuster: false
      pro:
        options:
          environment: 'production'
          outputStyle: 'compact'
          noLineComments: true
          assetCacheBuster: false
    concat:
      libs:
        src: [
          'bower_components/underscore/underscore.js'
          'bower_components/backbone/backbone.js'
        ]
        dest: 'tmp/libs.min.js'
    uglify:
      options:
        mangle: false
        preserveComments: 'some'
      libs:
        files: [
          {
            expand: true
            cwd: 'tmp/'
            src: [ '*.js' ]
            dest: 'public_html/js/'
          }
        ]
    copy:
      main:
        files: [
          {
            expand: true
            cwd: 'bower_components/jquery/dist/'
            src: [ 'jquery.min.js' ]
            dest: 'public_html/js/'
          }
          {
            expand: true
            cwd: 'bower_components/jquery-1.11.0/'
            src: [ 'index.js' ]
            dest: 'public_html/js/'
          }
          {
            expand: true
            cwd: 'bower_components/underscore/'
            src: [ 'underscore.js' ]
            dest: 'public_html/js/'
          }
          {
            expand: true
            cwd: 'bower_components/backbone/'
            src: [ 'backbone.js' ]
            dest: 'public_html/js/'
          }
        ]
    rename:
      main:
        files: [
          {
            src: [ 'public_html/js/index.js' ]
            dest: 'public_html/js/jquery-1.11.0.min.js'
          }
        ]
    watch:
      coffee:
        files: [ '_coffee/*.coffee' ]
        tasks: [ 'coffee' ]
      coffeelint:
        files: [ '_coffee/*.coffee' ]
        tasks: [ 'coffeelint' ]
      scss:
        files: [ '_scss/*.scss' ]
        tasks: [ 'compass:dev' ]
      html:
        options:
          livereload: true
        files: [ 'public_html/**/*.html' ]
      css:
        options:
          livereload: true
        files: [ 'public_html/css/*' ]
      js:
        options:
          livereload: true
        files: [ 'public_html/js/*' ]
        tasks: [ 'jshint' ]
  )

  grunt.registerTask('default', [ 'coffee', 'compass:dev', 'watch' ])
  grunt.registerTask 'deploy', [ 'concat', 'uglify', 'copy', 'rename', 'coffee', 'compass:pro' ]
