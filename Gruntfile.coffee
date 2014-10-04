process.setMaxListeners(0);

module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"

    clean:
      options:
        force: true
      lib: [
        "lib/"
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
      dist:
        src: ['lib/model.js']
        dest: 'lib/model.browserify.js'
        options:
          external: ['lodash']

      standalone:
        src: ['lib/model.js']
        dest: 'lib/model.standalone.js'
        options:
          external: ['lodash']
          transform: ['browserify-shim']
          require: ['lodash']
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
          "lib/model.min.js": ["lib/model.js"]
          "lib/model.standalone.min.js": ["lib/model.standalone.js"]


  grunt.registerTask "default", [ "build" ]
  grunt.registerTask "build", [ "clean", "coffee", "browserify", "uglify" ]

  require('load-grunt-tasks')(grunt);
