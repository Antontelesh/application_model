process.setMaxListeners(0);

module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"

    clean:
      options:
        force: true
      lib: [
        "lib/"
        "dist/"
      ]

    coffee:
      compile:
        expand: true
        cwd: "src"
        src: "**/*.coffee"
        dest: "lib"
        rename: (dest, src) ->
          "#{dest}/#{src.replace(/\.coffee$/, '.js')}"

    browserify:
      standalone:
        src: ['lib/model.js']
        dest: 'dist/model.standalone.js'
        options:
          external: ['lodash']
          transform: ['browserify-shim']
          require: ['lodash']
          browserifyOptions:
            standalone: 'ApplicationModel'

      angular:
        src: ['lib/model.angular.js']
        dest: 'dist/model.angular.js'
        options:
          external: ['lodash', 'angular']
          transform: ['browserify-shim']
          browserifyOptions:
            standalone: 'ApplicationModel'

    uglify:
      options:
        report: "min"
        compress: true
        mangle:
          except: 'lodash'
      all:
        files:
          "dist/model.standalone.min.js": ["dist/model.standalone.js"]
          "dist/model.angular.min.js": ["dist/model.angular.js"]


  grunt.registerTask "default", [ "build" ]
  grunt.registerTask "build", [ "clean", "coffee", "browserify", "uglify" ]

  require('load-grunt-tasks')(grunt);
