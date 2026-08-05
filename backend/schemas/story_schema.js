const STORY_BOOK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    guardianStar: { type: "string" },
    guardianStarMeaning: { type: "string" },
    inspirationStar: { type: "string" },
    title: { type: "string" },
    openingNote: { type: "string" },
    story: { type: "string" },
    lullaby: { type: "string" },
    starMessage: { type: "string" },
    illustrations: {
      type: "array",
      minItems: 10,
      maxItems: 10,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          pageNumber: { type: "integer", minimum: 1, maximum: 10 },
          title: { type: "string" },
          text: { type: "string" },
          caption: { type: "string" },
          prompt: { type: "string" },
          hiddenDetails: {
            type: "array",
            minItems: 4,
            maxItems: 4,
            items: { type: "string" }
          }
        },
        required: [
          "pageNumber",
          "title",
          "text",
          "caption",
          "prompt",
          "hiddenDetails"
        ]
      }
    }
  },
  required: [
    "guardianStar",
    "guardianStarMeaning",
    "inspirationStar",
    "title",
    "openingNote",
    "story",
    "lullaby",
    "starMessage",
    "illustrations"
  ]
};

module.exports = {
  STORY_BOOK_SCHEMA,
};
