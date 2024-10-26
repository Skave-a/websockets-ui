import { Room } from './roomModel';

export interface Ship {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
}

export class GameState {
  private room: Room;
  private ships: Map<string, Ship[]>;
  private board: Map<string, number[][]>;
  private hits: Map<string, Set<string>>;

  constructor(room: Room) {
    this.room = room;
    this.ships = new Map();
    this.board = new Map();
    this.hits = new Map();

    room.players.forEach((p) => {
      this.ships.set(p.id, []);
      this.board.set(
        p.id,
        Array(10)
          .fill(null)
          .map(() => Array(10).fill(0)),
      );
      this.hits.set(p.id, new Set());
    });
  }

  addShips(playerId: string, ships: Ship[]) {
    this.ships.set(playerId, ships);
    const board = this.board.get(playerId);
    if (!board) return;

    ships.forEach((ship) => {
      const { x, y } = ship.position;
      for (let i = 0; i < ship.length; i++) {
        if (ship.direction) {
          board[y][x + i] = 1;
        } else {
          board[y + i][x] = 1;
        }
      }
    });
  }

  processAttack(
    x: number,
    y: number,
    attackerId: string,
  ): { status: 'miss' | 'shot' | 'killed' } {
    const defenderId = this.getOtherPlayer(attackerId);
    const defenderBoard = this.board.get(defenderId);
    if (!defenderBoard) return { status: 'miss' };

    const hit = `${x},${y}`;
    const hits = this.hits.get(defenderId);
    if (!hits) return { status: 'miss' };

    hits.add(hit);

    if (defenderBoard[y][x] === 0) {
      return { status: 'miss' };
    }

    if (this.isShipKilled(x, y, defenderId)) {
      return { status: 'killed' };
    }

    return { status: 'shot' };
  }

  private isShipKilled(x: number, y: number, playerId: string): boolean {
    const ships = this.ships.get(playerId);
    const hits = this.hits.get(playerId);
    if (!ships || !hits) return false;

    const ship = ships.find((s) => {
      if (s.direction) {
        return (
          y === s.position.y && x >= s.position.x && x < s.position.x + s.length
        );
      } else {
        return (
          x === s.position.x && y >= s.position.y && y < s.position.y + s.length
        );
      }
    });

    if (!ship) return false;

    const shipCells = [];
    for (let i = 0; i < ship.length; i++) {
      if (ship.direction) {
        shipCells.push(`${ship.position.x + i},${ship.position.y}`);
      } else {
        shipCells.push(`${ship.position.x},${ship.position.y + i}`);
      }
    }

    return shipCells.every((cell) => hits.has(cell));
  }

  isGameOver(): boolean {
    for (const [playerId, board] of this.board) {
      const hits = this.hits.get(playerId);
      if (!hits) continue;

      let allShipsHit = true;
      for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
          if (board[y][x] === 1 && !hits.has(`${x},${y}`)) {
            allShipsHit = false;
            break;
          }
        }
        if (!allShipsHit) break;
      }
      if (allShipsHit) return true;
    }
    return false;
  }

  getWinner(): string {
    for (const [playerId, board] of this.board) {
      const hits = this.hits.get(playerId);
      if (!hits) continue;

      let allShipsHit = true;
      for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
          if (board[y][x] === 1 && !hits.has(`${x},${y}`)) {
            allShipsHit = false;
            break;
          }
        }
        if (!allShipsHit) break;
      }
      if (allShipsHit) return this.getOtherPlayer(playerId);
    }
    return '';
  }

  getOtherPlayer(playerId: string): string {
    return this.room.players.find((p) => p.id !== playerId)?.id || '';
  }

  areAllShipsPlaced(): boolean {
    return Array.from(this.ships.values()).every((ships) => ships.length > 0);
  }
}
