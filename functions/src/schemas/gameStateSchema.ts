export const gameStateSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://caspet-games.web.app/game-state.schema.json",
  title: "Game State",
  description: "A game state definition for CASPET-GAMES",
  type: "object",
  properties: {
    game: {
      type: "string",
      description: "Reference to the game",
      minLength: 1,
    },
    scenario: {
      type: "string",
      description: "Reference to the scenario",
      minLength: 1,
    },
    players: {
      type: "array",
      description: "Players in the game",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of the player",
          },
          isHuman: {
            type: "boolean",
            description: "Whether the player is human-controlled",
          },
          role: {
            type: "string",
            description: "The player's role",
          },
          faction: {
            type: "string",
            description: "The player's faction",
          },
          states: {
            type: "array",
            description: "Current states of the player",
            items: {
              type: "object",
              properties: {
                state: {
                  type: "string",
                  description: "Name of the state",
                },
                value: {
                  type: "string",
                  description: "Value of the state",
                },
              },
              required: ["state", "value"],
              additionalProperties: false,
            },
          },
          personality: {
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
          stateDescription: {
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
        required: ["name", "isHuman", "role", "faction", "states"],
        additionalProperties: false,
      },
    },
    round: {
      type: "integer",
      description: "Current round number",
      minimum: 0,
    },
    phase: {
      type: "string",
      description: "Current phase of the game",
    },
    details: {
      type: "array",
      description: "Additional details about the game state",
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
    messages: {
      type: "array",
      description: "Messages between players",
      items: {
        type: "object",
        properties: {
          to: {
            type: "string",
            description: "Recipient of the message",
          },
          from: {
            type: "string",
            description: "Sender of the message",
          },
          message: {
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
        required: ["to", "message"],
        additionalProperties: false,
      },
    },
    summaryPhase: {
      type: "object",
      description: "Summary of the current phase",
      properties: {
        html: {
          type: "string",
          description: "HTML formatted content",
        },
      },
      required: ["html"],
      additionalProperties: false,
    },
    nextPhasePrompt: {
      type: "object",
      description: "Prompt for the next phase",
      properties: {
        html: {
          type: "string",
          description: "HTML formatted content",
        },
      },
      required: ["html"],
      additionalProperties: false,
    },
    gameStates: {
      type: "array",
      description: "Current game states",
      items: {
        type: "object",
        properties: {
          gameState: {
            type: "string",
            description: "Name of the game state",
          },
          value: {
            type: "string",
            description: "Value of the state",
          },
        },
        required: ["gameState", "value"],
        additionalProperties: false,
      },
    },
  },
  required: [
    "game",
    "scenario",
    "players",
    "round",
    "phase",
    "messages",
    "summaryPhase",
    "nextPhasePrompt",
    "gameStates",
  ],
  additionalProperties: false,
};
