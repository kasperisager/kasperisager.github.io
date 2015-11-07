const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const del = require('del');
const gulpsmith = require('gulpsmith');
const _ = require('lodash');
const $$ = require('load-metalsmith-plugins')();

gulp.task('css', ['css:clean'], function () {
  return gulp.src('css/*.css')
    .pipe($.plumber())
    .pipe($.cssnext())
    .pipe($.minifyCss({
      keepSpecialComments: false
    }))
    .pipe(gulp.dest('dist/css'))
    .pipe($.livereload())
    .pipe($.size({
      title: 'css',
      showFiles: true
    }));
});

gulp.task('css:clean', function () {
  return del(['dist/css']);
});

gulp.task('html', ['html:clean', 'css'], function () {
  return gulp.src(['html/**/*.html', 'data/*.yaml'])
    .pipe($.plumber())
    .pipe($.frontMatter().on('data', function (file) {
      _.assign(file, file.frontMatter);
    }))
    .pipe(gulpsmith()
      .use($$.metadata({
        education: 'education.yaml',
        experience: 'experience.yaml',
        presentations: 'presentations.yaml'
      }))
      .use($$.permalinks(':title'))
      .use($$.layouts({
        engine: 'ejs',
        directory: 'tpl'
      }))
      .use($$.inPlace({
        engine: 'ejs'
      }))
    )
    .pipe($.minifyHtml())
    .pipe(gulp.dest('dist'))
    .pipe($.livereload())
    .pipe($.size({
      title: 'html',
      showFiles: true
    }));
});

gulp.task('html:clean', function () {
  return del(['dist/**/*.html']);
});

gulp.task('build', [
  'css',
  'html'
]);

gulp.task('default', ['build']);

gulp.task('watch', ['build'], function () {
  $.livereload.listen();

  gulp.watch('css/**/*.css', ['css']);
  gulp.watch('{html,tpl}/**/*.html', ['html']);
  gulp.watch('data/*.yaml', ['html']);
});

gulp.task('serve', ['watch'], function () {
  return gulp.src('dist')
    .pipe($.plumber())
    .pipe($.webserver({
      open: true,
      livereload: true
    }));
});

gulp.task('deploy', ['deploy:clean', 'build'], function () {
  return gulp.src('dist/**')
    .pipe($.plumber())
    .pipe($.ghPages({
      branch: 'master',
      cacheDir: '.tmp',
      force: true
    }))
    .pipe($.size({
      title: 'deploy'
    }));
});

gulp.task('deploy:clean', function () {
  return del(['.tmp']);
});
