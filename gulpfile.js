var gulp = require('gulp');
var shell = require('gulp-shell');
var watch = require('gulp-watch');


gulp.task('default', ['watch', 'express']);

gulp.task('express', shell.task([
    'supervisor ./bin/www'
]));

gulp.task('watch', function() {
    var path = 'routes/*.js';
    gulp.src(path)
        .pipe(watch(path, {}))
});
