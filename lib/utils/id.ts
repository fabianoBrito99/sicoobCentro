export const createProjectId = () => {
  const ts = Date.now();
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${ts}-${suffix}`;
};

export const createQuestionId = () => {
  const suffix = Math.random().toString(36).slice(2, 7);
  return `q-${suffix}`;
};
