'use strict';

const path = require('path');
const fs = require('fs-extra');
const url = require('url');
const chalk = require('chalk');

const log = type => msg => {
    console.log(chalk[type](msg))
}
const error = log('red')

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const envPublicUrl = process.env.PUBLIC_URL;

function ensureSlash(path, needsSlash) {
    const hasSlash = path.endsWith('/');
    if (hasSlash && !needsSlash) {
        return path.substr(path, path.length - 1);
    } else if (!hasSlash && needsSlash) {
        return `${path}/`;
    } else {
        return path;
    }
}

const getPublicUrl = appPackageJson =>
envPublicUrl || require(appPackageJson).homepage;

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// Webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
function getServedPath(appPackageJson) {
    const publicUrl = getPublicUrl(appPackageJson);
    const servedUrl = envPublicUrl || 
        (publicUrl ? url.parse(publicUrl).pathname : '/');
    return ensureSlash(servedUrl, true);
}

//add flexible
const flexibleStr = (function () {
    return fs.readFileSync('node_modules/lm-flexible/build/changeRem-min.js', 'utf-8');
})();

function getConfig() {
    const configPath = path.resolve('tsconfig.json');
    try {
        const config = fs.readJsonSync(configPath).compilerOptions;
        return {
            rootDir: config.rootDir || 'src',
            outDir: config.outDir || 'dist'
        }
    } catch (err) {
        console.error(err.toString())
    }
}
// config after eject: we're in ./config/
module.exports = {
    dotenv: resolveApp('.env'),
    appBuild: resolveApp(getConfig().outDir),
    appPublic: resolveApp('demo'),
    appTsConfig: resolveApp('tsconfig.json'),
    appHtml: resolveApp('demo/index.html'),
    appIndexJs: resolveApp('demo/index.js'),
    appPackageJson: resolveApp('package.json'),
    appSrc: resolveApp('demo'),
    componentIndexJs: resolveApp('./src'),
    yarnLockFile: resolveApp('yarn.lock'),
    testsSetup: resolveApp('demo/setupTests.js'),
    appNodeModules: resolveApp('node_modules'),
    publicUrl: getPublicUrl(resolveApp('package.json')),
    // servedPath: getServedPath(resolveApp('package.json')),
    servedPath: './',

    flexibleStr: flexibleStr
};
