export interface FlagOutput {
    valid: boolean
  }
  
  export interface BasicOutput extends FlagOutput {
    absoluteKeywordLocation: string
    instanceLocation: string
    keywordLocation?: string
  }
  
  export type Output = BasicOutput
  
  