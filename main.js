// globals
var output = document.getElementById("output");


function doSasl()
{
	if (!me.sasl.account || !me.sasl.password)
	{
		console.log("Unable to SASL: Invalid credentials");
	}
	doSend("AUTHENTICATE PLAIN");
	//doSend("AUTHENTICATE "+btoa(sasl.account+"\0"+sasl.account+"\0"+sasl.password)+"\n");
}

var servercmds = [];
var servercaps = [];


function setConnectButton(i = 0)
{
	let submit = document.getElementById("submit");
	
	let value = i ? "Connect" : "Disconnect";
	let onclick = function(){
		submit.value = i ? "Disconnect" : "Connect";
		submit.classList.replace(i ? 'btn-success' : 'btn-danger', i ? 'btn-danger' : 'btn-success');
		submit.onclick = i ? quit : connectWebSocket;
		quit();
	}

	submit.value = value;
	submit.onclick = onclick;
	
} 

window.addEventListener('resize', function() { output.scrollTop = output.scrollHeight } );
