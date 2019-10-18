const request = require('supertest');
const db = require('../connect');
const should = require('chai').should();
describe('Materiel', () => {
    var server;
    beforeEach(function () {
        server = require('./server')();
    });
    afterEach(function (done) {
        server.close(done);
    });
    it("401 si on cherche à créer sans être habilité", done => {
        request(server)
            .post('/api/materiels')
            .expect(401, done);
    });
    it("500 si est habilité mais sans les données", done => {
        request(server)
            .post('/api/materiels')
            .auth('admin', '51julie2')
            .expect(500, done);
    });
    it("200 si on crée avec les données", done => {
        db.any('SELECT count(*) FROM materiels')
            .then(dataAvant => {
                request(server)
                    .post('/api/materiels')
                    .auth('admin', '51julie2')
                    .send({nom: 'nom', description: 'description', photo: 'photo.jpg', poids: 100, reforme: false})
                    .expect(200)
                    .end( () => {
                        db.any('SELECT count(*) FROM materiels')
                            .then(dataApres => {
                                parseInt(dataApres[0].count).should.equal(parseInt(dataAvant[0].count) + 1);
                            });
                        done();
                    })
            });
    });
    it('responds to /api/materiels', done => {
        db.any('SELECT count(*) FROM materiels')
            .then(function(data) {
                request(server)
                    .get('/api/materiels')
                    .expect(200)
                    .end((err, res) => {
                        res.body.length.should.equal(parseInt(data[0].count));
                        done();
                    });
            });
    });
    it('responds to /api/materiels/n', done => {
        db.any('SELECT id FROM materiels LIMIT 1')
            .then(data => {
                request(server)
                    .get(`/api/materiels/${data[0].id}`)
                    .expect(200, done);
            })
    });
    it("500 si le materiel n'existe pas", done => {
        request(server)
            .get('/api/materiels/0')
            .expect(500, done);
    });
    it("401 si on modifie sans être habilité", done => {
        request(server)
            .put('/api/materiels/1')
            .expect(401, done);
    });
    it("500 si on modifie habilité mais sans donnée", done => {
        request(server)
            .put('/api/materiels/1')
            .auth('admin', '51julie2')
            .expect(500, done);
    });
    it("200 et rowCount 1 si on modifie en étant habilité", done => {
        db.any('SELECT id FROM materiels ORDER BY id DESC LIMIT 1')
            .then(data => {
                request(server)
                    .put(`/api/materiels/${data[0].id}`)
                    .auth('admin', '51julie2')
                    .send({nom: 'nom2', description: 'description2', photo: 'photo2.jpg', poids: 1000, reforme: true})
                    .expect(200, '{"rowCount":1}', done)
            });
    });
    it("200 et rowCount 0 si on modifie un matériel inexistant", done => {
        request(server)
            .put('/api/materiels/0')
            .auth('admin', '51julie2')
            .send({nom: 'nom2', description: 'description2', photo: 'photo2.jpg', poids: 1000, reforme: true})
            .expect(200, '{"rowCount":0}', done)
    })
    it("401 si on supprime sans être habilité", done => {
        request(server)
            .delete('/api/materiels/1')
            .expect(401, done);
    });
    it("200 et rowCount 1 si on supprime en étant habilité", done => {
        db.any('SELECT COUNT(*), MAX(id) FROM materiels')
            .then( dataAvant => {
                request(server)
                    .delete(`/api/materiels/${dataAvant[0].max}`)
                    .auth('admin', '51julie2')
                    .expect(200, '{"rowCount":1}')
                    .end( (err, res) => {
                        db.any('SELECT COUNT(*), MAX(id) FROM materiels')
                            .then( dataApres => {
                                parseInt(dataApres[0].count).should.equal(parseInt(dataAvant[0].count) - 1);
                                dataApres[0].max.should.be.below(dataAvant[0].max);
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