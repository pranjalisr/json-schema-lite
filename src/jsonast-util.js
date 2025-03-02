import { resolveIri } from "@hyperjump/uri";

/**
 * @import {
 *   Json,
 *   JsonArray,
 *   JsonArrayNode,
 *   JsonBooleanNode,
 *   JsonNode,
 *   JsonNullNode,
 *   JsonNumberNode,
 *   JsonObject,
 *   JsonObjectNode,
 *   JsonPropertyNode,
 *   JsonStringNode,
 *   SchemaNode,
 *   SchemaReferenceNode
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

/** @type (segment: string, node: SchemaNode, uri?: string) => SchemaNode */
export const jsonPointerStep = (segment, node, uri = "#") => {
  if (node.type === "json") {
    switch (node.jsonType) {
      case "object": {
        for (const propertyNode of node.children) {
          if (propertyNode.children[0].value === segment) {
            return propertyNode.children[1];
          }
        }
        const uriMessage = uri ? ` at ${uri}` : "";
        throw new Error(`Property '${segment}' doesn't exist${uriMessage}`);
      }
      case "array": {
        const index = segment === "-" ? node.children.length : parseInt(segment);
        if (!node.children[index]) {
          const uriMessage = uri ? ` at ${uri}` : "";
          throw new Error(`Index '${index}' doesn't exist${uriMessage}`);
        }
        return node.children[index];
      }
    }
  }

  const uriMessage = uri ? ` at ${uri}` : "";
  throw new Error(`Can't index into scalar value${uriMessage}`);
};

/** @type (pointer: string, tree: SchemaNode, documentUri?: string) => SchemaNode */
export const jsonPointerGet = (pointer, tree, documentUri) => {
  let currentPointer = "";
  let node = tree;
  for (const segment of pointerSegments(pointer)) {
    currentPointer += "/" + escapePointerSegment(segment);
    node = jsonPointerStep(segment, node, `${documentUri}#${currentPointer}`);
  }

  return node;
};

/** @type (pointer: string) => Generator<string> */
const pointerSegments = function* (pointer) {
  if (pointer.length > 0 && !pointer.startsWith("/")) {
    throw Error("Invalid JSON Pointer");
  }

  let segmentStart = 1;
  let segmentEnd = 0;

  while (segmentEnd < pointer.length) {
    const position = pointer.indexOf("/", segmentStart);
    segmentEnd = position === -1 ? pointer.length : position;
    const segment = pointer.slice(segmentStart, segmentEnd);
    segmentStart = segmentEnd + 1;

    yield unescapePointerSegment(segment);
  }
};

/** @type (segment: string) => string */
const unescapePointerSegment = (segment) => segment.toString().replace(/~1/g, "/").replace(/~0/g, "~");

/** @type (segment: string) => string */
const escapePointerSegment = (segment) => segment.toString().replace(/~/g, "~0").replace(/\//g, "~1");

/**
 * @overload
 * @param {SchemaNode} node
 * @param {"object"} type
 * @returns {node is JsonObjectNode<SchemaNode>}
 *
 * @overload
 * @param {SchemaNode} node
 * @param {"array"} type
 * @returns {node is JsonArrayNode<SchemaNode>}
 *
 * @overload
 * @param {SchemaNode} node
 * @param {"string"} type
 * @returns {node is JsonStringNode}
 *
 * @overload
 * @param {SchemaNode} node
 * @param {"number"} type
 * @returns {node is JsonNumberNode}
 *
 * @overload
 * @param {SchemaNode} node
 * @param {"boolean"} type
 * @returns {node is JsonBooleanNode}
 *
 * @overload
 * @param {SchemaNode} node
 * @param {"null"} type
 * @returns {node is JsonNullNode}
 *
 * @overload
 * @param {SchemaNode} node
 * @param {"reference"} type
 * @returns {node is SchemaReferenceNode}
 *
 * @overload
 * @param {SchemaNode} node
 * @param {string} type
 * @returns {node is SchemaNode}
 *
 * @param {SchemaNode} node
 * @param {string} type
 * @returns {boolean}
 */
export const isNodeType = (node, type) => {
  if (type === "reference") {
    if (node.type === "json-schema-reference") {
      return true;
    }
  } else if (node.type === "json") {
    if (typeof type === "string") {
      if (node.jsonType === type) {
        return true;
      }
    } else if (type === undefined) {
      return true;
    }
  }

  return false;
};

/**
 * @overload
 * @param {SchemaNode} node
 * @param {"object"} type
 * @returns {asserts node is JsonObjectNode<SchemaNode>}
 *
 * @overload
 * @param {SchemaNode} node
 * @param {"array"} type
 * @returns {asserts node is JsonArrayNode<SchemaNode>}
 *
 * @overload
 * @param {SchemaNode} node
 * @param {"string"} type
 * @returns {asserts node is JsonStringNode}
 *
 * @overload
 * @param {SchemaNode} node
 * @param {"number"} type
 * @returns {asserts node is JsonNumberNode}
 *
 * @overload
 * @param {SchemaNode} node
 * @param {"boolean"} type
 * @returns {asserts node is JsonBooleanNode}
 *
 * @overload
 * @param {SchemaNode} node
 * @param {"null"} type
 * @returns {asserts node is JsonNullNode}
 *
 * @overload
 * @param {SchemaNode} node
 * @param {"reference"} type
 * @returns {asserts node is SchemaReferenceNode}
 *
 * @overload
 * @param {SchemaNode} node
 * @param {string} type
 * @returns {node is SchemaNode}
 *
 * @param {SchemaNode} node
 * @param {string} type
 * @returns {void}
 */
export const assertNodeType = (node, type) => {
  if (!isNodeType(node, type)) {
    throw Error("Invalid Schema");
  }
};
