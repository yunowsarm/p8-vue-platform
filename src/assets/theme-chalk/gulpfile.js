"use strict";

const { series, src, dest } = require("gulp");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const cssmin = require("gulp-cssmin");

function compile() {
  return src("./src/*.scss")
    .pipe(sass.sync())
    .pipe(
      autoprefixer({
        overrideBrowserslist: [
          "Android 4.1",
          "iOS 7.1",
          "Chrome > 31",
          "ff > 31",
          "ie >= 8",
          "last 10 versions", // 所有主流浏览器最近10版本用
        ],
        cascade: false,
      })
    )
    .pipe(dest("./lib"));
}

function copyfont() {
  return src("./src/fonts/**").pipe(cssmin()).pipe(dest("./lib/fonts"));
}
function copybpm() {
  return src("./src/bpmn-js/**").pipe(cssmin()).pipe(dest("./lib/bpmn-js"));
}
function copybpmpanel() {
  return src("./src/bpmn-js-properties-panel/**")
    .pipe(cssmin())
    .pipe(dest("./lib/bpmn-js-properties-panel"));
}
exports.build = series(compile, copyfont, copybpm, copybpmpanel);
