var me = {
    name: "Dalek-" + Math.floor((Math.random() * 1000) + 1).toString(),
	ident: 'dalek',
	gecos: 'Daleks Reign Supreme',
	quitmsg: 'Daleks Reign Supreme',
	toJoin: "#possumsonly",
	capsToRequest: [
		'echo-message',
		'away-notify',
		'invite-notify',
		'extended-join',
		//'userhost-in-names',
		'multi-prefix',
		'setname',
		'chghost',
		'account-notify',
		'message-tags',
		'batch',
		'server-time',
		'account-tag',
		'labeled-response',
		'valware.uk/cmdslist',
	],
	sasl: {
		"account": null,
		"password": null
	},
	capsAck: [
		
	],
	server: {
		name: "irc.valware.uk",
		port: "443",
		commands: [],
		isupport: [],
		modes: {
			group1: [],
			group2: [],
			group3: [],
			group4: [],
		},
		listmodes: {}, // for key=>pair values like ~ is +q
	},
	channels: [],
	jobs: 0,
	active_window: null,
};