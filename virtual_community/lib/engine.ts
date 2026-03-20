type Vector = Record<string, number>;
type Action =
  | "ignore"
  | "like_question"
  | "answer"
  | "like_answer"
  | "reply_answer";

export function computeScore(
  personaVector: Vector,
  topicVector: Vector,
): number {
  let dot = 0;
  for (const dim of Object.keys(topicVector)) {
    dot += (personaVector[dim] ?? 0) * (topicVector[dim] ?? 0);
  }
  return dot;
}

export function sampleAction(
  score: number,
  hasExistingAnswers: boolean,
): Action {
  const p: Record<Action, number> = {
    ignore: 0.55,
    like_question: 0.2,
    answer: 0.15,
    like_answer: 0.0,
    reply_answer: 0.0,
  };

  if (hasExistingAnswers) {
    p.like_answer = 0.07;
    p.reply_answer = 0.03;
    p.ignore -= 0.1;
  }

  const absScore = Math.abs(score);
  if (absScore > 1.5) {
    p.answer += 0.2;
    p.reply_answer += 0.05;
    p.ignore -= 0.25;
  } else if (absScore > 0.8) {
    p.answer += 0.1;
    p.ignore -= 0.1;
  }

  return weightedSample(p);
}

// weighted random sample from a probability map (values need not sum to 1)
function weightedSample(weights: Record<Action, number>): Action {
  const entries = Object.entries(weights) as [Action, number][];
  const total = entries.reduce((sum, [, w]) => sum + Math.max(w, 0), 0);
  let r = Math.random() * total;
  for (const [action, weight] of entries) {
    r -= Math.max(weight, 0);
    if (r <= 0) return action;
  }
  return "ignore";
}

// pick a target answer to like/reply, weighted by like_count (higher likes = more likely)
export function pickTargetAnswer<T extends { _id: string; like_count: number }>(
  answers: T[],
): T {
  const weights = answers.map((a) => Math.max(a.like_count + 1, 1)); // +1 so 0-like answers still eligible
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < answers.length; i++) {
    r -= weights[i];
    if (r <= 0) return answers[i];
  }
  return answers[answers.length - 1];
}
