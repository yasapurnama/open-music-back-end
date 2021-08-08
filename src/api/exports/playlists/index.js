const ExportPlaylistHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'exportplaylist',
  version: '1.0.0',
  register: async (server, { producerService, playlistsService, validator }) => {
    const exportPlaylistHandler = new ExportPlaylistHandler(
      producerService, playlistsService, validator,
    );
    server.route(routes(exportPlaylistHandler));
  },
};
