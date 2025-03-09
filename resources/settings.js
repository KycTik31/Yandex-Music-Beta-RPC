localStorage.getItem("discordRPC") ? null : localStorage.setItem("discordRPC", true)
let isFound = false;
window.navigation.onnavigate = (event) => {
	if (event.destination.url.endsWith("settings")) isFound = false;
	const observer = new MutationObserver((mutations, obs) => {
		const settingsElement = document.querySelector('[data-test-id="SETTINGS_LIST"]');
		if (settingsElement && !isFound) {
			console.log("Элемент найден:", settingsElement);
			isFound = true;
			obs.disconnect();
			const copyElement = document.querySelector('[data-test-id="SETTINGS_LIST"]').querySelector('li').cloneNode(true);
			const description = copyElement.children[0].children[0].children;
			description[0].textContent = "Статус в Discord";
			description[1].textContent = "Отображать статус прослушивания";
			const button = copyElement.querySelector("button");
			button.classList.remove("iJVAJMgccD4vj4E4o068", "nHWc2sto1C6Gm0Dpw_l0", "rWukOKAJh5Ga7JuIp62L", "_eTRQi5ADZCUvUKMZqJU");
			button.querySelector("div").classList.remove("KC8t9NStVmQ1_VY54KH4");
			if (JSON.parse(localStorage.getItem("discordRPC").toLowerCase())) {
				button.classList.add("rWukOKAJh5Ga7JuIp62L", "_eTRQi5ADZCUvUKMZqJU");
				button.querySelector("div").classList.add("KC8t9NStVmQ1_VY54KH4");
			} else {
				button.classList.add("iJVAJMgccD4vj4E4o068", "nHWc2sto1C6Gm0Dpw_l0");
			}
			button.addEventListener('click', changeRPCStatus);
			document.querySelector('[data-test-id="SETTINGS_LIST"]').querySelector('li').parentNode.prepend(copyElement);
	}
	});

	observer.observe(document, {
		childList: true,
		subtree: true
	  });
};

function changeRPCStatus(event) {
	JSON.parse(localStorage.getItem("discordRPC").toLowerCase()) ? localStorage.setItem("discordRPC", false) : localStorage.setItem("discordRPC", true);
	const button = event.currentTarget;
	button.classList.remove("iJVAJMgccD4vj4E4o068", "nHWc2sto1C6Gm0Dpw_l0", "rWukOKAJh5Ga7JuIp62L", "_eTRQi5ADZCUvUKMZqJU");
	button.querySelector("div").classList.remove("KC8t9NStVmQ1_VY54KH4");
	if (JSON.parse(localStorage.getItem("discordRPC").toLowerCase())) {
		button.classList.add("rWukOKAJh5Ga7JuIp62L", "_eTRQi5ADZCUvUKMZqJU");
		button.querySelector("div").classList.add("KC8t9NStVmQ1_VY54KH4");
	} else {
		button.classList.add("iJVAJMgccD4vj4E4o068", "nHWc2sto1C6Gm0Dpw_l0");
	}
}