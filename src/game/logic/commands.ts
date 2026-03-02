import { Command } from '../../types/game.types';

export interface CommandMeta {
  label: string;
  icon: string;
  color: string;      // text / icon color (CSS string)
  bgColor: string;    // chip background color (CSS string) — used by InstructionPanel
  description: string;
}

export const COMMAND_META: Record<Command, CommandMeta> = {
  [Command.MOVE_FORWARD]: {
    label: 'Avanzar',
    icon: '▲',
    color: '#fff',
    bgColor: '#2b6cb0',
    description: 'Mueve el robot una celda hacia adelante',
  },
  [Command.TURN_LEFT]: {
    label: 'Girar ←',
    icon: '↺',
    color: '#fff',
    bgColor: '#276749',
    description: 'Gira el robot 90° a la izquierda',
  },
  [Command.TURN_RIGHT]: {
    label: 'Girar →',
    icon: '↻',
    color: '#fff',
    bgColor: '#744210',
    description: 'Gira el robot 90° a la derecha',
  },
  [Command.LIGHT_TOGGLE]: {
    label: 'Luz',
    icon: '★',
    color: '#1a202c',
    bgColor: '#b7791f',
    description: 'Enciende/apaga la luz de la celda actual',
  },
};

export const ALL_COMMANDS: Command[] = Object.values(Command);