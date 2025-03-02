import { resolveIri } from "@hyperjump/uri";

/**
 * @import {
 *   Json,
 *   JsonNode,
 *   JsonObjectNode,
 *   JsonPropertyNode,
 *   SchemaNode,
 * } from "./jsonast.d.ts"
 */


/** @type (json: Json) => JsonNode */
export const toJsonNode = (json) => {
  switch (typeof json) {
    case "boolean":
      return { type: "json", jsonType: "boolean", value: json };
    case "number":
      return { type: "json", jsonType: "number", value: json };
    case "string":
      return { type: "json", jsonType: "string", value: json };
    case "object":
      if (json === null) {
        return { type: "json", jsonType: "null", value: json };
      } else if (Array.isArray(json)) {
        return { type: "json", jsonType: "array", children: json.map(toJsonNode) };
      } else {
        /** @type JsonObjectNode */
        const objectNode = { type: "json", jsonType: "object", children: [] };

        for (const property in json) {
          /** @type JsonPropertyNode */
          const propertyNode = {
            type: "json-property",
            children: [
              { type: "json-property-name", value: property },
              toJsonNode(json[property])
            ]
          };
          objectNode.children.push(propertyNode);
        }

        return objectNode;
      }
  }
};

/** @type (json: Json, uri: string) => SchemaNode */
export const toSchemaNode = (json, uri) => {
  switch (typeof json) {
    case "boolean":
      return { type: "json", jsonType: "boolean", value: json };
    case "number":
      return { type: "json", jsonType: "number", value: json };
    case "string":
      return { type: "json", jsonType: "string", value: json };
    case "object":
      if (json === null) {
        return { type: "json", jsonType: "null", value: json };
      } else if (Array.isArray(json)) {
        return {
          type: "json",
          jsonType: "array",
          children: json.map((item) => toSchemaNode(item, uri))
        };
      } else {
        /** @type JsonObjectNode<SchemaNode> */
        const objectNode = { type: "json", jsonType: "object", children: [] };

        for (const property in json) {
          /** @type JsonPropertyNode<SchemaNode> */
          const propertyNode = {
            type: "json-property",
            children: [
              { type: "json-property-name", value: property },
              property !== "$ref" || typeof json[property] !== "string" ? toSchemaNode(json[property], uri) : {
                type: "json-schema-reference",
                value: uri ? resolveIri(json[property], uri) : json[property]
              }
            ]
          };
          objectNode.children.push(propertyNode);
        }

        return objectNode;
      }
  }
};
