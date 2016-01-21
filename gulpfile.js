var gulp = require('gulp');

var concat = require('gulp-concat');

var uglify = require('gulp-uglify');

var ts = require('gulp-typescript');

var files = [
    './src/beef.js',
    './src/api.js',
    './src/dispatcher.js',
    './src/store.js',
    './src/router.js'
];

var toCompile = [
    './src/Beef/resources/package.ts',
    './src/test.ts'
];

gulp.task('default', function(){
    gulp.src(files)
    .pipe(concat('beef.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('minify', function(){
    gulp.src(files)
    .pipe(concat('beef.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('compile', function() {
    gulp.src(toCompile)
    .pipe(ts({
        sortOutput: true,
        declarationFiles: true,
        out: "beef.js"
    }))
    .pipe(gulp.dest('./dist/'))
    ;
});