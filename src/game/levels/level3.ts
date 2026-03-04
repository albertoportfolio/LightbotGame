import { LevelDef } from '../../types/game.types';

// Solución: Avanzar → Girar ← → Avanzar → Girar → → 🔁 Bucle 🌿
// El robot sube la escalera paso a paso hasta la planta
//
// Ruta:  (4,0)→(4,1) ↑(3,1)→(3,2) ↑(2,2)→(2,3) ↑(1,3)→(1,4) ↑(0,4)→(0,5)🌿
const level3: LevelDef = {
  id: 3,
  name: 'La Escalera Verde',
  maxCommands: 6,
  maxAttempts: 1,
  instructions: 'Haz que el robot llegue a la planta con un bucle',
  robotStart: { row: 4, col: 0, direction: 'RIGHT' },
  grid: [
    ['empty', 'empty', 'empty', 'empty', 'floor', 'plant'],
    ['empty', 'empty', 'empty', 'floor', 'floor', 'empty'],
    ['empty', 'empty', 'floor', 'floor', 'empty', 'empty'],
    ['empty', 'floor', 'floor', 'empty', 'empty', 'empty'],
    ['floor', 'floor', 'empty', 'empty', 'empty', 'empty'],
  ],
};

export default level3;