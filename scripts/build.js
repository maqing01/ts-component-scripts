const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const cp = require('child_process');

const log = type => msg => {
    console.log(chalk[type](msg))
}
const info = log('green')
const warn = log('yellow')
const error = log('red')


// 获取项目tsconfig.json配置
function getConfig() {
    const configPath = path.resolve('tsconfig.json');
    try {
        const config = fs.readJsonSync(configPath).compilerOptions;
        return {
            rootDir: config.rootDir || 'src',
            outDir: config.outDir || 'dist'
        }
    } catch (err) {
        error(err.toString())
    }
}

// // 获取项目源码目录下所有文件
function getFiles(dirPath) {
    dirPath = path.resolve(dirPath)
    fs.readdir(dirPath).then((data) => {
        data.forEach(filename => {
            const filePath = path.join(dirPath, filename)
            const stat = fs.statSync(filePath);
            if (stat.isFile() && !/\.tsx?$/.test(filename)) {
                copyFile(filePath, config.rootDir, config.outDir)
            } else if (stat.isDirectory()) {
                warn('Warning: 组件src目录下存在多层级文件夹目录，说明此时组件拆分不为最细粒度，解耦不彻底，建议重新设计开发！')
                getFiles(filePath)
            }
        })
    }).catch(err => {
        error(err.toString())
    })
}

// 将非 .tsx 或 .ts 文件按照当前目录结构复制到目标目录
function copyFile(filePath, rootDir, outDir) {
    info('Copy: ' + filePath)
    fs.copySync(filePath, filePath.replace(rootDir, outDir))
}

const config = getConfig()

const tsc = cp.execFile(path.resolve('node_modules/.bin/tsc'))
tsc.on('close', () => {
    info('Compile: Success!')
    getFiles(config.rootDir)
})
tsc.on('error', (err) => { error(err.toString()) })


