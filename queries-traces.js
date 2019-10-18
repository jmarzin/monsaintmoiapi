const db = require('./connect');

// add query functions


function getAllTraces(req, res, next) {
  db.any('select * from traces order by heure_fin desc')
    .then(function (data) {
      res.status(200)
        .json(data.map(e => {
            delete(e.polylines);
            return e
        }));
    })
    .catch(function (err) {
      return next(err);
    });
}

function createTrace(req, res, next) {
    if(Object.keys(req.body).length === 0) {
        res.status(500);
        return next(new Error('pas de données'))
    }
    db.one('insert into traces (titre, sous_titre, description, fichier_gpx, altitude_minimum, altitude_maximum,' +
          ' ascension_totale, descente_totale, heure_debut, heure_fin, distance_totale, lat_depart, long_depart,' +
          ' lat_arrivee, long_arrivee, type, created_at, updated_at, repertoire_photos, moyen, polylines)' +
          'values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, now(), now(), $17, $18, $19) returning *',
          [req.body.titre, req.body.sous_titre, req.body.description, req.body.fichier_gpx, req.body.altitude_minimum,
          req.body.altitude_maximum, req.body.ascension_totale, req.body.descente_totale, req.body.heure_debut,
          req.body.heure_fin, req.body.distance_totale, req.body.lat_depart, req.body.long_depart, req.body.lat_arrivee,
          req.body.long_arrivee, req.body.type, req.body.repertoire_photos, req.body.moyen, req.body.polylines])
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      console.log(err);
      return next(err);
    });
}

function removeTraceById(req, res, next) {
  const id = parseInt(req.params.id);
  db.result('delete from traces where id = $1', id)
    .then(function (data) {
      /* jshint ignore:start */
      res.status(200)
        .json({
          rowCount: data.rowCount
        });
      /* jshint ignore:end */
    })
    .catch(function (err) {
      return next(err);
    });
}

function getTraceById(req, res, next) {
  const id = parseInt(req.params.id);
  db.one('select * from traces where id = $1', id)
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function updateTraceById(req, res, next) {
    if(Object.keys(req.body).length === 0) {
        res.status(500);
        return next(new Error('pas de données'))
    }
    db.result('update traces set traces_id = $1, titre = $2, sous_titre = $3, description = $4, fichier_gpx = $5, altitude_minimum = $6, altitude_maximum = $7,' +
          ' ascension_totale = $8, descente_totale = $9, heure_debut = $10, heure_fin = $11, distance_totale = $12, lat_depart = $13, long_depart = $14,' +
        ' lat_arrivee = $15, long_arrivee = $16, type = $17, updated_at = now(), repertoire_photos = $18, moyen = $19, polylines = $20 where id=$21',
        [req.body.traces_id, req.body.titre, req.body.sous_titre, req.body.description, req.body.fichier_gpx, req.body.altitude_minimum,
          req.body.altitude_maximum, req.body.ascension_totale, req.body.descente_totale, req.body.heure_debut,
          req.body.heure_fin, req.body.distance_totale, req.body.lat_depart, req.body.long_depart, req.body.lat_arrivee,
          req.body.long_arrivee, req.body.type, req.body.repertoire_photos, req.body.moyen, req.body.polylines, parseInt(req.params.id)])
    .then(function (data) {
      res.status(200)
        .json({
          rowCount: data.rowCount
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

module.exports = {
   getAllTraces: getAllTraces,
   getTraceById: getTraceById,
   createTrace: createTrace,
   updateTraceById: updateTraceById,
   removeTraceById: removeTraceById
};
