const request = require('supertest');
describe('Général', function () {
    var server;
    beforeEach(function () {
        server = require('./server')();
    });
    afterEach(function (done) {
        server.close(done);
    });
    it('responds to /api', function testSlashApi(done) {
        request(server)
            .get('/api')
            .expect(200, done);
    });
    it('404 everything else', function testSlash(done) {
        console.log('test 404')
        request(server)
            .get('/')
            .expect(404, done);
    });
});