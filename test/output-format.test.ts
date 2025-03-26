import { validate, registerSchema } from "../src/index"
import { describe, it, expect, beforeEach } from "vitest"

describe("Basic Output Format", () => {
  beforeEach(() => {
    // Reset 
  })

  it("should include valid, absoluteKeywordLocation, and instanceLocation properties", () => {
    const schema = { type: "string" }
    const instance = "test"

    const result = validate(schema, instance)

    expect(result).toHaveProperty("valid", true)
    expect(result).toHaveProperty("absoluteKeywordLocation")
    expect(result).toHaveProperty("instanceLocation")
  })

  it("should set valid to false when validation fails", () => {
    const schema = { type: "string" }
    const instance = 42

    const result = validate(schema, instance)

    expect(result).toHaveProperty("valid", false)
    expect(result).toHaveProperty("absoluteKeywordLocation", "/type")
    expect(result).toHaveProperty("instanceLocation", "")
  })

  it("should set correct instanceLocation for nested properties", () => {
    const schema = {
      type: "object",
      properties: {
        name: { type: "string" },
      },
    }
    const instance = { name: 42 }

    const result = validate(schema, instance)

    expect(result).toHaveProperty("valid", false)
    expect(result).toHaveProperty("absoluteKeywordLocation", "/properties/name/type")
    expect(result).toHaveProperty("instanceLocation", "/name")
  })

  it("should set correct instanceLocation for array items", () => {
    const schema = {
      type: "array",
      items: { type: "string" },
    }
    const instance = ["valid", 42]

    const result = validate(schema, instance)

    expect(result).toHaveProperty("valid", false)
    expect(result).toHaveProperty("absoluteKeywordLocation", "/items/type")
    expect(result).toHaveProperty("instanceLocation", "/1")
  })

  it("should handle $ref correctly", () => {
    const schema = {
      $ref: "#/$defs/stringSchema",
      $defs: {
        stringSchema: { type: "string" },
      },
    }
    const instance = 42

    const result = validate(schema, instance)

    expect(result).toHaveProperty("valid", false)
  })

  it("should handle registered schemas", () => {
    const externalSchema = { type: "string" }
    registerSchema(externalSchema, "https://example.com/string-schema")

    const schema = { $ref: "https://example.com/string-schema" }
    const instance = 42

    const result = validate(schema, instance)

    expect(result).toHaveProperty("valid", false)
  })
})

