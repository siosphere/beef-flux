const path = require('path')
const gulp = require('gulp')
const ts = require('gulp-typescript')
const merge = require('merge-stream')
const newer = require('gulp-newer')

const packages = [
    'beef-flux-example',
    'beef-flux-store'
]

const getBaseDir = (package) => {
    return path.resolve(__dirname, `packages/${package}`)
}

gulp.task('build', () => {
    packages.map((package) => {
        const baseDir = getBaseDir(package)
        const project = ts.createProject(`${baseDir}/tsconfig.json`)

        return project.src()
        .pipe(newer({
            dest: `${baseDir}/lib`,
            ext: '.js'
        }))
        .pipe(project())
        .pipe(gulp.dest(`${baseDir}/lib`))
    })
})

gulp.task('bundle_example', () => {
    
})