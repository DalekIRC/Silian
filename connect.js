
function specialEscape(text) {
	var map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};
	return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function connectWebSocket()
{
	var wsUri = (me.server.name != null) ? "wss://" + me.server.name + ":" + me.server.port: 'wss://irc.libera.chat';
	websocket = new WebSocket(wsUri);
	websocket.onopen = function(evt) { onWebsocketOpen(evt) };
	websocket.onclose = function(evt) { onWebsocketClose(evt) };
	websocket.onmessage = function(evt) { onWebsocketMessage(evt) };
	websocket.onerror = function(evt) { onWebsocketError(evt) };
}

function onWebsocketOpen(evt)
{
    Hook.run(HOOKTYPE.SOCKOPEN_PRE, evt);

	// are we doing sasl? ;o
	const isSasl = (me.sasl.account && me.sasl.password) ? 1 : 0;

    // make sure we don't make mistakes. send them individually, who cares =]
    
	doSend("cmdslist");
	doSend("user "+me.ident+" * * :"+me.gecos);
	doSend("nick "+me.name);

	Hook.run(HOOKTYPE.SOCKOPEN, evt);

}

function onWebsocketClose(evt)
{
	writeToScreen("DISCONNECTED");
    console.log(evt);
}

function onWebsocketMessage(evt)
{
	rawData = evt.data;
	if (rawData instanceof Blob)
	{
		var fileReader = new FileReader();
		fileReader.addEventListener("loadend",handleBinaryInput);
		fileReader.readAsText(rawData);
	}
	else
	{
		process(rawData);
	}   
}

function handleBinaryInput(event)
{
	var fileReader = event.target;
	var raw = fileReader.result;
	process(raw);
}

var isConnected = 0;
function process(rawData)
{
	if (rawData.indexOf("PING") == 0)
	{
		pongResponse = rawData.replace("PING","PONG");
		//writeToScreen('<span style="color: brown;">SENDING: ' + specialEscape(pongResponse)+'<\/span>');        
		websocket.send(pongResponse);
	}
	else if (rawData.indexOf("001") > -1)
	{
		setConnectButton();
		doSend("join "+me.toJoin); // join a room upon connection.
	}
	irc_parse(rawData);
}


function quit()
{
	doSend("QUIT :"+me.quitmsg);
	websocket = null;
}

function onWebsocketError(evt)
{
	writeToScreen('<span style="color: red;">ERROR:<\/span> ' + evt.data);
}

function doSend(message)
{
	//writeToScreen("SENT: " + specialEscape(message) + "<br/>");
	websocket.send(message +"\n");
	console.log("SENT: "+message);
}

function writeToScreen(message, window = null)
{
	var o = document.getElementById(window+'-channel-output') ?? output;
	var pre = document.createElement("p");
	pre.innerHTML = message;
	o.appendChild(pre);
		// hope this works in all browsers:
	o.scrollTop = o.scrollHeight;
}
	
function send(dest = me.active_window)
{
	var input = document.getElementById("input");
	input.focus();
	var text = document.getElementById("input").value;
	var parv = input.value.split(" ");
	if (text[0] == "/")
	{
		if (parv[0] == "/me")
		{
			parv[0] = null;
			text = parv.join(" ");
			doSend('privmsg '+me.active_window+' :\u0001ACTION'+text+'\u0001')
			input.value = "";
			return;
		}
		doSend(text.substring(1));
	}
	else doSend("privmsg "+me.active_window+" :" + text);
	input.value = "";
}

function irc_parse(rawData)
{
	commandHandler(rawData);
	let mtags = {};
	let string = rawData;

	// sort through mtags
	if (string.substring(0,1) == "@")
	{
		const mtok = string.substring(1).split(' ');
		const tags = mtok[0].split(';');
		let key, value;
		tags.forEach(tag => {
			if (tag.includes('='))
			{
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

	// sort through message
	//if (string[0] != ":")
	//	string = ":"+

	const strtok = string.split(' ');

	// native valware.uk/cmdslist support
	if (strtok[1] == "CMDSLIST")
	{
		let cmd = strtok[2].substring(1);
		if (strtok[2][0] == "+")
		{
			servercmds.push(cmd.toLowerCase());
		}
		else if (strtok[2][0] == "-")
		{
			servercmds.slice(servercmds.indexOf(cmd.toLowerCase()));
		}
	}

	// sasl stuff
	else if (me.sasl.account && me.sasl.password && strtok[0]+" "+strtok[1] == "AUTHENTICATE +")
		doSend("AUTHENTICATE "+btoa(me.sasl.account+"\0"+me.sasl.account+"\0"+me.sasl.password)+"\n");

	else if (strtok[1] == "900")
	{
		doSend("cap end");
	}
}
