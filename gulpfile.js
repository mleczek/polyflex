var del = require('del');
var gulp = require('gulp');
var sass = require('gulp-sass');
var clean = require('gulp-clean-css');
var connect = require('gulp-connect-php');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');

gulp.task('clean', function () {
    return del(['dist']);
});

gulp.task('styles', function () {
    return gulp.src('polyflex.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(clean({ compatibility: 'ie9' }))
        .pipe(gulp.dest('docs/assets/external'))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', function () {
    // First clean project and then build all resources parallel, at the end start
    // watching for changes and run browsersync (proxy via the built-in PHP server).
    runSequence('clean', ['styles'], function () {
        var reloadAfterTasks = function(tasks) {
            if(!Array.isArray(tasks)) {
                tasks = [tasks];
            }

            tasks.push(function () {
                browserSync.reload();
            });

            return function() {
                if(tasks.length === 1) {
                    tasks[0]();
                } else {
                    runSequence.apply(this, tasks);
                }
            };
        };

        // Triggered watch will perform specified task(s) and reload the page
        // when the specified task ends successfully (achieved via reloadAfterTasks).
        gulp.watch(['docs/**/*'], reloadAfterTasks([]));
        gulp.watch(['src/**/*.scss'], reloadAfterTasks('styles'));

        // Run built-in PHP server on 127.0.0.1:8000,
        // after this operation init the browsersync instance.
        connect.server({
            base: 'docs/'
        }, function () {
            browserSync({
                proxy: '127.0.0.1:8000'
            });
        });
    });
});

gulp.task('default', function () {
    // First clean project and then build all resources parallel.
    runSequence('clean', ['styles']);
});
