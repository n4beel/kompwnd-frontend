setTimeout(() => {
	let balEl = document.querySelector(".card.card.card-light-gray.yellow.mb-3.ml-1 div h3");
	let balance = balEl.innerHTML;
	
	let stakeInput = document.getElementById("stakingField");
	let stakeBtn = document.querySelector(".btn.btn-pink.btn-lg.w-100");

	let checkForStake = () => {
		return document.querySelector(".mb-4.mb-3.card.card-light-gray.pink p span") == null;
	}

	let type = (text) => {
        // for(let key of text) {
        //     console.log('Type: ', key);
        //     let press = new KeyboardEvent('keypress', {key: key});
        //     window.dispatchEvent(press);
        // }
        // const text = 'pasted text';
        const dataTransfer = new DataTransfer();
        dataTransfer.setData('text', text);
        const event = new ClipboardEvent('paste', {
            clipboardData: text,
            bubbles: true,
        });
        console.log(event);
        stakeInput.dispatchEvent(event);
    }

	let canStake = checkForStake();
	console.log(canStake, balance);

	if(window.checkInt) clearInterval(window.checkInt);

	window.checkInt = setInterval(() => {
		balance = balEl.innerHTML;
		// stakeInput.value = parseFloat(balance);
        stakeInput.focus();
        stakeInput.select();
        type(balance);

		if(checkForStake()) {
			console.log('CAN STAKE');
		} else {
			console.log('CANT STAKE');
		}
		console.log(balance);
	}, 15000);
}, 0);