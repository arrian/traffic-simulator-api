var client = require('mongodb').MongoClient,
	url = require('./config').mongo.url,
	_ = require('lodash'),
	data;

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

module.exports = {
	connect,
	getNodes: () => getCollection('nodes'),
	getWays: () => getCollection('ways'),
	getBounds: () => getCollection('bounds'),
	getRelations: () => getCollection('relations'),
	getVehicles: () => getCollection('vehicles'),

}