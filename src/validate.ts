import type { Json } from "./jsonast.d.ts"
import type { Output } from "./output.ts"
import { resolveSchema } from "./resolve.ts"

export function validate(schema: Json, instance: Json): Output {
 
  const baseUri = ""

  
  const output: Output = {
    valid: true,
    absoluteKeywordLocation: baseUri,
    instanceLocation: "",
  }

 
  const resolvedSchema = resolveSchema(schema, baseUri)

 
  validateSchema(resolvedSchema, instance, output, baseUri, "")

  return output
}

function validateSchema(
  schema: Json,
  instance: Json,
  output: Output,
  schemaLocation: string,
  instancePath: string,
): void {

  if (typeof schema !== "object" || schema === null) {
    return
  }

  
  for (const keyword in schema) {
    if (keyword === "$defs" || keyword === "$schema" || keyword === "$id") {
      continue 
    }

    const keywordHandler = keywords[keyword]
    if (keywordHandler) {
      const keywordLocation = `${schemaLocation}/${keyword}`

      
      output.absoluteKeywordLocation = keywordLocation
      output.instanceLocation = instancePath

      
      keywordHandler(schema[keyword], instance, output, keywordLocation, instancePath)

      
      if (!output.valid) {
        return
      }
    }
  }
}

const keywords: Record<
  string,
  (keywordValue: Json, instance: Json, output: Output, schemaLocation: string, instancePath: string) => void
> = {
  type: validateType,
  properties: validateProperties,
  required: validateRequired,
  items: validateItems,
  $ref: validateRef,
  
}

function validateType(
  keywordValue: Json,
  instance: Json,
  output: Output,
  schemaLocation: string,
  instancePath: string,
): void {
  const expectedType = Array.isArray(keywordValue) ? keywordValue : [keywordValue]

  let valid = false
  for (const type of expectedType) {
    if (typeof type !== "string") {
      continue
    }

    if (
      (type === "null" && instance === null) ||
      (type === "boolean" && typeof instance === "boolean") ||
      (type === "object" && typeof instance === "object" && instance !== null && !Array.isArray(instance)) ||
      (type === "array" && Array.isArray(instance)) ||
      (type === "number" && typeof instance === "number") ||
      (type === "string" && typeof instance === "string") ||
      (type === "integer" && typeof instance === "number" && Number.isInteger(instance))
    ) {
      valid = true
      break
    }
  }

  if (!valid) {
    output.valid = false
  }
}

function validateProperties(
  keywordValue: Json,
  instance: Json,
  output: Output,
  schemaLocation: string,
  instancePath: string,
): void {
  if (typeof instance !== "object" || instance === null || Array.isArray(instance)) {
    return 
  }

  if (typeof keywordValue !== "object" || keywordValue === null || Array.isArray(keywordValue)) {
    return 
  }

  for (const propName in keywordValue) {
    if (propName in instance) {
      const propSchema = keywordValue[propName]
      const propInstance = instance[propName]
      const propPath = `${instancePath}/${propName}`

      validateSchema(propSchema, propInstance, output, `${schemaLocation}/${propName}`, propPath)

      if (!output.valid) {
        return
      }
    }
  }
}

function validateRequired(
  keywordValue: Json,
  instance: Json,
  output: Output,
  schemaLocation: string,
  instancePath: string,
): void {
  if (typeof instance !== "object" || instance === null || Array.isArray(instance)) {
    return 
  }

  if (!Array.isArray(keywordValue)) {
    return 
  }

  for (const propName of keywordValue) {
    if (typeof propName !== "string") {
      continue
    }

    if (!(propName in instance)) {
      output.valid = false
      return
    }
  }
}

function validateItems(
  keywordValue: Json,
  instance: Json,
  output: Output,
  schemaLocation: string,
  instancePath: string,
): void {
  if (!Array.isArray(instance)) {
    return 
  }

  if (typeof keywordValue !== "object" || keywordValue === null) {
    return 
  }

  for (let i = 0; i < instance.length; i++) {
    const itemPath = `${instancePath}/${i}`
    validateSchema(keywordValue, instance[i], output, schemaLocation, itemPath)

    if (!output.valid) {
      return
    }
  }
}

function validateRef(
  keywordValue: Json,
  instance: Json,
  output: Output,
  schemaLocation: string,
  instancePath: string,
): void {
  if (typeof keywordValue !== "string") {
    return
  }

  
  const refSchema = resolveSchema({ $ref: keywordValue }, schemaLocation)


  validateSchema(refSchema, instance, output, schemaLocation, instancePath)
}

