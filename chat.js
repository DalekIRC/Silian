var nickname = generateRandomString();
var display_nick = "";
var email = "";
var output;
var channelName = "#support";
var server = "wss://irc.valware.uk";
var button = document.getElementById('connect-button');
var chkbox = document.getElementById('flexCheckChecked');
var input = document.getElementById('chatbox-input');
input.addEventListener('keydown', function (event) {
	if (event.key === 'Enter') {
		send();
	}
});

var sasl = {
	"account": null,
	"password": null
}

function doSasl() {
	if (!sasl.account || !sasl.password) {
		console.log("Unable to SASL: Invalid credentials");
	}
	doSend("AUTHENTICATE PLAIN");
	//doSend("AUTHENTICATE "+btoa(sasl.account+"\0"+sasl.account+"\0"+sasl.password)+"\n");
}


function init() {
	output = document.getElementById("chat-output");
	writeToScreen("\n");
}

function escapeHtml(text) {
	var map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};

	return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}

function connectWebSocket() {
	websocket = new WebSocket(server);
	websocket.onopen = function (evt) { onOpen(evt) };
	websocket.onclose = function (evt) { onClose(evt) };
	websocket.onmessage = function (evt) { onMessage(evt) };
	websocket.onerror = function (evt) { onError(evt) };
}

function onOpen(evt) {
	doSend("user user * * :" + email);
	doSend("nick " + nickname);
	doSend("cap req :message-tags echo-message standard-replies draft/chathistory server-time");
	doSend("cap end");
}



function send() {
	var input = document.getElementById("chatbox-input");
	input.focus();
	var text = input.value;
	var parv = text.split(" ");
	if (text[0] == "/") {
		if (parv[0] == "/me") {
			parv[0] = null;
			text = parv.join(" ");
			doSend("@+draft/display-name=" + display_nick + ' privmsg ' + channelName + ' :\u0001ACTION' + text + '\u0001')
			input.value = "";
			return;
		}
		else {
			doSend(text.substring(1));
			console.log(text.substring(1));
		}
	}
	else doSend("@+draft/display-name=" + display_nick + " privmsg " + channelName + " :" + text);
	input.value = "";
}


function onClose(evt) {
	doMiddleBubbble(`
			<div class="card left-the-chat bg-light">You have left the chat</div>`
	);
	setTimeout(function () {
		document.getElementById('chat-overlay').style.zIndex = 9999;
		output.innerHTML = "";
		button.innerHTML = "Confirm and Chat";
		button.classList.remove('disabled-button');

	}, 1000);
}

function onMessage(evt) {
	rawData = evt.data;
	if (rawData instanceof Blob) {
		var fileReader = new FileReader();
		fileReader.addEventListener("loadend", handleBinaryInput);
		fileReader.readAsText(rawData);
	}
	else {
		process(rawData);
	}
}

function handleBinaryInput(event) {
	var fileReader = event.target;
	var raw = fileReader.result;
	process(raw);
}

function process(rawData) {

	if (rawData.indexOf("PING") == 0) {
		pongResponse = rawData.replace("PING", "PONG");
		//writeToScreen('<span style="color: brown;">SENDING: ' + escapeHtml(pongResponse)+'<\/span>');		
		websocket.send(pongResponse);
	}
	else if (rawData.indexOf("001") > -1) {
		document.getElementById('chat-overlay').style.zIndex = 0;
		doSend("join " + channelName); // join a room upon connection.
		doSend("chathistory latest " + channelName + " * 200");
	}
	commandHandler(rawData);
	console.log(rawData);
}

function onError(evt) {
	writeToScreen('<span style="color: red;">ERROR:<\/span> ' + evt.data);
	console.log(evt);
}

function doSend(message) {
	mtags = {};
	console.log("SEND -> " + message);
	if (websocket)
		websocket.send(message + "\n");
}

function writeToScreen(message) {
	var pre = document.createElement("p");
	pre.style.wordWrap = "break-word";
	pre.innerHTML = message;
	output.appendChild(pre);
	output.scrollTop = output.scrollHeight;
}

