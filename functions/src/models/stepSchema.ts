import {Type} from "@google/genai";

export const stepSchema = {
  type: Type.OBJECT,
  properties: {
    name: {type: Type.STRING},
    privates: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          player: {type: Type.STRING},
          message: {type: Type.STRING},
        },
        required: ["player", "message"],
      },
    },
    publics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          message: {type: Type.STRING},
        },
        required: ["message"],
      },
    },
    actions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: {type: Type.STRING},
          description: {type: Type.STRING},
          format: {type: Type.STRING},
          targets: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: {type: Type.STRING},
                secondTargets: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.STRING,
                  },
                },
              },
              required: ["name"],
            },
          },
          players: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
          dice: {
            type: Type.OBJECT,
            properties: {
              type: {type: Type.STRING},
              amount: {type: Type.NUMBER},
              successConditions: {type: Type.STRING},
              effects: {type: Type.STRING},
            },
            required: ["type", "amount", "effects"],
          },
        },
        required: ["name", "description", "format", "players"],
      },
    },
    characters: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: {type: Type.STRING},
          type: {type: Type.STRING},
          history: {type: Type.STRING},
        },
        required: ["name", "type", "history"],
      },
    },
    locations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: {type: Type.STRING},
          type: {type: Type.STRING},
          details: {type: Type.STRING},
        },
        required: ["name", "type", "details"],
      },
    },
    events: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: {type: Type.STRING},
          explanation: {type: Type.STRING},
        },
        required: ["description"],
      },
    },
    progressPercentage: {type: Type.NUMBER},
  },
  required: ["name", "progressPercentage"],
};
