import type { Json } from "./jsonast"
import type { Output } from "./output.ts"
import { validate as validateImpl } from "./validate.ts"
import { registerSchema as registerSchemaImpl } from "./resolve.ts"

export function validate(schema: Json, instance: Json): Output {
  return validateImpl(schema, instance)
}

export function registerSchema(schema: Json, uri: string): void {
  registerSchemaImpl(schema, uri)
}

export type { Json } from "./jsonast"
export type { Output } from "./output.ts"

