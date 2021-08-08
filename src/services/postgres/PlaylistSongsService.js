const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongsService {
  constructor(playlistsService, cacheService) {
    this._pool = new Pool();
    this._playlistsService = playlistsService;
    this._cacheService = cacheService;
  }

  async addPlaylistSong(playlistId, songId) {
    const id = `playlistsong-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }

    this._cacheService.delete(`playlistSongs:${playlistId}`);
  }

  async getPlaylistSongs(playlistId, owner) {
    await this._playlistsService.verifyPlaylistAccess(playlistId, owner);

    try {
      const result = await this._cacheService.get(`playlistSongs:${playlistId}`);
      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: `SELECT songs.id, songs.title, songs.performer
        FROM songs
        INNER JOIN playlistsongs ON playlistsongs.song_id = songs.id
        INNER JOIN playlists ON playlists.id = playlistsongs.playlist_id
        WHERE playlists.id = $1`,
        values: [playlistId],
      };

      const result = await this._pool.query(query);

      await this._cacheService.set(`playlistSongs:${playlistId}`, JSON.stringify(result.rows));
      return result.rows;
    }
  }

  async deletePlaylistSongById(playlistId, songId) {
    const query = {
      text: `DELETE FROM playlistsongs
      WHERE playlist_id = $1
      AND song_id = $2
      RETURNING id`,
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal dihapus dari playlist');
    }

    this._cacheService.delete(`playlistSongs:${playlistId}`);
  }
}

module.exports = PlaylistSongsService;
