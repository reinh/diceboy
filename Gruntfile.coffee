module.exports = (grunt) ->
  pkg = grunt.file.readJSON('package.json')

  grunt.initConfig
    pkg: pkg

    watch:
      coffee:
        files: ['src/coffee/*']
        tasks: 'coffee'

    coffee:
      compile:
        files: [
          expand: true
          dest: 'js/'
          cwd: 'src/coffee'
          src: '**/*.coffee'
          ext: '.js'
        ]

    coffeelint:
      source: 'src/coffee/**/*.coffee'
      grunt: 'Gruntfile.coffee'

  # Dependencies
  for name of pkg.devDependencies when name.substring(0, 6) is 'grunt-'
    grunt.loadNpmTasks name
