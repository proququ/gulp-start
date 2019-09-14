"use strict"

// Инициализация плагинов
const {src, dest} = require("gulp");
const gulp = require("gulp");
const sass = require("gulp-sass");
const pug = require("gulp-pug");
const autoprefixer = require("gulp-autoprefixer");
const cssbeautify = require("gulp-cssbeautify");
const cleancss = require("gulp-clean-css");
const concat = require("gulp-concat");
const imagemin = require("gulp-imagemin");
const imageminCompress = require("imagemin-jpeg-recompress");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const rigger = require("gulp-rigger");
const del = require("del");
const browsersync = require("browser-sync").create();

// Пути к файлам
var path = {
  build: {
    html: "dist/",
    css: "dist/assets/css/",
    js: "dist/assets/js/",
    images: "dist/assets/images/",
    fonts: "dist/assets/fonts/"
  },
  src: {
    html: "src/*.pug",
    css: "src/assets/sass/style.sass",
    js: "src/assets/js/*.js",
    images: "src/assets/images/**/*.{jpg, png, svg, ico. webp, gif}",
    fonts: "src/assets/fonts/*.{woff, woff2}"
  },
  watch: {
    html: "src/**/*.pug",
    css: "src/assets/sass/**/*.sass",
    js: "src/assets/js/**/*.js",
    images: "src/assets/images/**/*.{jpg, png, svg, ico. webp, gif}",
    fonts: "src/assets/fonts/*.{woff, woff2}"
  },
  clean: "./dist"
}

// Внешние стили
var outerStylePath = [
  './node_modules/normalize.css/normalize.css'
];

// Внешние скрипты
var outerJsPath = [
  './node_modules/jquery/dist/jquery.min.js'
];

// Локальный сервер
function browserSync() {
  browsersync.init({
    server: {
      baseDir: "./dist/"
    },
    port: 3000
  })
}

function browserSyncReload(done) {
  browsersync.reload();
}

// Обработка html файлов
function html() {
  return src(path.src.html, {base: "src/"})
    .pipe(plumber())
    .pipe(pug({
      pretty: true
    })) 
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}

// Обработка css стилей
function css() {
  return src(path.src.css, {base: "src/assets/sass/"})
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      Browserslist: ['last 15 version', '> 1%', 'ie 9', 'ie 10'],
      cascade: true
    }))
    .pipe(cssbeautify())
    .pipe(dest(path.build.css))
    .pipe(cleancss({
      level: 2
    }))
    .pipe(rename({
      suffix: ".min",
      extname: ".css"
    }))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
}

// Обработка внешних css библиотек
function outerCss() {
  return src(outerStylePath)
    .pipe(plumber())
    .pipe(concat('outerStyle.css'))
    .pipe(dest(path.build.css))
    .pipe(cleancss({
      level: 2
    }))
    .pipe(rename({
      suffix: ".min",
      extname: ".css"
    }))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
}

// Обработка js файлов
function js() {
  return src(path.src.js, {base: "src/assets/js/"})
    .pipe(plumber())
    .pipe(rigger())
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(rename({
      suffix: ".min",
      extname: ".js"
    }))
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
}

// Обработка внушних js библиотек
function outerJs() {
  return src(outerJsPath)
    .pipe(plumber())
    .pipe(concat('outerJs.js'))
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(rename({
      suffix: ".min",
      extname: ".js"
    }))
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
}

// Оптимизация изображений
function images() {
  return src(path.src.images, {base: "src/assets/img/"})
    .pipe(imagemin([
      imageminCompress({
        loops: 4,
        min: 70,
        max: 80,
        quality: 'high'
      }),
      imagemin.gifsicle(),
      imagemin.optipng(),
      imagemin.svgo()
    ]))
    .pipe(dest(path.build.images));
}

// Обработка шрифтов
function fonts() {
  return src(path.src.fonts, {base: "src/assets/fonts/"})
    .pipe(dest(path.build.fonts));
}

// Очистка папки dist
function clean() {
  return del(path.clean);
}

// Отслеживание изменений
function watchFiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  // gulp.watch([path.watch.outerCss], outerCss);
  gulp.watch([path.watch.js], js);
  // gulp.watch([path.watch.outerJs], outerJs);
  gulp.watch([path.watch.images], images);
  gulp.watch([path.watch.fonts], fonts);
};

const build = gulp.series(clean, gulp.parallel(html, css, outerCss, js, outerJs, images, fonts));
const watch = gulp.parallel(build, watchFiles, browserSync);

// Экспорт тасков
exports.html = html;
exports.css = css;
exports.outerCss = outerCss;
exports.js = js;
exports.outerJs = outerJs;
exports.images = images;
exports.fonts = fonts;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;