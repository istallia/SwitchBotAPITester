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
const URL_getDevice     = '/v1.0/devices/{device_id}/status';
const URL_setDevice     = '/v1.0/devices/{device_id}/commands';
const URL_getScenes     = '/v1.0/scenes';
const URL_executeScene  = '/v1.0/scenes/{scene_id}/execute';



/* --- 通信詳細オブジェクトを生成 --- */
const getAxiosDetails = response => {
	/* オブジェクトを生成 */
	const details = {};
	/* 返す */
	return details;
};



/* --- API: URLを取得 --- */
const getAPI = (event, name, device_id = null) => {
	switch (name) {
		case 'getDeviceList':
			return 'GET ' + URL_host + URL_getDeviceList;
		case 'getDevice':
			return 'GET ' + URL_host + URL_getDevice;
		case 'setDevice':
			return 'GET ' + URL_host + URL_setDevice;
		case 'getScenes':
			return 'GET ' + URL_host + URL_getScenes;
		case 'executeScene':
			return 'GET ' + URL_host + URL_executeScene;
	}
	return null;
};
ipcMain.handle('getAPI', getAPI);



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
		return {data: response.data, code: response.status, details: getAxiosDetails(response)};
	})
	.catch(error => {return {error:error}});
};
ipcMain.handle('getDeviceList', getDeviceList);
