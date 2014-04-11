module.exports = (grunt) ->
  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-coffeelint')
  grunt.loadNpmTasks('grunt-contrib-compass')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-contrib-rename')
  grunt.loadNpmTasks('grunt-contrib-watch')

  grunt.initConfig(
    pkg: grunt.file.readJSON('package.json')
    coffee:
      main:
        options:
          bare: true
        expand: true
        flatten: true
        cwd: '_coffee/'
        src: [ '*.coffee' ]
        dest: 'app/js/'
        ext: '.js'
    coffeelint:
      # DOC: https://github.com/vojtajina/grunt-coffeelint
      # DOC: http://www.coffeelint.org/
      main:
        files:
          src: [ '_coffee/*.coffee' ]
        options:
          'no_trailing_whitespace':
            'level': 'error'
    compass:
      options:
        httpPath: '/' # You have to reconfigure this option
        sassDir: '_scss'
        cssDir: 'app/css'
        imagesDir: 'app/img'
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
    copy:
      main:
        files: [
          {
            expand: true
            cwd: 'bower_components/jquery/dist/'
            src: [ 'jquery.min.js' ]
            dest: 'app/js/'
          }
          {
            expand: true
            cwd: 'bower_components/jquery-1.11.0/'
            src: [ 'index.js' ]
            dest: 'app/js/'
          }
          {
            expand: true
            cwd: 'bower_components/underscore/'
            src: [ 'underscore.js' ]
            dest: 'app/js/'
          }
          {
            expand: true
            cwd: 'bower_components/backbone/'
            src: [ 'backbone.js' ]
            dest: 'app/js/'
          }
        ]
    rename:
      main:
        files: [
          {
            src: [ 'app/js/index.js' ]
            dest: 'app/js/jquery-1.11.0.min.js'
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
      js:
        files: [ 'app/js/*' ]
        tasks: [ 'jshint' ]
  )

  grunt.registerTask('default', [ 'coffee', 'compass:dev', 'watch' ])
  grunt.registerTask('deploy', [ 'copy', 'rename', 'coffee', 'compass:pro' ])
