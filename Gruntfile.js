// JSkeleton Application GruntFile
// -------------------------------

'use strict';

/* globals require, module */

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// If you want to recursively match all subfolders, use:
// 'test/spec/**/*.js'

module.exports = function(grunt) {

    // Init main modular gruntfile and return the tasks
    //require('grunt-jskeleton')(grunt);

    grunt.config.merge({
        // Include here your plugins configuration
    });

    
    // Custom tasks
    // grunt.registerTask('task-name', []);
    grunt.initConfig({
        uglify: {
            myTarget: {
                files: {
                    'dest/output.min.js': ['src/*.js']
                 }
             }
        }
    });

    grunt.registerTask('dist', ['uglify']);
};
