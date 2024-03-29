const { series, parallel, src, dest } = require("gulp");

const gulp = require("gulp"),
  svgmin = require("gulp-svgmin"),
  svgstore = require("gulp-svgstore"),
  inject = require("gulp-inject"),
  less = require("gulp-less"),
  autoprefixer = require("gulp-autoprefixer"),
  browserSync = require("browser-sync").create(),
  rename = require("gulp-rename"),
  concat = require("gulp-concat");

gulp.task("svgstore", function () {
  const svgs = gulp
    .src("./src/assets/icons/**/*.svg")
    .pipe(
      svgmin(function () {
        return {
          plugins: [
            {
              removeTitle: true,
            },
            {
              removeStyleElement: true,
            },
          ],
        };
      })
    )
    .pipe(rename({ prefix: "icon-" }))
    .pipe(svgstore({ inlineSvg: true }));

  function fileContents(filePath, file) {
    return file.contents.toString();
  }

  return gulp
    .src("./src/index.html")
    .pipe(inject(svgs, { transform: fileContents }))
    .pipe(gulp.dest("./src"));
});

gulp.task('scripts', function() {
    return gulp.src('./src/assets/scripts/*.js') // путь к папке со скриптами
     .pipe(concat('main.js')) // в какой файл объединить
     .pipe(gulp.dest('./dist'));
  });

gulp.task("fonts", function() {
    return src('./src/assets/fonts/*')
      .pipe(dest('dist/fonts'))
  })

gulp.task("less", function () {
  return src("./src/assets/styles/main.less")
    .pipe(less())
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(dest("./dist"));
});

gulp.task("html", function () {
  return gulp.src("./src/index.html").pipe(gulp.dest("./dist"));
});

gulp.task("serve", function () {
  browserSync.init({
    server: {
      baseDir: "dist",
    },
  });

  gulp.watch("./src/assets/styles/**/*.less").on("change", series("less"));
  gulp.watch("./src/index.html").on("change", series("html"));

  gulp.watch("./dist/style.css").on("change", browserSync.reload);
  gulp.watch("./dist/index.html").on("change", browserSync.reload);
});

gulp.task("build", series("fonts", "svgstore", "scripts", "less", "html"));

gulp.task("default", series("svgstore", "fonts", parallel("html", "less", "scripts"), "serve"));
