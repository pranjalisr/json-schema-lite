import { validate } from "../src/index"
import { describe, it, expect } from "vitest"

describe("Keyword: type", () => {
  it("should validate string type", () => {
    const schema = { type: "string" }

    expect(validate(schema, "test").valid).toBe(true)
    expect(validate(schema, 42).valid).toBe(false)
    expect(validate(schema, true).valid).toBe(false)
    expect(validate(schema, null).valid).toBe(false)
    expect(validate(schema, {}).valid).toBe(false)
    expect(validate(schema, []).valid).toBe(false)
  })

  it("should validate number type", () => {
    const schema = { type: "number" }

    expect(validate(schema, 42).valid).toBe(true)
    expect(validate(schema, 3.14).valid).toBe(true)
    expect(validate(schema, "test").valid).toBe(false)
    expect(validate(schema, true).valid).toBe(false)
    expect(validate(schema, null).valid).toBe(false)
    expect(validate(schema, {}).valid).toBe(false)
    expect(validate(schema, []).valid).toBe(false)
  })

  it("should validate integer type", () => {
    const schema = { type: "integer" }

    expect(validate(schema, 42).valid).toBe(true)
    expect(validate(schema, 3.14).valid).toBe(false)
    expect(validate(schema, "test").valid).toBe(false)
  })

  it("should validate boolean type", () => {
    const schema = { type: "boolean" }

    expect(validate(schema, true).valid).toBe(true)
    expect(validate(schema, false).valid).toBe(true)
    expect(validate(schema, "test").valid).toBe(false)
    expect(validate(schema, 42).valid).toBe(false)
  })

  it("should validate null type", () => {
    const schema = { type: "null" }

    expect(validate(schema, null).valid).toBe(true)
    expect(validate(schema, "test").valid).toBe(false)
    expect(validate(schema, 42).valid).toBe(false)
  })

  it("should validate object type", () => {
    const schema = { type: "object" }

    expect(validate(schema, {}).valid).toBe(true)
    expect(validate(schema, { prop: "value" }).valid).toBe(true)
    expect(validate(schema, []).valid).toBe(false)
    expect(validate(schema, "test").valid).toBe(false)
  })

  it("should validate array type", () => {
    const schema = { type: "array" }

    expect(validate(schema, []).valid).toBe(true)
    expect(validate(schema, [1, 2, 3]).valid).toBe(true)
    expect(validate(schema, {}).valid).toBe(false)
    expect(validate(schema, "test").valid).toBe(false)
  })

  it("should validate multiple types", () => {
    const schema = { type: ["string", "number"] }

    expect(validate(schema, "test").valid).toBe(true)
    expect(validate(schema, 42).valid).toBe(true)
    expect(validate(schema, true).valid).toBe(false)
    expect(validate(schema, null).valid).toBe(false)
  })
})

describe("Keyword: properties", () => {
  it("should validate object properties", () => {
    const schema = {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" },
      },
    }

    expect(validate(schema, { name: "John", age: 30 }).valid).toBe(true)
    expect(validate(schema, { name: "John", age: "30" }).valid).toBe(false)
    expect(validate(schema, { name: 123, age: 30 }).valid).toBe(false)
  })

  it("should ignore properties not in the schema", () => {
    const schema = {
      type: "object",
      properties: {
        name: { type: "string" },
      },
    }

    expect(validate(schema, { name: "John", age: 30 }).valid).toBe(true)
  })
})

describe("Keyword: required", () => {
  it("should validate required properties", () => {
    const schema = {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" },
      },
      required: ["name"],
    }

    expect(validate(schema, { name: "John" }).valid).toBe(true)
    expect(validate(schema, { age: 30 }).valid).toBe(false)
    expect(validate(schema, {}).valid).toBe(false)
  })

  it("should validate multiple required properties", () => {
    const schema = {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" },
      },
      required: ["name", "age"],
    }

    expect(validate(schema, { name: "John", age: 30 }).valid).toBe(true)
    expect(validate(schema, { name: "John" }).valid).toBe(false)
    expect(validate(schema, { age: 30 }).valid).toBe(false)
  })
})

describe("Keyword: items", () => {
  it("should validate array items", () => {
    const schema = {
      type: "array",
      items: { type: "string" },
    }

    expect(validate(schema, ["a", "b", "c"]).valid).toBe(true)
    expect(validate(schema, [1, "b", "c"]).valid).toBe(false)
    expect(validate(schema, ["a", 2, "c"]).valid).toBe(false)
  })
})

describe("Keyword: $ref", () => {
  it("should validate with local references", () => {
    const schema = {
      $ref: "#/$defs/person",
      $defs: {
        person: {
          type: "object",
          properties: {
            name: { type: "string" },
          },
          required: ["name"],
        },
      },
    }

    expect(validate(schema, { name: "John" }).valid).toBe(true)
    expect(validate(schema, { name: 123 }).valid).toBe(false)
    expect(validate(schema, {}).valid).toBe(false)
  })
})

