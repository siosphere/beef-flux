var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var tsc = require('gulp-typescript');

var tsProject = tsc.createProject('tsconfig.json');

var files = [
    './src/*.ts',
    './src/**/*.ts',
    '!./src/**/__tests__/**'
];

gulp.task('compile', function() {
    return tsProject.src()
    .pipe(tsProject())
    tsResult.js.pipe(gulp.dest('./build/'))
    tsResult.dts.pipe(gulp.dest('./dist/typings/'))
})

gulp.task('default', ['compile'], function(){
});