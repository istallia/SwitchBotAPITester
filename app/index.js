/* --- ライブラリ(?)の読み込み --- */
const electron      = require('electron');
const app           = electron.app;
const BrowserWindow = electron.BrowserWindow;


/* --- ウィンドウを開く --- */
let main_window = null;
app.on('ready', () => {
	/* ウィンドウを開く */
	main_window = new BrowserWindow({width: 1280, height: 720, minWidth: 512, minHeight: 408});
	main_window.loadURL('file://' + __dirname + '/index.html');
	main_window.setMenu(null);
	/* ChromiumのDevツールを開く */
	main_window.webContents.openDevTools();
	main_window.on('closed', () => {
		main_window = null;
	});
});