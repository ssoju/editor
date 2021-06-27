import { Node as ProsemirrorNode, Schema } from 'prosemirror-model'

import { ProsemirrorTransformer } from './types'

export const createJSONTransformer = (
  schema: Schema
): ProsemirrorTransformer<string> => {
  return {
    parse: (json: string) => {
      return ProsemirrorNode.fromJSON(schema, JSON.parse(json))
    },

    serialize: (doc: any) => {
      return JSON.stringify(doc.toJSON(), null, 2)
    },
  }
}
