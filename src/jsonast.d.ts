export type Json = null | boolean | number | string | JsonArray | JsonObject;
export type JsonArray = Json[];
export type JsonObject = { [property: string]: Json };

export type JsonNullNode = {
  type: "json";
  jsonType: "null";
  value: null;
};

export type JsonBooleanNode = {
  type: "json";
  jsonType: "boolean";
  value: boolean;
};

export type JsonNumberNode = {
  type: "json";
  jsonType: "number";
  value: number;
};

export type JsonStringNode = {
  type: "json";
  jsonType: "string";
  value: string;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface JsonArrayNode<T = JsonNode> {
  type: "json";
  jsonType: "array";
  children: T[];
};

export type JsonPropertyNameNode = {
  type: "json-property-name";
  value: string;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface JsonPropertyNode<T = JsonNode> {
  type: "json-property";
  children: [JsonPropertyNameNode, T];
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface JsonObjectNode<T = JsonNode> {
  type: "json";
  jsonType: "object";
  children: JsonPropertyNode<T>[];
};

export type JsonNode = JsonObjectNode
  | JsonArrayNode
  | JsonStringNode
  | JsonNumberNode
  | JsonBooleanNode
  | JsonNullNode;

export type SchemaReferenceNode = {
  type: "json-schema-reference";
  value: string;
};

export type SchemaNode = JsonObjectNode<SchemaNode>
  | JsonArrayNode<SchemaNode>
  | JsonStringNode
  | JsonNumberNode
  | JsonBooleanNode
  | JsonNullNode
  | SchemaReferenceNode;