function send() {
	var input = document.getElementById("chatbox-input");
	var text = input.value;
	doSend("@+draft/display-name=" + display_nick + " privmsg " + channelName + " :" + text);
	input.value = "";
}

window.addEventListener("load", init, false);

const chatbox = document.getElementById('chatbox-1');
const orb = document.getElementById('chat-orb');
orb.style.zIndex = 99999;

orb.addEventListener("click", e => {
	if (chatbox.hidden) {
		chatbox.removeAttribute('hidden');
		document.getElementById('chatbox-input').focus();
	}
	else {
		chatbox.setAttribute('hidden', 'true');
	}
});


function check_n_connect() {
	var nick = document.getElementById('user_name');
	var uemail = document.getElementById('user_email');

	button.innerHTML = '<i id="my-icon" class="fas fa-spin fa-spinner"></i>';
	button.classList.add("disabled-button");
	display_nick = nick.value.replace(/\s/g, "\\s");
	email = uemail.value;
	if (do_full_form_check()) {
		connectWebSocket();
	}
	else {
		button.innerHTML = "Confirm and Chat";
		button.classList.remove('disabled-button');
	}
}
function do_full_form_check() {
	if (nickname.length == 0) {
		var nick = document.getElementById('user_name');
		nick.classList.add('wobble');
		return false;
	}
	if (email.length == 0) {
		var uemail = document.getElementById('user_email');
		uemail.classList.add('wobble');
		return false;
	}
	if (!chkbox.checked) {
		chkbox.classList.add('wobble');
		return false;
	}
	return true;
}

function commandHandler(string) {
	console.log("STRING" + string);
	let mtags = {};
	let from = {};
	let cmd = "";
	let target = {};
	let parv = [];

	// for debugging urhurhurhur.
	console.log("RECV: " + string);

	// sort through mtags
	if (string.substring(0, 1) == "@") {
		const mtok = string.substring(1).split(' ');
		const tags = mtok[0].split(';');
		let key, value;
		tags.forEach(tag => {
			if (tag.includes('=')) {
				let keypairs = tag.split('=');
				key = keypairs[0];
				value = keypairs[1];
			} else {
				key = tag;
				value = true;
			}
			mtags[key] = value;
		});
		string = string.split(' ').slice(1).join(' ');
	}

	if (string[0] !== ':')
		string = ":null " + string;

	const bigparv = string.substring(1).split(' ');
	cmd = bigparv[1];
	const tok = (string.substring(1).includes(" :")) ? string.substring(1).split(" :") : [bigparv];
	parv = tok[1] ? tok[1].split(' ') : null;
	if (bigparv[0] && bigparv[0].includes("!")) {
		let ntok = bigparv[0].split("!");
		from.name = ntok[0];
		let itok = ntok[1].split("@");
		from.ident = itok[0];
		from.host = itok[1];
	} else if (bigparv) {
		from.name = bigparv[0];
		from.ident = null;
		from.host = null;
	} else {
		from.name = null;
		from.ident = null;
		from.host = null;
	}

	/** Hook Params */
	const cmdData = {
		mtags: Object.keys(mtags).length ? mtags : null,
		from: from,
		cmd: cmd,
		param: tok,
		parc: parv ? parv.length : null,
		parv: parv,
		parvstring: parv ? parv.join(" ") : null,
	};

	const customEvent = new CustomEvent(cmd.toLowerCase(), {
		detail: cmdData
	});
	console.log(customEvent);
	document.dispatchEvent(customEvent);
}


/**
 * PRIVMSG
 */
