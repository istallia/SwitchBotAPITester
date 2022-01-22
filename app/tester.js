/* --- メインエリアの切り替え --- */
const switchMainArea = event => {
	/* ハッシュがなければ解散 */
	const url = new URL(event.newURL);
	if (url.hash.length < 1) url.hash = '#section-token';
	/* 現在の要素を非表示 */
	document.querySelector('.main.selected'   ).classList.remove('selected');
	document.querySelector('.content.selected').classList.remove('selected');
	/* 次の要素を表示 */
	const id   = url.hash.slice(1);
	const area = document.getElementById(id);
	if (area) {
		area.classList.add('selected');
		document.querySelector(`.content > a[href="#${id}"]`).parentNode.classList.add('selected');
	}
};
window.addEventListener('hashchange', switchMainArea);



/* --- メインエリア: 保存しておいたトークンの取得 --- */
const readToken = () => {
	window.switchbot.getToken()
	.then(token => {
		if (token) document.getElementById('token').value = token;
	});
};
document.addEventListener('DOMContentLoaded', readToken);



/* --- メインエリア: トークンの登録とデバイス一覧の取得 --- */
const getDeviceList = event => {
	/* ボタン状態とトークンの有効性を確認 */
	const token  = document.getElementById('token').value;
	const button = document.querySelector('.input-token > button');
	if (token.length < 64 || button.disabled) return;
	/* ボタンを無効化 */
	button.disabled = true;
	/* リクエストを送信 */
	window.switchbot.getDeviceList(token)
	.then(response => {
		/* 詳細エリアを更新 */
		updateInspectorDetails(response);
		/* 子をすべて消す */
		const ul = document.getElementById('device-list');
		[... ul.children].forEach(li => li.remove());
		/* 失敗なら帰る */
		button.disabled = false;
		if (!response.code) {
			const li     = document.createElement('li');
			li.innerText = response;
			ul.appendChild(li);
			return;
		}
		/* 取得したデバイスを一覧に追加する */
		response.data.body.deviceList.forEach(device => {
			const li     = document.createElement('li');
			const text   = `${device.deviceType} "${device.deviceName}" (${device.deviceId})`;
			li.innerText = text;
			ul.appendChild(li);
		});
		response.data.body.infraredRemoteList.forEach(device => {
			const li     = document.createElement('li');
			const text   = `[IR] ${device.remoteType} "${device.deviceName}" (${device.deviceId})`;
			li.innerText = text;
			ul.appendChild(li);
		});
	});
	/* URLバーを更新 */
	window.switchbot.getAPI('getDeviceList').then(url => updateInspectorURL(url));
};
document.addEventListener('DOMContentLoaded', () => {
	document.querySelector('.input-token > button').addEventListener('click', getDeviceList);
	document.getElementById('token').addEventListener('keydown', event => {
		if (event.key === 'Enter') {
			event.preventDefault();
			getDeviceList(event);
		}
	});
});



/* --- インスペクターエリアの出し入れ --- */
const toggleInspectorArea = () => {
	document.querySelector('.inspector').classList.toggle('opened');
};
document.addEventListener('DOMContentLoaded', () => {
	document.querySelector('.inspector-opener').addEventListener('click', toggleInspectorArea);
});



/* --- URLのコピー --- */
const copyURL = () => {
	const url = document.getElementById('url-bar').innerText.replace(/^[A-Z]+\s+/, '');
	navigator.clipboard.writeText(url);
};
document.addEventListener('DOMContentLoaded', () => {
	document.querySelector('.url-copier').addEventListener('click', copyURL);
});



/* --- インスペクターエリアを更新する(URL) --- */
const updateInspectorURL = url => {
	document.getElementById('url-bar').innerText = url;
};



/* --- インスペクターエリアを更新する(詳細) --- */
const updateInspectorDetails = details => {
	/* 要素取得 */
	const request_headers_area  = document.getElementById('request-body');
	const response_headers_area = document.getElementById('response-body');
	/* 無なら帰る */
	if (!details.data) {
		request_headers_area.value  = '';
		response_headers_area.value = '';
		return;
	}
	/* それぞれ更新 */
	request_headers_area.value  = JSON.stringify(details.request, null, 4);
	response_headers_area.value = JSON.stringify(details.data, null, 4);
};



/* --- デバッグ用: F5を使う --- */
document.addEventListener('keydown', event => {
	if (event.key === 'F5' ) location.reload();
});
