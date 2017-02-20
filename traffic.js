var client = require('mongodb').MongoClient,
	url = require('./config').mongo.url,
	_ = require('lodash'),
	data;

var uuid = require('node-uuid');

function connect() {
	return new Promise((resolve, reject) => {
		client.connect(url, (err, db) => {
			if(err) {
				console.log('Can\'t connect to database');
				reject(err);
			} else {
				data = db;
				console.log("Connected to database");
				resolve();
			}
		});
	});
}

function getCollection(name) {
	var nodes = data.collection(name);

	return new Promise((resolve, reject) => {
		nodes.find().toArray((err, items) => {
			if(err) {
				console.log(err);
				reject(err);
			} else {
				resolve(items);
			}
		});
	});
}

function getSyntheticVehicles() {
	var waysFind = getCollection('ways'),
		nodesFind = getCollection('nodes');

	return Promise.all([ waysFind, nodesFind ]).then(result => {
		var ways = result[0],
			nodes = result[1];

		return _.map(ways, way => {
			var date = new Date(),
			time = date.getTime();

			var nodeRef = way.nd[Math.floor(time / 1000) % way.nd.length];
			// console.log(nodeRef.ref);
			var foundNode = nodes.find(node => {
				// console.log(`comparing ${node.id} with ${nodeRef.ref}`);
				return node.id === nodeRef.ref;
			});

			// console.dir(foundNode);

			if(!foundNode) {
				return { id: uuid.v1() };
			}

			return { id: uuid.v1(), lat: foundNode.lat, lon: foundNode.lon };
		});
	});
}

function getVehicles() {
	return Promise.all([ getCollection('vehicles'), getSyntheticVehicles() ]).then(result => result[0].concat(result[1]));
}

module.exports = {
	connect,
	getNodes: () => getCollection('nodes'),
	getWays: () => getCollection('ways'),
	getBounds: () => getCollection('bounds'),
	getRelations: () => getCollection('relations'),
	getVehicles: getVehicles,

}