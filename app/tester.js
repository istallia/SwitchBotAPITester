/* --- インスペクターエリアの出し入れ --- */
document.addEventListener('DOMContentLoaded', () => {
	document.querySelector('.inspector-opener').addEventListener('click', event => document.querySelector('.inspector').classList.toggle('opened'));
});



/* --- デバッグ用: F5を使う --- */
document.addEventListener('keydown', event => {
	if (event.key === 'F5' ) location.reload();
});
