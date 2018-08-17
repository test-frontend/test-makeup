'use strict';

const gulp           = require( 'gulp' );
const gulpif         = require( 'gulp-if' );
const config         = require( './gulp.config.json' );
const del            = require( 'del' );
const sass           = require( 'gulp-sass' );
const sasslint       = require( 'gulp-sass-lint' );
const concatcss      = require( 'gulp-concat-css' );
const uglifycss      = require( 'gulp-uglifycss' );
const postcss        = require( 'gulp-postcss' );
const postcssUrl     = require( 'postcss-url' );
const autoprefixer   = require( 'autoprefixer' );
const pug            = require( 'gulp-pug' );
const browserSync    = require( 'browser-sync' ).create();
const gulpSequence   = require( 'gulp-sequence' );
const imagemin       = require( 'gulp-imagemin' );

gulp.task('clean', () => {
  return del(['./dest/**/*']);
});

gulp.task('images', () => {
  return gulp.src(config.images.src)
              .pipe(imagemin())
              .pipe(gulp.dest(config.images.build))
              .pipe(browserSync.stream());
});

gulp.task('styles', () => {
  return gulp.src(config.styles.src)
              .pipe(sasslint(config.styles.lint.rules))
              .pipe(sasslint.format())
              .pipe(sasslint.failOnError())
              .pipe(sass())
              .pipe(postcss([
                autoprefixer(config.styles.autoprefixer),
                postcssUrl({
                  url: 'inline',
                  maxSize: 1024
                })
              ]))
              .pipe(gulpif(config.production, uglifycss()))
              .pipe(concatcss('application.css'))
              .pipe(gulp.dest(config.styles.build))
              .pipe(browserSync.stream());
});

gulp.task('templates', () => {
  return gulp.src(config.templates.src)
              .pipe(pug({
                pretty: "\t"
              }))
              .pipe(gulp.dest(config.templates.build))
              .pipe(browserSync.stream());
});

gulp.task('browser-sync', () => {
  browserSync.init({
    server: './dest'
  });
});

gulp.task('watcher', ['default', 'browser-sync'], () => {
  gulp.watch('./src/styles/**/*.{sass,scss}', ['styles']).on('change', browserSync.reload);
  gulp.watch('./src/templates/**/*.pug', ['templates']).on('change', browserSync.reload);
});

gulp.task('build', gulpSequence.apply(gulpSequence, ['clean'].concat('images')
                                                             .concat('styles')
                                                             .concat('templates')
));

gulp.task('default', ['build']);
