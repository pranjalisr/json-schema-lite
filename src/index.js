import { toJsonNode, toSchemaNode } from "./jsonast-util.js";

/**
 * @import {
 *   Json,
 *   JsonNode,
 *   SchemaNode
 * } from "./jsonast.d.ts"
 */


/** @type (schema: Json, instance: Json) => boolean */
export const validate = (schema, instance) => {
  registerSchema(schema, "");
  const schemaNode = /** @type NonNullable<SchemaNode> */ (schemaRegistry.get(""));
  const isValid = validateSchema(schemaNode, toJsonNode(instance));
  schemaRegistry.delete("");
  return isValid;
};

/** @type (schemaNode: SchemaNode, instanceNode: JsonNode) => boolean */
const validateSchema = () => {
  throw Error("Not Implemented");
};

/** @type Map<string, SchemaNode> */
const schemaRegistry = new Map();

/** @type (schema: Json, uri: string) => void */
export const registerSchema = (schema, uri) => {
  schemaRegistry.set(uri, toSchemaNode(schema, uri));
};
