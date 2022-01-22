/* --- ライブラリ(?)の読み込み --- */
const electron      = require('electron');
const contextBridge = electron.contextBridge;
const ipcRenderer   = electron.ipcRenderer;



/* --- 関数群を登録 --- */
contextBridge.exposeInMainWorld('switchbot', {
	getToken      : async () => await ipcRenderer.invoke('getToken'),
	getAPI        : async (name, device_id = null) => await ipcRenderer.invoke('getAPI', name, device_id),
	getDeviceList : async token => await ipcRenderer.invoke('getDeviceList', token)
});



/* --- デバッグ用の関数群 --- */
contextBridge.exposeInMainWorld('tester', {
	getCurrentPath : async () => await ipcRenderer.invoke('getCurrentPath')
});
