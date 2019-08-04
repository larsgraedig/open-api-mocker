'use strict';

const app = require('express')();
const logger = require('lllog')();

class Server {

	constructor() {
		this.servers = [];
		this.paths = [];
	}

	setServers(servers) {
		this.servers = servers;
		return this;
	}

	setPort(port) {
		this.port = port;
		return this;
	}

	setPaths(paths) {
		this.paths = paths;
		return this;
	}

	init() {

		this.paths.map(path => {
			const expressHttpMethod = path.httpMethod.toLowerCase();

			const uri = this._normalizeExpressPath(path.uri);

			app[expressHttpMethod](uri, (req, res) => {
				res.json(path.getResponse());
			});

			return logger.info(`Handling route ${path.httpMethod.toUpperCase()} ${uri}`);
		});

		app.all('*', this._notFoundHandler.bind(this));

		const server = app.listen(this.port);

		server.on('listening', err => {

			if(err)
				throw err;

			const realPort = server.address().port;

			logger.info(`Mocking API at ${realPort}`);
		});
	}

	_notFoundHandler(req, res) {
		res
			.status(404)
			.json({
				message: 'Path not found',
				paths: this.paths.map(({ httpMethod, uri }) => `${httpMethod.toUpperCase()} ${uri}`)
			});
	}

	_normalizeExpressPath(schemaUri) {
		return schemaUri.replace(/\{([a-z0-9]+)\}/, ':$1', 'gi');
	}

}

module.exports = Server;