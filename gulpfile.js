const path = require('path')
const gulp = require('gulp')
const ts = require('gulp-typescript')
const merge = require('merge-stream')
const newer = require('gulp-newer')

const packages = [
    'beef-flux-api',
    'beef-flux-example',
    'beef-flux-store'
]

const buildPackage = (package) => {
    const baseDir = getBaseDir(package)
    const project = ts.createProject(`${baseDir}/tsconfig.json`)

    return project.src()
    /*.pipe(newer({
        dest: `${baseDir}/lib`,
        ext: '.js'
    }))*/
    .pipe(project())
    .pipe(gulp.dest(`${baseDir}/lib`))
}

const getBaseDir = (package) => {
    return path.resolve(__dirname, `packages/${package}`)
}

gulp.task('build', () => {
    return packages.map(buildPackage)
})

packages.forEach((name) => {
    gulp.task(name, () => {
        return buildPackage(name)
    })
})

gulp.task('bundle_example', () => {
    
})