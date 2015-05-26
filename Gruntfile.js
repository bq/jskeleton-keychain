// JSkeleton Application GruntFile
// -------------------------------

'use strict';

/* globals require, module, grunt */

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// If you want to recursively match all subfolders, use:
// 'test/spec/**/*.js'

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
      uglify: {
        my_target: {
          files: {
            'dist/keychain.min.js': ['src/keychain.js']
          }
        }
      }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Internal tasks
    grunt.registerTask('build', 'Internal use only', [
        'uglify'
    ]);
};
