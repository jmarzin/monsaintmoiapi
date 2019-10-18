const request = require('supertest');
const db = require('../connect');
const should = require('chai').should();
describe('Traces', () => {
    var server;
    beforeEach(function () {
        server = require('./server')();
    });
    afterEach(function (done) {
        server.close(done);
    });
    it("401 si on cherche à créer sans être habilité", done => {
        request(server)
            .post('/api/traces')
            .expect(401, done);
    });
    it("500 si est habilité mais sans les données", done => {
        request(server)
            .post('/api/traces')
            .auth('admin', '51julie2')
            .expect(500, done)
            ;
    });
    it("200 si on crée avec les données", done => {
        db.any('SELECT count(*) FROM traces')
            .then(dataAvant => {
                request(server)
                    .post('/api/traces')
                    .auth('admin', '51julie2')
                    .send({titre: 'titre', sous_titre: 'sous-titre', description: 'description', fichier_gpx: 'fichier.gpx',
                        altitude_minimum: 100, altitude_maximum: 1000, ascension_totale: 900, descente_totale: 900,
                        heure_debut: '2017-11-19 16:35:00.030818', heure_fin: '2017-11-19 16:35:00.030818', distance_totale: 20, lat_depart: 100.0, long_depart: 100.1,
                        lat_arrivee: 200.0, long_arrivee: 200.1, type: 'Randonnee', repertoire_photos: 'rep_photos', moyen: 'P',
                        polylines: '[polylines]'})
                    .expect(200)
                    .end( () => {
                        db.any('SELECT count(*) FROM traces')
                            .then(dataApres => {
                                parseInt(dataApres[0].count).should.equal(parseInt(dataAvant[0].count) + 1);
                            });
                        done();
                    })
            });
    });
    it('responds to /api/traces', done => {
        db.any('SELECT count(*) FROM traces')
            .then(function(data) {
                request(server)
                    .get('/api/traces')
                    .expect(200)
                    .end((err, res) => {
                        res.body.length.should.equal(parseInt(data[0].count));
                        done();
                    });
            });
    });
    it('responds to /api/traces/n', done => {
        db.any('SELECT id FROM traces LIMIT 1')
            .then(data => {
                request(server)
                    .get(`/api/traces/${data[0].id}`)
                    .expect(200, done);
            })
    });
    it("500 si la trace n'existe pas", done => {
        request(server)
            .get('/api/traces/0')
            .expect(500, done);
    });
    it("401 si on modifie sans être habilité", done => {
        request(server)
            .put('/api/traces/1')
            .expect(401, done);
    });
    it("500 si on modifie habilité mais sans donnée", done => {
        request(server)
            .put('/api/traces/1')
            .auth('admin', '51julie2')
            .expect(500, done);
    });
    it("200 et rowCount 1 si on modifie en étant habilité", done => {
        db.any('SELECT id FROM traces ORDER BY id DESC LIMIT 1')
            .then(data => {
                request(server)
                    .put(`/api/traces/${data[0].id}`)
                    .auth('admin', '51julie2')
                    .send({traces_id: 0, titre: 'titre2', sous_titre: 'sous-titre2', description: 'description2', fichier_gpx: 'fichier2.gpx',
                        altitude_minimum: 101, altitude_maximum: 1001, ascension_totale: 901, descente_totale: 901,
                        heure_debut: '2017-11-19 17:35:00.030818', heure_fin: '2017-11-19 17:35:00.030818', distance_totale: 21, lat_depart: 100.1, long_depart: 100.2,
                        lat_arrivee: 200.1, long_arrivee: 200.2, type: 'Randonnee', repertoire_photos: 'rep_photos2', moyen: 'V',
                        polylines: '[polylines2]'})
                    .expect(200, '{"rowCount":1}', done)
            });
    });
    it("200 et rowCount 0 si on modifie une trace inexistante", done => {
        request(server)
            .put('/api/traces/0')
            .auth('admin', '51julie2')
            .send({titre: 'titre2', sous_titre: 'sous-titre2', description: 'description2', fichier_gpx: 'fichier2.gpx',
                altitude_minimum: 101, altitude_maximum: 1001, ascension_totale: 901, descente_totale: 901,
                heure_debut: '2017-11-19 17:35:00.030818', heure_fin: '2017-11-19 17:35:00.030818', distance_totale: 21, lat_depart: 100.1, long_depart: 100.2,
                lat_arrivee: 200.1, long_arrivee: 200.2, type: 'Randonnee', repertoire_photos: 'rep_photos2', moyen: 'V',
                polylines: '[polylines2]'})
            .expect(200, '{"rowCount":0}', done)
    })
    it("401 si on supprime sans être habilité", done => {
        request(server)
            .delete('/api/traces/1')
            .expect(401, done);
    });
    it("200 et rowCount 1 si on supprime en étant habilité", done => {
        db.any('SELECT COUNT(*), MAX(id) FROM traces')
            .then( dataAvant => {
                request(server)
                    .delete(`/api/traces/${dataAvant[0].max}`)
                    .auth('admin', '51julie2')
                    .expect(200, '{"rowCount":1}')
                    .end( (err, res) => {
                        db.any('SELECT COUNT(*), MAX(id) FROM traces')
                            .then( dataApres => {
                                parseInt(dataApres[0].count).should.equal(parseInt(dataAvant[0].count) - 1);
                                parseInt(dataApres[0].max).should.be.below(parseInt(dataAvant[0].max));
                            });
                    done();
                });
            });
    });
    it("200 et rowCount nul si on supprime un matériel qui n'existe pas", done => {
        request(server)
            .delete('/api/materiels/0')
            .auth('admin', '51julie2')
            .expect(200, '{"rowCount":0}', done);
    })
});