import { WebSocket } from 'ws';
import { Player, addPlayer, getPlayerByName } from '../models/playerModel';
import { broadcastRoomUpdate } from './roomController';

export const handleRegistration = (ws: WebSocket, data: string) => {
  const { name, password } = JSON.parse(data);

  if (!name || !password) {
    ws.send(
      JSON.stringify({
        type: 'reg',
        data: {
          error: true,
          errorText: 'Name and password are required',
        },
        id: 0,
      }),
    );
    return;
  }

  let player = getPlayerByName(name);

  if (player) {
    if (player.password !== password) {
      ws.send(
        JSON.stringify({
          type: 'reg',
          data: {
            error: true,
            errorText: 'Incorrect password',
          },
          id: 0,
        }),
      );
      return;
    }
    player.ws = ws;
  } else {
    player = new Player(name, password, ws);
    addPlayer(player);
  }

  ws.send(
    JSON.stringify({
      type: 'reg',
      data: JSON.stringify({
        name: player.name,
        index: player.id,
        error: false,
        errorText: '',
      }),
      id: 0,
    }),
  );
  broadcastRoomUpdate();
};
