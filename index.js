var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	traffic = require('./traffic'),
	_ = require('lodash'),
	router,
	port = process.env.PORT || 3001;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

traffic.connect().then(() => {
	router = express.Router();

	router.get('/', function(req, res) {
	    res.json({ resources: _.map(router.stack, layer => `http://localhost:${port}/api${layer.route.path}`) });   //[`http://localhost:${port}/api/nodes`, `http://localhost:${port}/api/vehicles`]
	});

	router.get('/nodes', (req, res, next) => {
		traffic.getNodes().then(nodes => res.json(nodes)).catch(err => next(err));
	});

	router.get('/ways', (req, res, next) => {
		traffic.getWays().then(ways => res.json(ways)).catch(err => next(err));
	});

	router.get('/bounds', (req, res, next) => {
		traffic.getBounds().then(bounds => res.json(bounds)).catch(err => next(err));
	});

	router.get('/relations', (req, res, next) => {
		traffic.getRelations().then(relations => res.json(relations)).catch(err => next(err));
	});

	router.get('/vehicles', (req, res, next) => {
		traffic.getVehicles().then(vehicles => res.json(vehicles)).catch(err => next(err));
	});

	app.use('/api', router);

	app.listen(port);
	console.log(`http://localhost:${port}/api`);
});
