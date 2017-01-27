var gulp = require('gulp')
var tsc = require('gulp-typescript')

var tsProject = tsc.createProject('tsconfig.json');

gulp.task('compile', function() {
    return tsProject.src()
    .pipe(tsProject())
    .pipe(gulp.dest('build'))
})

gulp.task('default', ['compile'], function() {
})