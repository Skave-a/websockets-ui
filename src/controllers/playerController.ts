import { WebSocket } from 'ws';
import { addPlayer, Player } from '../models/playerModel';

export const handleRegistration = (ws: WebSocket, data: string) => {
  const parsedData = JSON.parse(data);
  const { name, password } = parsedData;

  if (!name || !password) {
    throw new Error('Name and password are required');
  }

  const newPlayer = new Player(name, password);
  addPlayer(newPlayer);

  const dataStr = JSON.stringify({
    name: newPlayer.name,
    index: newPlayer.id,
    error: false,
    errorText: '',
  });

  const response = {
    type: 'reg',
    data: dataStr,
    id: 0,
  };

  ws.send(JSON.stringify(response));
};
