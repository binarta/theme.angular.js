var gulp = require('gulp'),
    minifyHtml = require('gulp-minify-html'),
    template = require('gulp-template'),
    templateCache = require('gulp-angular-templatecache')
    path = require('path');

var minifyHtmlOpts = {
    empty: true,
    cdata: true,
    conditionals: true,
    spare: true,
    quotes: true
};

gulp.task('templates-bootstrap3', function () {
    gulp.src('src/components/**/bin-*.html')
        .pipe(minifyHtml(minifyHtmlOpts))
        .pipe(templateCache('theme-tpls-bootstrap3.js', {standalone: true, module: 'bin.theme.templates', transformUrl: function (url) {
            var split = url.split(path.sep);
            return split[split.length - 1];
        }}))
        .pipe(gulp.dest('src'));
});

gulp.task('default', ['templates-bootstrap3']);