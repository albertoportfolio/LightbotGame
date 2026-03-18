import { HttpContext } from '@adonisjs/core/http'
import { BaseSerializer } from '@adonisjs/core/transformers'
import { type SimplePaginatorMetaKeys } from '@adonisjs/lucid/types/querybuilder'

// Serializador personalizado que envuelve todas las respuestas API en { data: ... } para consistencia
class ApiSerializer extends BaseSerializer<{
  Wrap: 'data'
  PaginationMetaData: SimplePaginatorMetaKeys
}> {
  // Clave bajo la cual se envuelven los datos serializados: { data: ... }
  wrap: 'data' = 'data'

  // Valida que los metadatos de paginación tengan la estructura esperada por Lucid
  definePaginationMetaData(metaData: unknown): SimplePaginatorMetaKeys {
    if (!this.isLucidPaginatorMetaData(metaData)) {
      throw new Error(
        'Invalid pagination metadata. Expected metadata to contain Lucid pagination keys'
      )
    }
    return metaData
  }
}

// Instancia única del serializador usada en toda la aplicación
const serializer = new ApiSerializer()
const serialize = serializer.serialize.bind(serializer) as ApiSerializer['serialize'] & {
  withoutWrapping: ApiSerializer['serializeWithoutWrapping']
}
serialize.withoutWrapping = serializer.serializeWithoutWrapping.bind(serializer)

// Inyecta ctx.serialize() en todas las instancias de HttpContext para uso en controladores
HttpContext.instanceProperty('serialize', serialize)

// Augmentación de tipos para que TypeScript reconozca ctx.serialize() en HttpContext
declare module '@adonisjs/core/http' {
  export interface HttpContext {
    serialize: typeof serialize
  }
}
