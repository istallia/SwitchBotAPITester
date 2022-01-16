/* --- ライブラリ(?)の読み込み --- */
const electron      = require('electron');
const contextBridge = electron.contextBridge;
const ipcRenderer   = electron.ipcRenderer;



/* --- 関数群を登録 --- */
contextBridge.exposeInMainWorld('switchbot', {
	getDeviceList : async token => await ipcRenderer.invoke('getDeviceList', token)
});
