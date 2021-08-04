var gulp = require("gulp");
var gutil = require("gulp-util");
var bower = require("bower");
var concat = require("gulp-concat");
var sass = require("gulp-sass");
var minifyCss = require("gulp-minify-css");
var rename = require("gulp-rename");
var sh = require("shelljs");
var uglify = require("gulp-uglify");
var minify = require("gulp-minify");

var iife = require("gulp-iife");

var paths = {
  sass: ["./scss/**/*.scss"],
  appJs: [
    "!./www/js/app.js",
    "!./www/js/realtime/fpm.realtime.module.js",
    "!./www/js/build/*.js",
    "./www/js/**/*.js"
  ],
  codeFilesPath: [
    "./www/js/estimates/*.js",
    "./www/js/shared-components/*.js",
    "./www/js/shared/*.js",
    "./www/js/work-orders/*.js",
    "./www/js/dashboard/*.js",
    "./www/js/home/*.js",
    "./www/js/message-hub/*.js",
    "./www/js/realtime.module/*.js",
  ]
};

gulp.task("default", ["sass", "scripts"]);

var scssFiles = ["./scss/ionic.app.scss", "./scss/message.hub.styles.scss", "./scss/app.styles.scss"]
gulp.task("sass", function (done) {
  gulp
    .src(scssFiles)
    .pipe(sass())
    .on("error", sass.logError)
    .pipe(gulp.dest("./www/css/"))
    .pipe(
      minifyCss({
        keepSpecialComments: 0
      })
    )
    .pipe(
      rename({
        extname: ".min.css"
      })
    )
    .pipe(gulp.dest("./www/css/"))
    .on("end", done);
});

gulp.task("scripts", function () {
  return gulp
    .src(paths.appJs)
    .pipe(iife())
    .pipe(concat("fpm-compiled.js"))
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(uglify())
    .on("error", function (err) {
      gutil.log(gutil.colors.red("[Error]"), err.toString());
    })
    .pipe(gulp.dest("./www/js/build"));
});

gulp.task("watch", function () {
  gulp.watch(paths.sass, ["sass"]);
  gulp.watch(paths.codeFilesPath, ["scripts"]);
});

gulp.task("install", ["git-check"], function () {
  return bower.commands.install().on("log", function (data) {
    gutil.log("bower", gutil.colors.cyan(data.id), data.message);
  });
});

// $.uglify().on('error', function (err) {
//   gutil.log(gutil.colors.red('[Error]'), err.toString());
//   this.emit('end');
// })

gulp.task("git-check", function (done) {
  if (!sh.which("git")) {
    console.log(
      "  " + gutil.colors.red("Git is not installed."),
      "\n  Git, the version control system, is required to download Ionic.",
      "\n  Download git here:",
      gutil.colors.cyan("http://git-scm.com/downloads") + ".",
      "\n  Once git is installed, run '" +
      gutil.colors.cyan("gulp install") +
      "' again."
    );
    process.exit(1);
  }
  done();
});
