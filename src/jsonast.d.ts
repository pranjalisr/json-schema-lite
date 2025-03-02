export type Json = null | boolean | number | string | JsonArray | JsonObject;
export type JsonArray = Json[];
export type JsonObject = { [property: string]: Json };