document.addEventListener("privmsg", privmsg => {
	privmsg = privmsg.detail; // always in .detail
	const nick = privmsg.from.name;
	console.log(privmsg);
	let msg = (Array.isArray(privmsg.parv)) ? privmsg.parv.join(" ") : privmsg.parv;
	let parv = privmsg.parv;
	let param = privmsg.param[0].split(" ");
	let chan = param[2];
	const mtags = privmsg.mtags;
	let display_nick = (mtags && mtags["+draft/display-name"]) ? Escape(mtags["+draft/display-name"]) : nick;
	let timestamp = (mtags && mtags["time"]) ? mtags["time"] : NULL;
	let time = timestamp.substring(11, 19);
	let isCtcp = IsCtcp(msg);
	let isAction = false;
	if (isCtcp) {
		msg = msg.split('\u0001').join("");
	}
	parv = msg.split(" ");
	if (parv[0] == "ACTION") {
		isAction = true;
		parv[0] = '';
		msg = (Array.isArray(parv)) ? parv.join(" ") : parv;
		parv = msg.split(" ");
	}
	display_nick = display_nick.replace(/\\s/g, ' ');
	let questions_str = "";
	if (mtags['+script-message']) {
		const jsonArray = mtags['+script-message'].slice(1, -1).split(',');

		// Remove any leading/trailing whitespace and unescape the values
		const questions = jsonArray.map(item => item.trim().replace(/\\s/g, ' ').replace(/"/g, ''));

		questions.forEach(question => {
			var extra = (question == "Leave the chat") ? " leave-chat" : "";
			var q = (extra.length > 0) ? "QUIT :Left the chat" : question.replace(/'/g, "\\'");
			var to_send = (extra.length > 0) ? `doSend('QUIT :Left the chat')` : `sendto_one(null,'Support','` + q + `')`;
			questions_str += `<div class="mt-1 btn rounded-pill border border-info script-option" onclick="` + to_send + `">` + question + `</div><br>`;
		});
	}
	if (isAction) {
		doMiddleBubbble("* " + Escape(display_nick) + " " + Escape(msg))
		return;
	}

	else if (nick != nickname) {
		var classes = isAction ? "other-action" : "other-privmsg";
		writeToScreen(`
				<!-- Message bubble -->
				<div role="button" id="`+ mtags.msgid + `" class="card rounded ms-3 mt-0 mb-0 ps-2 pb-1 pt-1 pe-4 card align-items-center ` + classes + `">` +
			(mtags.bot ? `<div class="badge bg-primary me-2">Bot</div>` : ``) + `
					<div id="display-nick" class="ms-0 ` + (!isAction ? `badge` : 'ms-1') + ` me-2">` + ((isAction) ? `<i> * ` : ``) + (display_nick +
				((isAction) ? Escape(msg) + `</i>` : ``)) + `<small class="timestamp">` + time + `</small>` +

			((!isAction) ? `</div>` +
				`<br><div id="message-contents">` + Escape(msg) + `</div>` : '') + questions_str.slice(0, -4) + `
				</div>
		`);
	} else {
		writeToScreen(`
			<div role="button" id="`+ mtags.msgid + `" class="card text-end rounded container-flex me-2 mt-0 mb-0 ps-2 pt-1 pb-1 pe-4 card our-privmsg">
				<div class="badge btn-sm me-2">`+ display_nick + `<small class="timestamp">` + time + `</small>` + `</div><br><div id="message_contents">` + Escape(msg) + `</div>
			</div>
	`);
	}

});

function writeToScreen(message, window = null) {
	var o = document.getElementById('chat-outut') ?? output;
	var pre = document.createElement("p");
	pre.innerHTML = message;
	o.appendChild(pre);
	o.scrollTop = o.scrollHeight;
}

function mircToHtml(text) {
	//control codes
	var rex = /\003([0-9]{1,2})[,]?([0-9]{1,2})?([^\003]+)/,
		matches, colors;
	if (rex.test(text)) {
		while (cp = rex.exec(text)) {
			if (cp[1] && cp[1].length == 1)
				cp[1] = "0" + cp[1];

			if (cp[2] && cp[2].length == 1) {
				cp[2] = "0" + cp[2];
				var cbg = cp[2];
			}
			var text = text.replace(cp[0], '<span class="' + (cp[1] ? 'IRCCF' + cp[1] : "") + (cbg ? ' IRCCC' + cbg : "") + '">' + cp[3] + '</span>');
		}
	}
	//bold,italics,underline
	var bui = [
		[/\002([^\002]+)(\002)?/, ["<b>", "</b>"]],
		[/\037([^\037]+)(\037)?/, ["<u>", "</u>"]],
		[/\035([^\035]+)(\035)?/, ["<i>", "</i>"]]
	];
	for (var i = 0; i < bui.length; i++) {
		var bc = bui[i][0];
		var style = bui[i][1];
		if (bc.test(text)) {
			while (bmatch = bc.exec(text)) {
				var text = text.replace(bmatch[0], style[0] + bmatch[1] + style[1]);
			}
		}
	}
	return text;
};
function specialEscape(text) {
	var map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};
	return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}
function Escape(string) {
	string = specialEscape(string);
	string = mircToHtml(string);
	return string;
}

function getElementsByIdRegex(startswith, endswith = null) {
	var arr = [];
	var str = '[id^="' + startswith + '"]';
	str += endswith ? '[id$="' + endswith + '"]' : '';

	Array.from(
		document.querySelectorAll('[id^="edit-tid"][id$="-view"]'))
		.forEach(function (x) {
			arr.push(x);
		}
		);

	return arr;
}

function string_starts_with(string, string2) {
	return string.substring(0, string2.length) == string2;
}

function string_ends_with(string, string2) {
	let len = '-' + string2.length + 1;
	return string.substring(len, string2.length) == string2;
}

function IsCtcp(string) {
	if (string_starts_with(string, '\u0001') && string_ends_with(string, '\u0001'))
		return true;
	return false;
}

function doMiddleBubbble(msg) {
	writeToScreen(
		`<div style="width:auto" class="text-center">
			<div style="width:50%" class="btn rounded">
				`+ msg + `
			</div>
		</div>`
	);
}

// bad nick
document.addEventListener("433", e => {
	nickname = nickname + Math.floor(Math.random() * (1000 - 1 + 1)) + 1;
	doSend("NICK " + nickname);
});


function generateRandomString(length = 10) {
	const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ[]';
	let result = '';

	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		result += characters.charAt(randomIndex);
	}

	return result;
}

function sendto_one(mtags = null, target, message) {
	if (!mtags)
		mtags = new Map();

	if (display_nick.length > 0)
		mtags.set("+draft/display-name", display_nick);

	let str = "@";
	mtags.forEach((value, key) => {
		str += key + "=" + value + ";";
	});
	doSend(str + " PRIVMSG " + target + " :" + message);
}

function addslashes(string) {
	return string.replace(/\\/g, '\\\\').
		replace(/\u0008/g, '\\b').
		replace(/\t/g, '\\t').
		replace(/\n/g, '\\n').
		replace(/\f/g, '\\f').
		replace(/'/g, "\\'").
		replace(/\s/g, '\\s').
		replace(/\r/g, '\\n').
		replace(/"/g, '\\"');
}

function script_display(message) {
	const jsonArray = message.slice(1, -1).split(',');

	// Remove any leading/trailing whitespace and unescape the values
	const questions = jsonArray.map(item => item.trim().replace(/\\s/g, ' '));

	questions.forEach(question => {
		console.log(question);
		writeToScreen(`<div class="question badge rounded-pill">` + question + `</div><br>`);
	});

	return "";
}


var scrollableDiv = document.getElementById("chatbox-1");

// Add an event listener for the 'resize' event
window.addEventListener("resize", function () {
	// Check if the div is scrolled to the bottom
	if (isDivScrolledToBottom(scrollableDiv)) {
		// Scroll down again
		scrollableDiv.scrollTop = scrollableDiv.scrollHeight + 100;
	}
});

// Function to check if the div is scrolled to the bottom
function isDivScrolledToBottom(div) {
	return div.scrollHeight - div.scrollTop === div.clientHeight;
}

