exports.DOWNLOAD_SCHEMA = {
  type: 'object',
  properties: {
    foldersIds: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'integer',
      },
    },
    filesIds: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'integer',
      },
    },
  },
}
