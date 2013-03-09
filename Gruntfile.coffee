module.exports = (grunt) ->
  pkg = grunt.file.readJSON('package.json')

  grunt.initConfig
    pkg: pkg

    watch:
      coffee:
        files: ['src/coffee/*']
        tasks: 'coffee'
      stylus:
        files: ['src/stylus/*']
        tasks: 'stylus'

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

    stylus:
      compile:
        files:
          'css/app.css': 'src/stylus/app.styl'

  # Dependencies
  for name of pkg.devDependencies when name.substring(0, 6) is 'grunt-'
    grunt.loadNpmTasks name
