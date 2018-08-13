import babel from 'gulp-babel';
import concat from 'gulp-concat';
import del from 'del';
import gulp from 'gulp';
import {src, series, parallel, watch, dest} from 'gulp';
import uglify from 'gulp-uglify';
import autoprefixer from 'gulp-autoprefixer';
import sass from 'gulp-sass';
import cleanCSS from 'gulp-clean-css';
import responsive from 'gulp-responsive';
import imagemin from 'gulp-imagemin';
import pngquant from 'imagemin-pngquant';

// import eslint from 'gulp-eslint';


const paths = {
  scripts: {
    src: 'src/js/*.js',
    dest: 'dist/min_js/'
  },
  templates: {
    src: 'src/*.html',
    dest: 'dist/'
  },
  sass: {
    src: 'src/sass/*.scss',
    dest: 'src/css/'
  },
  styles: {
    src: 'src/css/*.css',
    dest: 'dist/min_css/'
  },
  images: {
    src: 'src/img/*',
    dest: 'dist/img/'
  },
  data: {
    src: 'src/data/*',
    dest: 'dist/data/'
  },
  sw: {
    src: 'src/sw/*.js',
    dest: 'dist/'
  }
};

const clean = () => del(['dist']);

function scripts() {
  return src(paths.scripts.src, { sourcemaps: true })
    .pipe(babel()) // makes it old JS code
    .pipe(uglify()) //minifies js
    // .pipe(concat('index.min.js')) //joins files together
    .pipe(dest(paths.scripts.dest));
}

function copyIndexHTMLToDist() {
  return src(paths.templates.src, {sourcemaps: true})
  .pipe(dest(paths.templates.dest));
}

function copyDataDirToDist() {
  return src(paths.data.src, {sourcemaps: true})
  .pipe(dest(paths.data.dest));
}

function sW() {
  return src(paths.sw.src, {sourcemaps: true})
  .pipe(babel()) // makes it old JS code
  .pipe(uglify()) //minifies js
  .pipe(dest(paths.sw.dest));
}

//can add here like scripts a clean css to minify it and a concat
function styles() {
  return src(paths.styles.src, { sourcemaps: true })
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(dest(paths.styles.dest));
}

function sassToCSS() {
  return src(paths.sass.src, { sourcemaps: true })
    .pipe(sass().on('error', sass.logError))
    .pipe(dest(paths.sass.dest));
}




import browserSync from 'browser-sync';
const server = browserSync.create();

function reload(done) {
  server.reload();
  done();
}

function serve(done) {
  server.init({
    server: {
      baseDir: './dist'
    }
  });
  done();
}

function resizeImages() {
  return src(paths.images.src, { sourcemaps: true })
//   .pipe(responsive({
//         '*.*': [{
//           // image-small.jpg is 500 pixels wide
//           width: 500,
//           rename: {
//             suffix: '-small_1x',
//             extname: '.jpg',
//           },
//         }, {
//           // image-small@2x.jpg is 1000 pixels wide
//           width: 500 * 2,
//           rename: {
//             suffix: '-small_2x',
//             extname: '.jpg',
//           },
//         }, {
//           // image-medium.jpg is 480 pixels wide
//           width: 1000,
//           rename: {
//             suffix: '-medium_1x',
//             extname: '.jpg',
//           },
//         }, {
//           // image-large@2x.jpg is 960 pixels wide
//           width: 1000 * 2,
//           rename: {
//             suffix: '-medium_2x',
//             extname: '.jpg',
//           },
//         }, {
//           // image-extralarge.jpg is 1280 pixels wide
//           width: 800,
//           rename: {
//             suffix: '-large_1x',
//             extname: '.jpg',
//           },
//         }, {
//           // image-extralarge@2x.jpg is 2560 pixels wide
//           width: 800 * 2,
//           rename: {
//             suffix: '-large_2x',
//             extname: '.jpg',
//           },
//         }, {
//           // image-small.webp is 200 pixels wide
//           width: 500,
//           rename: {
//             suffix: '-small_1x',
//             extname: '.webp',
//           },
//         }, {
//           // image-small@2x.webp is 400 pixels wide
//           width: 500 * 2,
//           rename: {
//             suffix: '-small_2x',
//             extname: '.webp',
//           },
//         }, {
//           // image-large.webp is 480 pixels wide
//           width: 1000,
//           rename: {
//             suffix: '-medium_1x',
//             extname: '.webp',
//           },
//         }, {
//           // image-large@2x.webp is 960 pixels wide
//           width: 1000 * 2,
//           rename: {
//             suffix: '-medium_2x',
//             extname: '.webp',
//           },
//         }, {
//           // image-extralarge.webp is 1280 pixels wide
//           width: 800,
//           rename: {
//             suffix: '-large_1x',
//             extname: '.webp',
//           },
//         }, {
//           // image-extralarge@2x.webp is 2560 pixels wide
//           width: 800 * 2,
//           rename: {
//             suffix: '-large_2x',
//             extname: '.webp',
//           },
//         }],
//   }, {
//   // Global configuration for all images
//
//   withoutEnlargement: true,
//   // The output quality for JPEG, WebP and TIFF output formats
//   quality: 100,
//   // Use progressive (interlace) scan for JPEG and PNG output
//   progressive: true,
//   // Strip all metadata
//   withMetadata: false,
//   // Do not emit the error when image is enlarged.
//   skipOnEnlargement: false,
//   errorOnEnlargement: false,
// }))
.pipe(imagemin({
     progressive: true,
     use: [pngquant()]
 }))
.pipe(dest(paths.images.dest));
}

// function imageMinimize() {
//   return src src(paths.images.src, { sourcemaps: true })
//   .pipe(imagemin({
//        progressive: true,
//        use: [pngquant()]
//    }))
//    .pipe(gulp.dest('dist/imgs'));
// }


const watchScripts = () => watch(paths.scripts.src, gulp.series(scripts, reload));
const watchSW = () => watch(paths.sw.src, gulp.series(sW, reload));
const watchHTML = () => watch(paths.templates.src, gulp.series(copyIndexHTMLToDist, reload));
const watchStyles = () => watch(paths.sass.src, gulp.series(sassToCSS, styles, reload));

const dev = series(clean, copyIndexHTMLToDist, copyDataDirToDist, sW, scripts, sassToCSS, styles, resizeImages, serve);
const dev1 = parallel(watchScripts, watchStyles, watchHTML, watchSW);

const dev2 = series(dev, dev1);
export default dev2;
