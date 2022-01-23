/* --- ライブラリ(?)の読み込み --- */
const electron      = require('electron');
const contextBridge = electron.contextBridge;
const ipcRenderer   = electron.ipcRenderer;



/* --- 関数群を登録 --- */
contextBridge.exposeInMainWorld('switchbot', {
	getToken           : async () => await ipcRenderer.invoke('getToken'),
	getAPI             : async (name, device_id = null) => await ipcRenderer.invoke('getAPI', name, device_id),
	checkSupportedType : async type => await ipcRenderer.invoke('checkSupportedType', type),
	getCommands        : async type => await ipcRenderer.invoke('getCommands', type),
	getDeviceList      : async token => await ipcRenderer.invoke('getDeviceList', token),
	getDevice          : async device_id => await ipcRenderer.invoke('getDevice', device_id)
});



/* --- デバッグ用の関数群 --- */
contextBridge.exposeInMainWorld('tester', {
	getCurrentPath : async () => await ipcRenderer.invoke('getCurrentPath')
});
