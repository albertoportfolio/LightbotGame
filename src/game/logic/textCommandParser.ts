import { Command } from '../../types/game.types'

const ALIASES: Record<string, Command> = {
  'AVANZA':   Command.MOVE_FORWARD,
  'IZQUIERDA':   Command.TURN_LEFT,
  'DERECHA':   Command.TURN_RIGHT,
  'LUZ':   Command.LIGHT_TOGGLE,
  'COPIAR':   Command.COPY_VAR,
  'BUCLE':   Command.LOOP_UNTIL_PLANT,
}

export interface ParseResult {
  commands: Command[]
  error: string | null
}

export function parseTextCommands(input: string): ParseResult {
  const commands: Command[] = []
  const tokens = input.split(',').map(t => t.trim()).filter(Boolean)

  for (const token of tokens) {
    const parts = token.toUpperCase().split(/\s+/)
    const alias = parts[0]
    const repeat = parts[1] ? parseInt(parts[1]) : 1

    if (!ALIASES[alias]) {
      return { commands: [], error: `Comando desconocido: "${parts[0]}"` }
    }
    if (isNaN(repeat) || repeat < 1 || repeat > 20) {
      return { commands: [], error: `Número de pasos inválido en: "${token}" Prueba a escribir: AVANZA 2 (Por Ejemplo)` }
    }

    for (let i = 0; i < repeat; i++) {
      commands.push(ALIASES[alias])
    }
  }

  if (commands.length === 0) {
    return { commands: [], error: 'Escribe al menos un comando' }
  }

  return { commands, error: null }
}