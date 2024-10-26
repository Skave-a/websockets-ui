import { WebSocket } from 'ws';
import { Player, addPlayer } from '../models/playerModel';
import { RoomUpdate } from './../utils/index';

export const handleRegistration = (ws: WebSocket, data: string) => {
  const { name, password } = JSON.parse(data);

  let player = new Player(name, password, ws);
  addPlayer(player);

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

  RoomUpdate();
};
