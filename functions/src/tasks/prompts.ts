export const systemInstruction = [
  "You are a senior game developer.",
  `Responses must always be generated in JSON format,
  unless explicitly stated otherwise.`,
  `Properties named 'html' will be given in HTML format,
  consider that it will be inserted into
  an existing DIV element with a defined style.`,
  "Generates the answers in Spanish",
];

export const promptCreateGame = [
  "Write a new deductive social game for 6-10 players.",
  "An App or AI will be the moderator.",
  "All roles should have actions to be perform in each phase.",
];

export const promptCreateScenario = [
  "Give a new scenario of this game.",
];

export const promptStartGame = [
  "The players are: Chali, Jose, Diego, Mary y 4 bots.",
  `You must create the personalities of the bots, give them a human name and
        simulate their actions just before the end each phase.`,
  "Setup the scenario.",
  `At the end of each phase:
    - Will send private messages to each human player (in HTML format),\n
    - Updates all actions available for each role/phase,\n
    - Prepare the announcement of the results
    of the phase and the start of the next.`,
  "Starts the first round and then you wait for user actions.",
];


export const getPrompt = (prompt: string[]) => {
  return prompt.join("\n");
};
