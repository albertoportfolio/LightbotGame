import { DateTime } from 'luxon'
import { VineDate } from '@vinejs/vine'

// Augmentación de tipos para que VineJS devuelva Luxon DateTime en lugar de Date nativo de JS
declare module '@vinejs/vine/types' {
  interface VineGlobalTransforms {
    date: DateTime
  }
}

// Transform global: convierte automáticamente las fechas validadas por VineJS a Luxon DateTime
VineDate.transform((value) => DateTime.fromJSDate(value))
