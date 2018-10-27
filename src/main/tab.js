import electron from 'electron';
import App from './App/App';

const init = () => {
    const app = App.instance(electron.remote.app, electron.ipcRenderer);
};

init();