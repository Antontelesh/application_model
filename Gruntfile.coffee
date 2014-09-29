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
        options:
            sourceMap: true
        expand: true
        cwd: "src"
        src: "**/*.coffee"
        dest: "lib"
        rename: (dest, src) ->
          "#{dest}/#{src.replace(/\.coffee$/, '.js')}"

    watch:
      options:
        spawn: false
        livereload: true
      coffee:
        files: "src/**/*.coffee"
        tasks: ["coffee:compile"]

    uglify:
      options:
        report: "min"
        compress: true
        mangle: false
      all:
        files:
          "lib/application_model.min.js": ["lib/model.js"]


  grunt.registerTask "default", [ "compile", "watch" ]
  grunt.registerTask "compile", [ "clean", "coffee" ]
  grunt.registerTask "build", [ "compile", "uglify" ]

  require('load-grunt-tasks')(grunt);
