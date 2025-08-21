export const scenarioSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://caspet-games.web.app/scenario.schema.json",
  title: "Scenario",
  description: "A scenario definition for CASPET-GAMES",
  type: "object",
  properties: {
    game: {
      type: "string",
      description: "Reference to the game this scenario belongs to",
      minLength: 1,
    },
    title: {
      type: "string",
      description: "Title of the scenario",
      minLength: 1,
    },
    description: {
      type: "object",
      description: "HTML description of the scenario",
      properties: {
        html: {
          type: "string",
          description: "HTML formatted content",
        },
      },
      required: ["html"],
      additionalProperties: false,
    },
    recommendedNumPlayers: {
      type: "integer",
      description: "Recommended number of players for this scenario",
      minimum: 1,
    },
    rules: {
      type: "array",
      description: "Scenario-specific rules in HTML format",
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
    phases: {
      type: "array",
      description: "Phases specific to this scenario",
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
      description: "Win conditions for this scenario",
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
    factions: {
      type: "array",
      description: "Factions in this scenario",
      items: {
        type: "string",
        description: "A faction in the scenario",
      },
    },
    roles: {
      type: "array",
      description: "Roles in this scenario",
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
            description: "Whether this role is optional in the scenario",
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
      description: "Moderator features for this scenario",
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
      description: "Additional notes about the scenario",
      items: {
        type: "string",
        description: "An additional note",
      },
    },
    gameStates: {
      type: "array",
      description: "Game state definitions for this scenario",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of the game state",
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
          values: {
            type: "array",
            description: "Possible values for this game state",
            items: {
              type: "string",
              description: "A possible value",
            },
          },
        },
        required: ["name", "description", "values"],
        additionalProperties: false,
      },
    },
    playerStates: {
      type: "array",
      description: "Player state definitions for this scenario",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of the player state",
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
          values: {
            type: "array",
            description: "Possible values for this player state",
            items: {
              type: "string",
              description: "A possible value",
            },
          },
        },
        required: ["name", "description", "values"],
        additionalProperties: false,
      },
    },
    actions: {
      type: "array",
      description: "Actions available in this scenario",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of the action",
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
          effect: {
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
          phases: {
            type: "array",
            description: "Phases when this action can be performed",
            items: {
              type: "string",
              description: "A phase when this action can be performed",
            },
          },
          roles: {
            type: "array",
            description: "Roles that can perform this action",
            items: {
              type: "string",
              description: "A role that can perform this action",
            },
          },
          playerStatesConditions: {
            type: "array",
            description: "Conditions on player states for this action",
            items: {
              type: "object",
              properties: {
                playerState: {
                  type: "string",
                  description: "Name of the player state",
                },
                value: {
                  type: "string",
                  description: "Value of the player state",
                },
              },
              required: ["playerState", "value"],
              additionalProperties: false,
            },
          },
        },
        required: ["name", "description", "effect", "phases", "roles"],
        additionalProperties: false,
      },
    },
  },
  required: [
    "game",
    "title",
    "description",
    "actions",
    "gameStates",
    "playerStates",
  ],
  additionalProperties: false,
};
