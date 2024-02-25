import { players, winners } from '../DB/db';
import { Player } from '../types';

const registerPlayer = (name: string, password: string) => {
  const existingPlayer = players.find((player) => player.name === name);
  if (existingPlayer) {
    return JSON.stringify({
      type: 'reg',
      data: { name, error: true, errorText: 'Player already exists' },
      id: 0,
    });
  }

  const newPlayer: Player = { name, password };
  players.push(newPlayer);

  return {
    type: 'reg',
    data: JSON.stringify({ name, index: players.length - 1, error: false, errorText: '' }),
    id: 0,
  };
};

const updateWinners = () => {
  const updateMessage = {
    type: 'update_winners',
    data: JSON.stringify(winners),
    id: 0,
  };
  return updateMessage;
};

export { Player, players, registerPlayer, updateWinners };
