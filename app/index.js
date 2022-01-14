/* --- ライブラリ(?)の読み込み --- */
const electron      = require('electron');
const app           = electron.app;
const BrowserWindow = electron.BrowserWindow;


/* --- ウィンドウを開く --- */
let main_window = null;
app.on('ready', () => {
	/* main_windowを作成(windowの大きさや、Kioskモードにするかどうかなどもここで定義できる) */
	main_window = new BrowserWindow({width: 1280, height: 720});
	/* Electronに表示するhtmlを絶対パスで指定(相対パスだと動かない) */
	main_window.loadURL('file://' + __dirname + '/index.html');
	/* ChromiumのDevツールを開く */
	main_window.webContents.openDevTools();
	main_window.on('closed', function() {
		main_window = null;
	});
});