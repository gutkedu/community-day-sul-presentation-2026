export type OpeningKind = 'system' | 'questions' | 'trace'

const maxSteps: Record<OpeningKind, number> = { system: 1, questions: 2, trace: 4 }
const questions = ['Eu via a conexão.', 'Pede uma ação ou conta um fato?', 'Quem decide? Quem reage?']
const explanations = ['Faltava entender o significado daquela interação.', 'Uma seta não distingue esses dois papéis.', 'Eu precisava entender a responsabilidade de cada serviço.']

export function openingAt(kind: OpeningKind, rawStep: number) {
  // A saved URL or hot-reloaded tab can still carry the previous click count.
  const step = Math.min(maxSteps[kind], Math.max(0, Number.isFinite(rawStep) ? Math.trunc(rawStep) : 0))
  const questionStep = Math.min(step, questions.length - 1)
  return { step, question: questions[questionStep], explanation: explanations[questionStep] }
}
