var fs = require('fs'),
    xml2js = require('xml2js'),
	client = require('mongodb').MongoClient,
	parser = new xml2js.Parser({ mergeAttrs: true, explicitArray: false }),
	url = require('./config').mongo.url,
	_ = require('lodash');

/**
Load street data file
**/
function loadFile(filename) {
	return new Promise((resolve, reject) => {
		fs.readFile(filename, (err, data) => {
		    parser.parseString(data, (err, result) => {
		    	if(err) {
		    		console.log('Error loading street data file');
		    		reject(err);
		    		return;
		    	}

		    	// console.dir(result.osm.node);
		        console.dir(result);
		        resolve(result);
		    });
		});
	});
}

/**
Insert data into a database collection.
**/
function insert(db, collectionName, data) {
	var collection = db.collection(collectionName);
	_.each(data, item => collection.insert(item));
}

function toArray(possibleArray) {
	if(!possibleArray) return [];
	return _.isArray(possibleArray) ? possibleArray : [possibleArray];
}

/**
Store street data in database
**/
function storeData(data) {
	return new Promise((resolve, reject) => {
		client.connect(url, (err, db) => {
			if(err) {
				console.log('Can\'t connect to database');
				throw err;
			}
			console.log("Connected to database");
			
			//TODO: ensure arrays in data are arrays. eg. ensure all nd are arrays in ways

			data.osm.node = toArray(data.osm.node);
			data.osm.way = toArray(data.osm.way);
			data.osm.relation = toArray(data.osm.relation);

			_.each(data.osm.way, way => {
				way.nd = toArray(way.nd);
				way.tag = toArray(way.tag);
			});

			insert(db, 'nodes', data.osm.node);
			insert(db, 'ways', data.osm.way);
			insert(db, 'relations', data.osm.relation);

			db.close();

			console.log("Disconnected from database");
		});
	});	
}

loadFile(__dirname + '/kambah1.osm').then(file => storeData(file));

