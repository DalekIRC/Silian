
function commandHandler(string)
{
    let mtags = {};
    let from = {};
    let cmd = "";
    let target = {};
    let parv = [];

    // for debugging urhurhurhur.
    console.log("RECV: "+string);

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

    if (string[0] !== ':')
        string = ":null " + string;
	
    const bigparv = string.substring(1).split(' ');
    cmd = bigparv[1];
    const tok = (string.substring(1).includes(" :")) ? string.substring(1).split(" :") : [bigparv];
    parv = tok[1] ? tok[1].split(' ') : null;
    if (bigparv[0] && bigparv[0].includes("!"))
    {
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
    document.dispatchEvent(customEvent);
}
