var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var ts = require('gulp-typescript');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var rename = require("gulp-rename");

var files = [
    './src/*.ts',
    './src/**/*.ts',
    '!./src/**/__tests__/**'
];

gulp.task('compile', function() {
    var tsResult = gulp.src(files)
    .pipe(ts({
        declarationFiles: true,
        experimentalDecorators: true,
        target: 'ES5'
    }))

    tsResult.js.pipe(gulp.dest('./build/'))
    tsResult.dts.pipe(gulp.dest('./dist/typings/'))
})

gulp.task('default', ['compile'], function(){
    
    var bundle = browserify('./build/core/beef.js', { standalone: 'beef' })
    .bundle()
    .pipe(source('beef.js'))
    .pipe(gulp.dest('./dist/'))
    ;
});

gulp.task('minify', ['default'], function(){
    return gulp.src([
        './dist/beef.js'
    ])
    .pipe(rename('beef.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/'));
});


/**
 * EXAMPLES
 */

var bower = function(path)
{
    return './bower_components/' + path;
};

var Examples = {
};

gulp.task('examples', ['minify', 'examples.todo']);

// Todo React Example
Examples.todo = {
    files: [
        bower('moment/min/moment.min.js'),
        bower('react/react.js'),
        bower('react/react-dom.js'),
        './dist/beef.min.js',
        './examples/todo/src/*.ts',
    ],
    compiled: 'todo.js',
    dest: './examples/todo/dist/'
};

gulp.task('examples.todo', function() {
    gulp.src(Examples.todo.files)
    .pipe(ts({
        sortOutput: true,
        declarationFiles: false,
        rootDir: './build/',
        experimentalDecorators: true,
        target: 'ES5'
    }))
    .pipe(gulp.dest('./build/examples/todo/'))
    ;

    return browserify('./build/examples/todo/app.js', {
        paths: ['./node_modules', './dist/'],
        ignoreMissing: true
    })
    .bundle()
    .pipe(source('todo-app.js'))
    .pipe(gulp.dest(Examples.todo.dest))
    ;
});