const db = require('./connect');
const fs = require('fs');
// add query functions


function getAllMateriels(req, res, next) {
  db.any('select * from materiels order by poids desc')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function createMateriel(req, res, next) {
    if(req.file) fs.renameSync(req.file.path, req.file.destination + '/' + req.file.originalname);
    db.one('insert into materiels (nom, description, photo, poids, reforme, created_at, updated_at)' +
        'values($1, $2, $3, $4, $5, now(), now()) returning *',
        [req.body.nom, req.body.description, req.body.photo, parseInt(req.body.poids), req.body.reforme])
        .then(function (data) {
            res.status(200)
                .json(data);
            })
        .catch(function (err) {
            return next(err);
        });
}

function removeMaterielById(req, res, next) {
  const id = parseInt(req.params.id);
  db.result('delete from materiels where id = $1', id)
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

function getMaterielById(req, res, next) {
  const id = parseInt(req.params.id);
  db.one('select * from materiels where id = $1', id)
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function updateMaterielById(req, res, next) {
  db.result('update materiels set nom=$1, description=$2, photo=$3, poids=$4, reforme=$5, updated_at=now() where id=$6',
    [req.body.nom, req.body.description, req.body.photo, parseInt(req.body.poids), req.body.reforme, parseInt(req.params.id)])
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

function getMaterielPhotos(req, res, next) {
  db.any('select photo from materiels')
      .then(function (data) {
          data = data.map(x => x.photo);
          fs.readdir('public/images/materiels', function (err, files) {
              if (err) {
                  return next(err);
              } else {
                  var tab = files.filter(nom => data.indexOf(nom) === -1);
                  if(tab.indexOf('0pasdimage.jpg') === -1) { tab.unshift('0pasdimage.jpg'); }
                  res.status(200)
                      .json(tab);
              }
          })
      })
      .catch(function (err) {
          return next(err);
      });
}

module.exports = {
  getAllMateriels: getAllMateriels,
  getMaterielById: getMaterielById,
  createMateriel: createMateriel,
  updateMaterielById: updateMaterielById,
  removeMaterielById: removeMaterielById,
  getMaterielPhotos: getMaterielPhotos
};

