function getData() {
	let player_time = document.getElementsByClassName("PlayerBarDesktop_root__d2Hwi ")[0].querySelector("input")
	let artist = document.getElementsByClassName("PlayerBarDesktop_description__eQ_tA")[0].querySelectorAll("div > a > span")
	let track_name = document.getElementsByClassName("PlayerBarDesktop_description__eQ_tA")[0].querySelectorAll("a[data-test-id='TRACK_TITLE']")[0].parentNode.querySelectorAll("span")
	let track_img = document.getElementsByClassName("PlayerBarDesktop_cover__IYLwR")[0].src
	let track_link = parseLink(document.getElementsByClassName("PlayerBarDesktop_description__eQ_tA")[0].querySelector("a").href.replace("music-application://desktop", ""))
	if (artist.length > 2) {
		let tmp = ""
		for (let index = 1; index < artist.length; index++) {
			if (index === artist.length - 1) {
				tmp = tmp + artist[index].textContent
			} else {
				tmp = tmp + artist[index].textContent + ", "
			}
		}
		artist = tmp
	} else {
		artist = artist[1].textContent
	}
	let tmp = ""
	for (let name of track_name) {
		if (name.className === "") break
		tmp = tmp + name.textContent
	}
	track_name = tmp
	return {"artist": artist, "track_name": track_name, "track_img": track_img, "track_link": track_link, "current_time": player_time.value * 1000, "track_lenght": player_time.max * 1000 , "enabled": JSON.parse(localStorage.getItem("discordRPC").toLowerCase())}
}

function parseLink(href) {

	const urlObj = new URL("https://music.yandex.ru" + href);

	const params = new URLSearchParams(urlObj.search);

	const albumId = params.get('albumId');
	const trackId = params.get('trackId');

	if (albumId && trackId) {
		return `https://music.yandex.ru/album/${albumId}/track/${trackId}`;
	} else {
		return "https://music.yandex.ru"
	}
}