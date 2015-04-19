"use strict"

var gulp = require("gulp")
  , $ = require("gulp-load-plugins")()
  , del = require("del")

gulp.task("css", ["css:clean"], function () {
  return gulp.src("css/*.css")
    .pipe($.plumber())
    .pipe($.myth({
      sourcemap: true
    }))
    .pipe($.sourcemaps.init({
      loadMaps: true
    }))
    .pipe($.concat("site.css"))
    .pipe($.minifyCss({
      keepSpecialComments: false
    }))
    .pipe($.sourcemaps.write("./", {
      sourceRoot: "/css"
    }))
    .pipe(gulp.dest("dist"))
    .pipe($.livereload())
    .pipe($.size({
      title: "css"
    , showFiles: true
    }))
})

gulp.task("css:clean", function (done) {
  del(["dist/site.css"], done)
})

gulp.task("img", ["img:clean"], function () {
  return gulp.src("img/*")
    .pipe($.plumber())
    .pipe($.imagemin())
    .pipe(gulp.dest("dist/img"))
    .pipe($.size({
      title: "img"
    , showFiles: true
    }))
})

gulp.task("img:clean", function (done) {
  del(["dist/img"], done)
})

gulp.task("html", ["html:clean", "css"], function () {
  var gulpsmith = require("gulpsmith")
    , _ = require("lodash")
    , $$ = require("load-metalsmith-plugins")()

  return gulp.src("html/*.html")
    .pipe($.plumber())
    .pipe($.frontMatter().on("data", function (file) {
      _.assign(file, file.frontMatter)
    }))
    .pipe(gulpsmith()
      .use($$.permalinks(":title"))
      .use($$.layouts({
        engine: "ejs"
      , directory: "html/tpl"
      }))
      .use($$.inPlace({
        engine: "ejs"
      }))
    )
    .pipe($.minifyHtml())
    .pipe(gulp.dest("dist"))
    .pipe($.livereload())
    .pipe($.size({
      title: "html"
    , showFiles: true
    }))
})

gulp.task("html:clean", function (done) {
  del(["dist/**/*.html"], done)
})

gulp.task("build", [
  "css"
, "img"
, "html"
])

gulp.task("default", ["build"])

gulp.task("watch", ["build"], function () {
  $.livereload.listen()

  gulp.watch("css/**/*.css", ["css"])
  gulp.watch("img/*", ["img"])
  gulp.watch("html/**/*.html", ["html"])
})

gulp.task("serve", ["watch"], function () {
  return gulp.src("dist")
    .pipe($.plumber())
    .pipe($.webserver({
      open: true
    , livereload: true
    }))
})

gulp.task("deploy", ["deploy:clean", "build"], function () {
  return gulp.src("dist/**")
    .pipe($.plumber())
    .pipe($.ghPages({
      branch: "master"
    , cacheDir: ".tmp"
    , force: true
    }))
    .pipe($.size({
      title: "deploy"
    }))
})

gulp.task("deploy:clean", function (done) {
  del([".tmp"], done)
})
