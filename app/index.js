/* --- ライブラリ(?)の読み込み --- */
const fs            = require('fs');
const path          = require('path');
const axios         = require('axios');
const electron      = require('electron');
const app           = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain       = electron.ipcMain;



/* --- ウィンドウを開く --- */
let main_window = null;
app.on('ready', () => {
	/* コンフィグを読み込む */
	readConfig();
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
 * ### コンフィグの読み書き
 */


/* --- コンフィグの雛形 --- */
const config_name = './config.json';
let config = {
	token : null
};



/* --- コンフィグの書き出し --- */
const writeConfig = () => {
	const data = JSON.stringify(config, null, 2);
	fs.promises.writeFile(config_name, data);
};



/* --- コンフィグの読み出し --- */
const readConfig = () => {
	if (!fs.existsSync(config_name)) return;
	fs.promises.readFile(config_name, {encoding: 'utf8'})
	.then(json => config = JSON.parse(json));
};


/*
 * ### ここからIPC通信
 */


/* --- URLを定義 --- */
const URL_host          = 'https://api.switch-bot.com';
const URL_getDeviceList = '/v1.0/devices';



/* --- API: トークンを取得 --- */
const getToken = event => config.token;
ipcMain.handle('getToken', getToken);



/* --- API: デバイス一覧を取得 --- */
const getDeviceList = (event, token) => {
	const url = URL_host + URL_getDeviceList;
	return axios.get(url, {
		headers : {
			'Authorization' : token,
			'Content-Type'  : 'application/json; charset=utf8'
		}
	})
	.then(response => {
		config.token = token;
		writeConfig();
		return {data: response.data, code: response.status};
	})
	.catch(error => error);
};
ipcMain.handle('getDeviceList', getDeviceList);
