export const gameSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://caspet-games.web.app/game.schema.json",
  title: "Game",
  description: "A game definition for CASPET-GAMES",
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "Title of the game",
      minLength: 1,
    },
    playerCount: {
      type: "object",
      description: "Number of players required for this game",
      properties: {
        min: {
          type: "integer",
          description: "Minimum number of players",
          minimum: 1,
        },
        max: {
          type: "integer",
          description: "Maximum number of players",
          minimum: 1,
        },
      },
      required: ["min", "max"],
      additionalProperties: false,
    },
    overview: {
      type: "object",
      description: "HTML overview of the game",
      properties: {
        html: {
          type: "string",
          description: "HTML formatted content",
        },
      },
      required: ["html"],
      additionalProperties: false,
    },
    setup: {
      type: "string",
      description: "Setup instructions for the game",
    },
    phases: {
      type: "array",
      description: "Phases of the game",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of the phase",
          },
          description: {
            type: "object",
            properties: {
              html: {
                type: "string",
                description: "HTML formatted content",
              },
            },
            required: ["html"],
            additionalProperties: false,
          },
        },
        required: ["name", "description"],
        additionalProperties: false,
      },
    },
    winConditions: {
      type: "array",
      description: "Win conditions for the game",
      items: {
        type: "object",
        properties: {
          faction: {
            type: "string",
            description: "The faction this win condition applies to",
          },
          description: {
            type: "object",
            properties: {
              html: {
                type: "string",
                description: "HTML formatted content",
              },
            },
            required: ["html"],
            additionalProperties: false,
          },
        },
        required: ["faction", "description"],
        additionalProperties: false,
      },
    },
    rules: {
      type: "array",
      description: "Game rules in HTML format",
      items: {
        type: "object",
        properties: {
          html: {
            type: "string",
            description: "HTML formatted content",
          },
        },
        required: ["html"],
        additionalProperties: false,
      },
    },
    factions: {
      type: "array",
      description: "Factions in the game",
      items: {
        type: "string",
        description: "A faction in the game",
      },
    },
    roles: {
      type: "array",
      description: "Roles in the game",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of the role",
          },
          description: {
            type: "object",
            properties: {
              html: {
                type: "string",
                description: "HTML formatted content",
              },
            },
            required: ["html"],
            additionalProperties: false,
          },
          abilities: {
            type: "array",
            description: "Abilities of this role",
            items: {
              type: "string",
              description: "An ability of this role",
            },
          },
          optional: {
            type: "boolean",
            description: "Whether this role is optional in the game",
          },
          faction: {
            type: "string",
            description: "The faction this role belongs to",
          },
        },
        required: ["name", "description", "abilities", "optional"],
        additionalProperties: false,
      },
    },
    moderatorFeatures: {
      type: "array",
      description: "Moderator features available",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of the feature",
          },
          description: {
            type: "object",
            properties: {
              html: {
                type: "string",
                description: "HTML formatted content",
              },
            },
            required: ["html"],
            additionalProperties: false,
          },
        },
        required: ["name", "description"],
        additionalProperties: false,
      },
    },
    additionalNotes: {
      type: "array",
      description: "Additional notes about the game",
      items: {
        type: "string",
        description: "An additional note",
      },
    },
  },
  required: ["title", "playerCount", "overview", "rules"],
  additionalProperties: false,
};

