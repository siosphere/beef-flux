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
];

gulp.task('compile', function() {
    var tsResult = gulp.src(files)
    .pipe(ts({
        sortOutput: true,
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
    /*.pipe(concat('beef.js'))
    .pipe(gulp.dest('./dist/'))
    ;*/
});

gulp.task('minify', ['default'], function(){
    gulp.src([
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
    js: {},
    typescript: {}
};

gulp.task('examples', ['minify', 'examples.typescript.todo']);

// Todo React Example
Examples.js.typescript = {
    files: [
        bower('moment/min/moment.min.js'),
        bower('react/react.js'),
        bower('react/react-dom.js'),
        './dist/beef.min.js',
        './examples/typescript/todo/src/*.ts',
    ],
    compiled: 'todo.js',
    dest: './examples/typescript/todo/dist/'
};

gulp.task('examples.typescript.todo', function() {
    gulp.src(Examples.js.typescript.files)
    .pipe(ts({
        sortOutput: true,
        declarationFiles: false,
        rootDir: './build/',
        experimentalDecorators: true,
        target: 'ES5'
    }))
    .pipe(gulp.dest('./build/examples/typescript/todo/'))
    ;

    var bundle = browserify('./build/examples/typescript/todo/app.js', {
        paths: ['./node_modules', './dist/'],
        ignoreMissing: true
    })
    .bundle()
    .pipe(source('todo-app.js'))
    .pipe(gulp.dest(Examples.js.typescript.dest))
    ;
});