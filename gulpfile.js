var gulp = require('gulp');

var concat = require('gulp-concat');

var uglify = require('gulp-uglify');

var files = [
    './src/beef.js',
    './src/api.js',
    './src/dispatcher.js',
    './src/store.js'
];

gulp.task('default', function(){
    gulp.src(files)
    .pipe(concat('beef.min.js'))
    .pipe(gulp.dest('./dist/'));
});