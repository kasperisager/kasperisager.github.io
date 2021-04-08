const gulp = require("gulp");
const $ = require("gulp-load-plugins")();
const del = require("del");
const yml = require("require-yml");

gulp.task("css:clean", () => del(["dist/css"]));

gulp.task("css:build", () =>
  gulp
    .src("css/*.css")
    .pipe(
      $.postcss([
        require("postcss-import")(),
        require("postcss-url")(),
        require("postcss-cssnext")(),
      ])
    )
    .pipe($.cssnano())
    .pipe(gulp.dest("dist/css"))
    .pipe($.livereload())
    .pipe(
      $.size({
        title: "css",
        showFiles: true,
      })
    )
);

gulp.task("css", gulp.series("css:clean", "css:build"));

gulp.task("html:clean", () => del(["dist/**/*.html"]));

gulp.task("html:build", () =>
  gulp
    .src("html/**/*.html")
    .pipe($.data(() => yml("./data")))
    .pipe($.nunjucks.compile())
    .pipe(
      $.htmlmin({
        collapseWhitespace: true,
      })
    )
    .pipe(gulp.dest("dist"))
    .pipe($.livereload())
    .pipe(
      $.size({
        title: "html",
        showFiles: true,
      })
    )
);

gulp.task("html", gulp.series("html:clean", "html:build"));

gulp.task("build", gulp.series("css", "html"));

gulp.task("default", gulp.series("build"));

gulp.task("watch", () => {
  $.livereload.listen();

  gulp.watch("css/**/*.css", gulp.series("css"));
  gulp.watch("html/**/*.html", gulp.series("html"));
});

gulp.task("serve:web", () =>
  gulp.src("dist").pipe(
    $.webserver({
      open: true,
      livereload: true,
    })
  )
);

gulp.task("serve", gulp.series("build", gulp.parallel("watch", "serve:web")));

gulp.task("deploy:clean", () => del([".tmp"]));

gulp.task("deploy:push", () =>
  gulp
    .src("dist/**")
    .pipe(
      $.ghPages({
        branch: "master",
        cacheDir: ".tmp",
        force: true,
      })
    )
    .pipe(
      $.size({
        title: "deploy",
      })
    )
);

gulp.task("deploy", gulp.series("build", "deploy:clean", "deploy:push"));
