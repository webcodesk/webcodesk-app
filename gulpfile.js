const gulp = require('gulp');
const jsObfuscator = require('gulp-javascript-obfuscator');

gulp.task('build', function () {
  return gulp.src(
    [
      './src/electron/**/*.js',
      '!./src/electron/**/__tests__',
      '!./src/electron/**/__tests__/**/*',
    ]
  )
    .pipe(jsObfuscator({
      compact: true,
      sourceMap: false
    }))
    .pipe(gulp.dest('./build'));
});
