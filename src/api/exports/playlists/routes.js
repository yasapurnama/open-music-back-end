const routes = (handler) => [
  {
    method: 'POST',
    path: '/exports/playlists/{id}',
    handler: handler.postExportPlaylistByIdHandler,
    options: {
      auth: 'opensongs_jwt',
    },
  },
];

module.exports = routes;
