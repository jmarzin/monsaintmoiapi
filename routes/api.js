const express = require('express');
const router = express.Router([]);

const basicAuth = require('basic-auth');

const auth = function (req, res, next) {
    function unauthorized(res) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.sendStatus(401);
    }
    let user = basicAuth(req);

    if (!user || !user.name || !user.pass) {
        return unauthorized(res);
    }
    if (user.name === 'admin' && user.pass === '51julie2') {
        return next();
    } else {
        return unauthorized(res);
    }
};
const multer  = require('multer')


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Api monsaintmoi' });
});

const db_materiels = require('../queries-materiels');

router.get('/materiels', db_materiels.getAllMateriels);
router.get('/materiels/photosdispos', db_materiels.getMaterielPhotos);
router.get('/materiels/:id', db_materiels.getMaterielById);
var upload = multer({ dest: 'public/images/materiels' });
router.post('/materiels', auth, upload.single('photos'), db_materiels.createMateriel);
router.put('/materiels/:id', auth, db_materiels.updateMaterielById);
router.delete('/materiels/:id', auth, db_materiels.removeMaterielById);


const db_traces = require('../queries-traces');
router.get('/traces', db_traces.getAllTraces);
router.get('/traces/:id', db_traces.getTraceById);
router.post('/traces', auth, db_traces.createTrace);
router.put('/traces/:id', auth, db_traces.updateTraceById);
router.delete('/traces/:id', auth, db_traces.removeTraceById);

module.exports = router;
