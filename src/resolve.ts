import type { Json } from "./jsonast.d.ts"

// Map to store registered schemas
const schemaRegistry: Map<string, Json> = new Map()

export function registerSchema(schema: Json, uri: string): void {
  schemaRegistry.set(uri, schema)
}

export function resolveSchema(schema: Json, baseUri: string): Json {
  if (typeof schema !== "object" || schema === null) {
    return schema
  }

  // Handle $ref
  if ("$ref" in schema && typeof schema.$ref === "string") {
    const ref = schema.$ref

    // Handle local references
    if (ref.startsWith("#")) {
      const path = ref.substring(1).split("/").filter(Boolean)
      let currentSchema = schema

      // Remove $ref from the current schema to avoid infinite recursion
      const { $ref, ...schemaWithoutRef } = schema as Record<string, Json>
      currentSchema = schemaWithoutRef

      // Handle root reference
      if (path.length === 0) {
        return currentSchema
      }

      // Navigate to the referenced schema
      let target = currentSchema
      for (const segment of path) {
        if (typeof target !== "object" || target === null) {
          return {}
        }

        const decodedSegment = decodeURIComponent(segment)
        target = target[decodedSegment]

        if (target === undefined) {
          return {}
        }
      }

      return target
    }

    // Handle external references
    const registeredSchema = schemaRegistry.get(ref)
    if (registeredSchema) {
      return registeredSchema
    }

    // If not found, return an empty schema
    return {}
  }

  // Process nested schemas
  const result: Record<string, Json> = {}
  for (const key in schema) {
    const value = schema[key]

    if (key === "$defs" && typeof value === "object" && value !== null) {
      // Copy $defs as is
      result[key] = value
    } else if (typeof value === "object" && value !== null) {
      // Recursively resolve nested schemas
      result[key] = resolveSchema(value, baseUri)
    } else {
      // Copy primitive values as is
      result[key] = value
    }
  }

  return result
}

