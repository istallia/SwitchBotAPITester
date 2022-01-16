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



/* --- デバッグ用: F5を使う --- */
document.addEventListener('keydown', event => {
	if (event.key === 'F5' ) location.reload();
});
