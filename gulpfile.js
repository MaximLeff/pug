/* eslint-disable camelcase */
/* eslint-disable no-tabs */
// Названия папок
const project_folder = 'dist';
const source_folder = 'src';

// Пути к файлам и папкам
const path = {
    build: {
        html: project_folder + '/',
        css: project_folder + '/css/',
        cssLibs: project_folder + '/css/libs',
        js: project_folder + '/js/',
        jsLibs: project_folder + '/js/libs',
        img: project_folder + '/img/',
        fonts: project_folder + '/fonts/',
    },
    src: {
        html: [source_folder + '/html/*.html', '!' + source_folder + '/_*.html'],
        pug: [source_folder + '/pug/*.pug', '!' + source_folder + '/_*.pug'],
        css: source_folder + '/scss/main.scss',
        js: source_folder + '/js/main.js',
        img: source_folder + '/img/**/*.{jpg,JPG,png,PNG,svg,webp}',
        fonts: source_folder + '/fonts/*.ttf',
    },
    watch: {
        html: source_folder + '/html/**/*.html',
        pug: source_folder + '/pug/**/*.pug',
        css: source_folder + '/scss/**/*.scss',
        js: source_folder + '/js/**/*.js',
        img: source_folder + '/img/**/*.{jpg,JPG,png,PNG,svg,webp}',
    },
    clean: './' + project_folder + '/',
    clean: ['dist/css/', 'dist/js/', 'dist/fonts/'],
};

const { src, dest } = require('gulp');
const gulp = require('gulp');
const browsersync = require('browser-sync').create();
const fileinclude = require('gulp-file-include');
const del = require('del');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const group_media = require('gulp-group-css-media-queries');
const clean_css = require('gulp-clean-css');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
// const webphtml = require('gulp-webp-html');
const sourcemaps = require('gulp-sourcemaps');
const newer = require('gulp-newer');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const pug = require('gulp-pug');
const htmlbeautify = require('gulp-html-beautify');

// Обновление браузера после сохранения изменений
function browserSync() {
    browsersync.init({
        server: {
            baseDir: `./${project_folder}/`,
        },
        // online: true,
        open: false, // Автоматически открывать браузер
        // browser: "google chrome", // запуск браузера по умолчанию
        notify: true, // Уведомления при обновлении браузера
        scrollProportionally: true, // Синхронная прокрутка
        // scrollThrottle: 100,
    });
}

// Обработка HTML
function html() {
    return src(path.src.html)
        .pipe(fileinclude())
    // .pipe(webphtml())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream());
}

// Обработка PUG
function pugFiles() {
    return src(path.src.pug)
        .pipe(
            pug({
                pretty: true,
            }),
        )
        .pipe(
            htmlbeautify({
                indent_size: 4,
                indent_char: ' ',
                eol: '\n',
                indent_level: 0,
                indent_with_tabs: false,
                preserve_newlines: true,
                max_preserve_newlines: 10,
                jslint_happy: false,
                space_after_anon_function: false,
                brace_style: 'collapse',
                keep_array_indentation: false,
                keep_function_indentation: false,
                space_before_conditional: true,
                break_chained_methods: false,
                eval_code: false,
                unescape_strings: false,
                wrap_line_length: 0,
                wrap_attributes: 'auto',
                wrap_attributes_indent_size: 4,
                end_with_newline: false,
            }),
        )
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream());
}

// Обработка JS
function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
    // .pipe(
    // 	uglify()
    // )
    // .pipe(
    // 	rename({
    // 		extname: ".min.js"
    // 	})
    // )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream());
}

// Перемещение библиотек JS
function jsLibsMove() {
    return src('src/js/libs/**/*')
        .pipe(dest(path.build.jsLibs));
}

// Обработка CSS
function css() {
    return src(path.src.css)
        .pipe(sourcemaps.init())

        .pipe(
            sass({
                outputStyle: 'expanded',
                // expanded - полностью развёрнутый CSS;
                // nested - показывает вложенность (по умолчанию);
                // compact - каждый селектор на новой строке;
                // compressed - всё в одну строку.
            }),
        )
    // .pipe(group_media())
        .pipe(
            autoprefixer({
                overrideBrowserslist: ['last 4 versions'],
                cascade: true,
            }),
        )
        .pipe(dest(path.build.css))
    // .pipe(clean_css())
    // .pipe(
    // 	rename({
    // 		extname: ".min.css"
    // 	})
    // )
        .pipe(sourcemaps.write('.'))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream());
}

function cssLibsMove() {
    return src('src/scss/libs/**/*')
        .pipe(dest(path.build.cssLibs));
}

// Обработка изображений
function images() {
    return src(path.src.img)
        .pipe(newer('dist/img/'))
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{ removeViewBox: false }],
                interlaced: true,
                optimizationLevel: 1, // 0 to 7
            }),
        )
        .pipe(webp())
        .pipe(dest(path.build.img));
}

// Конвертация шрифтов
function fonts() {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts));
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts));
}

// Слушать файлы
function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.pug], pugFiles);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}

// Чистка папки dist
function clean() {
    return del(path.clean);
}

function ready() {
    // eslint-disable-next-line no-console
    console.warn('READY TO WORK');
}

const build = gulp.series(clean, gulp.parallel(
    js,
    css,
    html,
    pugFiles,
    images,
    fonts,
    cssLibsMove,
    jsLibsMove,
), ready);

const watch = gulp.parallel(build, watchFiles, browserSync);

exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.jsMove = jsLibsMove;
exports.css = css;
exports.cssMove = cssLibsMove;
exports.html = html;
exports.pugFiles = pug;
exports.build = build;
exports.watch = watch;
exports.default = watch;
exports.ready = ready;
