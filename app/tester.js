/* --- 広域変数 --- */
let switchbot_token = null;



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



/* --- メインエリア: ボタンの有効/無効切り替え --- */
const switchButtonDisabledGet = event => {
	document.getElementById('get-device').disabled = (event.currentTarget.value === '');
};
const switchButtonDisabledSet = event => {
	const is_set_device  = document.getElementById('devices-set').value !== '';
	const is_set_command = document.getElementById('commands'   ).value !== '';
	document.getElementById('set-device').disabled = !(is_set_device && is_set_command);
};
const switchButtonDisabledExecuteScene = event => {
	document.getElementById('execute-scene').disabled = (event.currentTarget.value === '');
};
document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('devices-get').addEventListener('change', switchButtonDisabledGet);
	document.getElementById('devices-set').addEventListener('change', switchButtonDisabledSet);
	document.getElementById('scenes').addEventListener('change', switchButtonDisabledExecuteScene);
});




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
		/* トークンを広域変数に保存 */
		switchbot_token = token;
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
		/* デバイス一覧を各ドロップダウンに追加 */
		const select_get = document.getElementById('devices-get');
		const select_set = document.getElementById('devices-set');
		[... select_get.querySelectorAll('option:not(.default-selection)')].forEach(option => option.remove());
		[... select_set.querySelectorAll('option:not(.default-selection)')].forEach(option => option.remove());
		select_get.querySelector('option.default-selection').selected = true;
		select_set.querySelector('option.default-selection').selected = true;
		response.data.body.deviceList.forEach(async device => {
			const supported_get = await window.switchbot.checkSupportedType(device.deviceType);
			const supported_set = await window.switchbot.getCommands(device.deviceType) !== null;
			if (supported_get) select_get.appendChild(createDeviceOption(device));
			if (supported_set) select_set.appendChild(createDeviceOption(device));
		});
		response.data.body.infraredRemoteList.forEach(device => {
			select_set.appendChild(createDeviceOption(device));
		});
		document.getElementById('get-device').disabled = true;
		document.getElementById('set-device').disabled = true;
	});
	/* URLバーを更新 */
	window.switchbot.getAPI('getDeviceList').then(url => updateInspectorURL(url));
};
const createDeviceOption = device => {
	const option     = document.createElement('option');
	option.innerText = device.deviceName;
	option.value     = device.deviceId;
	option.setAttribute('device-type', device.deviceType || device.remoteType);
	return option;
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



/* --- メインエリア: デバイス情報取得 --- */
const getDeviceInfo = event => {
	/* トークン存在確認 */
	if (!switchbot_token) return;
	/* ボタン有効チェック */
	const button = event.currentTarget;
	if (button.disabled) return;
	/* デバイスIDの取得とチェック */
	const device_id = document.getElementById('devices-get').value;
	if (device_id === '') return;
	/* ボタン無効化 */
	button.disabled = true;
	/* リクエストを送信 */
	window.switchbot.getDevice(device_id)
	.then(response => {
		/* 詳細エリアを更新 */
		updateInspectorDetails(response);
		/* 子をすべて消す */
		const tbody = document.getElementById('device-info');
		[... tbody.children].forEach(li => li.remove());
		/* 失敗なら帰る */
		button.disabled = false;
		if (!response.code) {
			const tr     = document.createElement('tr');
			const td     = document.createElement('td');
			td.innerText = response;
			td.setAttribute('colspan', '2');
			tr.appendChild(td);
			tbody.appendChild(tr);
			return;
		}
		/* 情報を追加 */
		Object.keys(response.data.body).forEach(key => {
			const tr           = document.createElement('tr');
			const td_key       = document.createElement('td');
			const td_value     = document.createElement('td');
			td_key.innerText   = key;
			td_value.innerText = response.data.body[key];
			tr.appendChild(td_key);
			tr.appendChild(td_value);
			tbody.appendChild(tr);
		});
	});
	/* URLバーを更新 */
	window.switchbot.getAPI('getDevice', device_id).then(url => updateInspectorURL(url));
};
document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('get-device').addEventListener('click', getDeviceInfo);
});



/* --- メインエリア: シーンの再取得 --- */
const getScenes = event => {
	/* トークン存在確認 */
	if (!switchbot_token) return;
	/* ボタン無効化 */
	const button = event.currentTarget;
	button.disabled = true;
	/* リクエストを送信 */
	window.switchbot.getScenes()
	.then(response => {
		/* 詳細エリアを更新 */
		updateInspectorDetails(response);
		button.disabled = false;
		/* 子をすべて消す */
		const select = document.getElementById('scenes');
		[... select.querySelectorAll('option:not(.default-selection)')].forEach(option => option.remove());
		/* 子を追加 */
		response.data.body.forEach(scene => {
			const option     = document.createElement('option');
			option.innerText = scene.sceneName;
			option.value     = scene.sceneId;
			select.appendChild(option);
		});
	});
	/* URLバーを更新 */
	window.switchbot.getAPI('getScenes').then(url => updateInspectorURL(url));
};
document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('get-scenes').addEventListener('click', getScenes);
});



/* --- メインエリア: シーンの実行 --- */
const executeScene = event => {
	/* トークン存在確認 */
	if (!switchbot_token) return;
	/* シーンIDの取得とチェック */
	const scene_id = document.getElementById('scenes').value;
	if (scene_id === '') return;
	/* ボタン無効化 */
	const button = event.currentTarget;
	button.disabled = true;
	/* リクエストを送信 */
	window.switchbot.executeScene(scene_id)
	.then(response => {
		/* 詳細エリアを更新 */
		updateInspectorDetails(response);
		button.disabled = false;
	});
	/* URLバーを更新 */
	window.switchbot.getAPI('executeScene', scene_id).then(url => updateInspectorURL(url));
};
document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('execute-scene').addEventListener('click', executeScene);
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
