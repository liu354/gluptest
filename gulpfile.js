const gulp = require('gulp');
const hash = require('gulp-hash');
const del = require('del');
const InjectResources = require('./utils/InjectResources');
gulp.task('default', ['clean', 'dist']);
basePath = './src'
gulp.task('clean', cb => {
    del('./dist/*');
})
gulp.task('dist', () => {
    return gulp.src(basePath + '/index.html')
        .pipe(InjectResources(
            gulp.src([basePath + '/**/*.css', basePath + '/**/*.js'])))
        .pipe(hash())
        .pipe(gulp.dest('./dist'))
})