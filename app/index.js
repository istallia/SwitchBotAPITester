/* --- ライブラリ(?)の読み込み --- */
const path          = require('path');
const axios         = require('axios');
const electron      = require('electron');
const app           = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain       = electron.ipcMain;



/* --- ウィンドウを開く --- */
let main_window = null;
app.on('ready', () => {
	/* ウィンドウを開く */
	main_window = new BrowserWindow({
		width     : 1280,
		height    : 720,
		minWidth  : 512,
		minHeight : 408,
		webPreferences : {
			preload : path.join(__dirname, 'preload.js')
		}
	});
	main_window.loadURL('file:///'+path.join(__dirname, 'index.html'));
	main_window.setMenu(null);
	/* ChromiumのDevツールを開く */
	main_window.webContents.openDevTools();
	main_window.on('closed', () => {
		main_window = null;
	});
});


/*
 * ### ここからIPC通信
 */


/* --- URLを定義 --- */
const URL_host          = 'https://api.switch-bot.com';
const URL_getDeviceList = '/v1.0/devices';



/* --- API: デバイス一覧を取得 --- */
const getDeviceList = (event, token) => {
	const url = URL_host + URL_getDeviceList;
	return axios.get(url, {
		headers : {
			'Authorization' : token,
			'Content-Type'  : 'application/json; charset=utf8'
		}
	}).then(response => {return {data: response.data, code: response.status}});
};
ipcMain.handle('getDeviceList', getDeviceList);
