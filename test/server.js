function makeServer() {
    const app = require('../app');
    const server = app.listen(3000);
    return server;
}
module.exports = makeServer;