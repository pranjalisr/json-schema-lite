import { parseIriReference, toAbsoluteIri } from "@hyperjump/uri";
import {
  assertNodeType,
  toJsonNode,
  jsonPointerGet,
  toSchemaNode
} from "./jsonast-util.js";

/**
 * @import {
 *   Json,
 *   JsonNode,
 *   JsonObjectNode,
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
const validateSchema = (schemaNode, instanceNode) => {
  if (schemaNode.type === "json") {
    switch (schemaNode.jsonType) {
      case "boolean":
        return schemaNode.value;
      case "object":
        for (const propertyNode of schemaNode.children) {
          const [keywordNode, keywordValueNode] = propertyNode.children;
          const keywordHandler = keywordHandlers.get(keywordNode.value);
          if (keywordHandler && !keywordHandler(keywordValueNode, instanceNode, schemaNode)) {
            return false;
          }
        }
        return true;
    }
  }

  throw Error("Invalid Schema");
};

/** @type Map<string, SchemaNode> */
const schemaRegistry = new Map();

/** @type (schema: Json, uri: string) => void */
export const registerSchema = (schema, uri) => {
  schemaRegistry.set(uri, toSchemaNode(schema, uri));
};

/**
 * @typedef {(
 *   keywordNode: SchemaNode,
 *   instanceNode: JsonNode,
 *   schemaNode: JsonObjectNode<SchemaNode>
 * ) => boolean} KeywordHandler
 */

/** @type Map<string, KeywordHandler> */
const keywordHandlers = new Map();

keywordHandlers.set("$ref", (refNode, instanceNode) => {
  assertNodeType(refNode, "reference");
  const pointer = decodeURI(parseIriReference(refNode.value).fragment ?? "");
  const uri = refNode.value.startsWith("#") ? "" : toAbsoluteIri(refNode.value);

  const schemaNode = schemaRegistry.get(uri);
  if (!schemaNode) {
    throw Error(`Invalid reference: ${uri}`);
  }

  const referencedSchemaNode = jsonPointerGet(pointer, schemaNode, uri);

  return validateSchema(referencedSchemaNode, instanceNode);
});
