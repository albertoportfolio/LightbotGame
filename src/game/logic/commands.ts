import { Command } from '../../types/game.types';

// Metadatos visuales de un comando: etiqueta, icono, colores para la UI + sprites PNG
export interface CommandMeta {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  /** PNG cuadrado con icono+label para la paleta (assets/comandos/state=*.png) */
  paletteSprite: string;
  /** PNG píldora con sólo el label para la cola (assets/comandos2/Propiedad 1=Frame N.png) */
  chipSprite: string;
}

// Diccionario que asocia cada Command con su representación visual (label, icono, color, descripción)
export const COMMAND_META: Record<Command, CommandMeta> = {
  [Command.MOVE_FORWARD]: {
    label: 'Avanzar',
    icon: '▲',
    color: '#fff',
    bgColor: '#facc15',
    description: 'Mueve el robot una celda hacia adelante',
    paletteSprite: '/assets/comandos/state=avanzar.png',
    chipSprite: '/assets/comandos2/Propiedad%201=Frame%202.png',
  },
  [Command.TURN_LEFT]: {
    label: 'Girar ←',
    icon: '↺',
    color: '#fff',
    bgColor: '#84cc16',
    description: 'Gira el robot 90° a la izquierda',
    paletteSprite: '/assets/comandos/state=izquierda.png',
    chipSprite: '/assets/comandos2/Propiedad%201=Frame%203.png',
  },
  [Command.TURN_RIGHT]: {
    label: 'Girar →',
    icon: '↻',
    color: '#fff',
    bgColor: '#84cc16',
    description: 'Gira el robot 90° a la derecha',
    paletteSprite: '/assets/comandos/state=derecha.png',
    chipSprite: '/assets/comandos2/Propiedad%201=Frame%204.png',
  },
  [Command.LIGHT_TOGGLE]: {
    label: 'Luz',
    icon: '★',
    color: '#1a202c',
    bgColor: '#c4b5fd',
    description: 'Enciende/apaga la luz de la celda actual',
    paletteSprite: '/assets/comandos/state=luz.png',
    chipSprite: '/assets/comandos2/Propiedad%201=Frame%205.png',
  },
  [Command.LOOP_UNTIL_PLANT]: {
    label: 'Bucle',
    icon: '🔁',
    color: '#fff',
    bgColor: '#67e8f9',
    description: 'Repite los comandos anteriores hasta llegar a una planta',
    paletteSprite: '/assets/comandos/state=bucle.png',
    chipSprite: '/assets/comandos2/Propiedad%201=Frame%207.png',
  },
  [Command.COPY_VAR]: {
    label: 'Copiar',
    icon: '📋',
    color: '#fff',
    bgColor: '#f472b6',
    description: 'Copia el color de esta celda a la última variable visitada (o al revés)',
    paletteSprite: '/assets/comandos/state=copiar.png',
    chipSprite: '/assets/comandos2/Propiedad%201=Frame%206.png',
  },
};

// Array con todos los comandos disponibles — se usa como fallback cuando un nivel no restringe comandos
export const ALL_COMMANDS: Command[] = Object.values(Command);