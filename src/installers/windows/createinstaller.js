const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller;
const path = require('path');

getInstallerConfig()
    .then(createWindowsInstaller)
    .catch((error) => {
        console.error(error.message || error);
        process.exit(1);
    });

function getInstallerConfig () {
    console.log('creating windows installer');

    const rootPath = path.resolve(__dirname, '../../../');
    const outPath = path.resolve(rootPath, 'build');

    return Promise.resolve({
        appDirectory: path.resolve(outPath, 'SpaceQL-win32-x64/'),
        authors: 'Shemi Perez',
        noMsi: true,
        outputDirectory: path.resolve(outPath, 'installers'),
        exe: 'SpaceQL.exe',
        setupExe: 'SpaceQLInstaller.exe',
        setupIcon: path.resolve(outPath, 'icons', 'icon.ico')
    })
}