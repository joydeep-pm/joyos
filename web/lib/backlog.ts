import type { BacklogProcessResult, PotentialDuplicate, SuggestedTask, TaskDocument } from "@/lib/types";

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "with",
  "from",
  "up",
  "out",
  "into",
  "over"
]);

const CATEGORY_HINTS: Record<string, string[]> = {
  outreach: ["email", "follow", "call", "meet", "reach", "contact"],
  technical: ["api", "bug", "fix", "deploy", "middleware", "integration", "build"],
  research: ["research", "analyze", "explore", "investigate", "study"],
  writing: ["write", "draft", "doc", "brief", "spec"],
  admin: ["okr", "review", "report", "schedule", "expense"],
  content: ["post", "blog", "linkedin", "social"],
  personal: ["health", "gym", "routine", "family"]
};

export function parseBacklogItems(raw: string): string[] {
  const items = raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim())
    .filter(Boolean);

  return [...new Set(items)];
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);

  const intersection = [...setA].filter((item) => setB.has(item)).length;
  const union = new Set([...setA, ...setB]).size;

  return union === 0 ? 0 : intersection / union;
}

function diceCoefficient(a: string, b: string): number {
  const inputA = a.toLowerCase();
  const inputB = b.toLowerCase();

  if (inputA.length < 2 || inputB.length < 2) return 0;

  const bigrams = (value: string) => {
    const set = new Set<string>();
    for (let i = 0; i < value.length - 1; i += 1) {
      set.add(value.slice(i, i + 2));
    }
    return set;
  };

  const aPairs = bigrams(inputA);
  const bPairs = bigrams(inputB);
  const overlap = [...aPairs].filter((pair) => bPairs.has(pair)).length;

  return (2 * overlap) / (aPairs.size + bPairs.size);
}

function similarity(item: string, title: string): number {
  const tokenScore = jaccard(tokenize(item), tokenize(title));
  const textScore = diceCoefficient(item, title);

  return Number((textScore * 0.7 + tokenScore * 0.3).toFixed(2));
}

function isAmbiguous(item: string): boolean {
  const text = item.toLowerCase().trim();
  const wordCount = text.split(/\s+/).length;

  if (wordCount <= 2) return true;

  const vaguePatterns = [
    /^(fix|update|check|review|improve)\s+\w+$/,
    /^\w+\s+(thing|stuff|issue|problem)$/,
    /^(follow up|email|contact|reach out)$/,
    /^(research|investigate|explore)\s+\w{1,15}$/
  ];

  return vaguePatterns.some((pattern) => pattern.test(text));
}

function clarificationQuestions(item: string): string[] {
  const text = item.toLowerCase();

  if (/(fix|bug|error|issue)/.test(text)) {
    return [
      "Which specific problem is this addressing?",
      "What is the expected fix outcome?"
    ];
  }

  if (/(follow up|email|reach out|contact)/.test(text)) {
    return ["Who is the target contact?", "What result should this outreach produce?"];
  }

  if (/(research|investigate|explore)/.test(text)) {
    return [
      "What question should this research answer?",
      "Which decision will this research inform?"
    ];
  }

  return [
    "What does done look like for this item?",
    "What specific next action should happen first?"
  ];
}

export function guessCategory(item: string): string {
  const text = item.toLowerCase();

  for (const [category, hints] of Object.entries(CATEGORY_HINTS)) {
    if (hints.some((hint) => text.includes(hint))) {
      return category;
    }
  }

  return "other";
}

function findDuplicates(item: string, tasks: TaskDocument[]): PotentialDuplicate | null {
  const similarTasks = tasks
    .filter((task) => task.frontmatter.status !== "d")
    .map((task) => ({
      title: task.frontmatter.title,
      filename: task.filename,
      category: task.frontmatter.category,
      status: task.frontmatter.status,
      similarity_score: similarity(item, task.frontmatter.title)
    }))
    .filter((entry) => entry.similarity_score >= 0.6)
    .sort((left, right) => right.similarity_score - left.similarity_score)
    .slice(0, 3);

  if (similarTasks.length === 0) return null;

  return {
    item,
    similar_tasks: similarTasks,
    recommended_action: similarTasks[0]?.similarity_score > 0.8 ? "merge" : "review"
  };
}

export function processBacklog(items: string[], tasks: TaskDocument[]): BacklogProcessResult {
  const result: BacklogProcessResult = {
    new_tasks: [],
    potential_duplicates: [],
    needs_clarification: [],
    auto_created: [],
    summary: {
      total_items: items.length,
      new_tasks: 0,
      duplicates_found: 0,
      needs_clarification: 0,
      auto_created: 0,
      recommendations: []
    }
  };

  for (const item of items) {
    const duplicate = findDuplicates(item, tasks);

    if (duplicate) {
      result.potential_duplicates.push(duplicate);
      continue;
    }

    if (isAmbiguous(item)) {
      result.needs_clarification.push({
        item,
        questions: clarificationQuestions(item),
        suggestions: [
          "Add a clear deliverable.",
          "Include owner or stakeholders.",
          "Specify timeline or urgency."
        ]
      });
      continue;
    }

    const suggestion: SuggestedTask = {
      item,
      suggested_category: guessCategory(item),
      suggested_priority: "P2",
      ready_to_create: true
    };

    result.new_tasks.push(suggestion);
  }

  result.summary.new_tasks = result.new_tasks.length;
  result.summary.duplicates_found = result.potential_duplicates.length;
  result.summary.needs_clarification = result.needs_clarification.length;

  if (result.potential_duplicates.length > 0) {
    result.summary.recommendations.push(
      `Review ${result.potential_duplicates.length} potential duplicates before creating tasks.`
    );
  }

  if (result.needs_clarification.length > 0) {
    result.summary.recommendations.push(
      `Clarify ${result.needs_clarification.length} ambiguous items for cleaner execution.`
    );
  }

  if (result.new_tasks.length > 0) {
    result.summary.recommendations.push(
      `${result.new_tasks.length} items are ready to convert into tasks.`
    );
  }

  return result;
}
