const   del = require('del'),
        gulp = require('gulp'),
        connect = require('gulp-connect'),
        rename = require('gulp-rename'),
        htmlmin = require('gulp-htmlmin'),
        uglify = require('gulp-uglify-es').default,
        minifyCSS = require('gulp-csso'),
        pump = require('pump'),
        concat = require('gulp-concat');

// run simple web server with gulp
gulp.task('webserver', () => {
    connect.server({
        port: 8000,
        root: 'dist',
        liveroad: true
    });
});

// prepare html files
gulp.task('html', () => {
    gulp.src('./app/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest('./dist/'));
});

// prepare js files
gulp.task('js', (cb) => {
    pump([
        gulp.src(['./app/js/*.js']),
        uglify(),
        gulp.dest('./dist/js/'),
    ], cb);
});

// service worker
gulp.task('sw', (cb) => {
    pump([
        gulp.src('./app/sw.js'),
        uglify(),
        gulp.dest('./dist/')
    ], cb);
});

// json files
gulp.task('json', () => {
    gulp.src('./app/*.json')
        .pipe(gulp.dest('./dist/'));
})

// prepare css files
gulp.task('css', () => {
    gulp.src('./app/css/*.css')
        .pipe(minifyCSS())
        .pipe(gulp.dest('./dist/css/'));
});

// prepare webfonts
gulp.task('webfonts', () => {
    gulp.src('./app/webfonts/*.*')
        .pipe(gulp.dest('./dist/webfonts/'));
})

// prepare images
gulp.task('images', () => {
    gulp.src('./app/img/*.*')
        .pipe(gulp.dest('./dist/img/'));
});
// Clean output directory
gulp.task('clean', () => del(['./dist']));

gulp.task('setup', ['html', 'js', 'sw', 'json', 'css', 'webfonts', 'images'])
gulp.task('serve', ['webserver']);
gulp.task('default', ['setup', 'serve']);