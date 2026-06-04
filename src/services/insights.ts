import { Transaction, Category } from '../types';
import { formatCurrency } from '../utils/formatCurrency';

export interface SpendingInsight {
  summary: string;
  tips: string[];
  topCategory: string;
  savingsOpportunity: string;
}

// Free tier: 14,400 req/day — get key at console.groq.com
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';

export async function getSpendingInsights(
  transactions: Transaction[],
  categories: Category[],
  totalIncome: number,
  totalExpenses: number,
): Promise<SpendingInsight> {
  if (!GROQ_API_KEY) throw new Error('EXPO_PUBLIC_GROQ_API_KEY not set');

  const expenses = transactions.filter((t) => t.type === 'expense');
  const byCategory = categories.map((c) => ({
    name: c.name,
    spent: expenses
      .filter((t) => t.categoryId === c.id)
      .reduce((s, t) => s + Math.abs(t.amount), 0),
    limit: c.monthlyLimit,
  }));

  const topCats = byCategory
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5)
    .map((c) => {
      const limitStr = c.limit ? ` (limit ${formatCurrency(c.limit)})` : '';
      return `${c.name}: ${formatCurrency(c.spent)}${limitStr}`;
    })
    .join(', ');

  const savingsRate = totalIncome > 0
    ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1)
    : '0';

  const prompt = `You are a personal finance advisor. Analyze this spending data and give concise actionable advice.

Income: ${formatCurrency(totalIncome)}
Expenses: ${formatCurrency(totalExpenses)}
Savings rate: ${savingsRate}%
Top categories: ${topCats}

Reply ONLY with this JSON (no markdown, no extra text):
{"summary":"2-sentence financial health summary","tips":["tip1","tip2","tip3"],"topCategory":"biggest spending category name","savingsOpportunity":"one specific actionable saving tip"}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.3,
    }),
  });

  if (!res.ok) throw new Error(`Groq API error: ${res.status}`);

  const data = await res.json() as { choices: { message: { content: string } }[] };
  const text = data.choices[0]?.message?.content ?? '{}';
  const jsonMatch = /\{[\s\S]*\}/.exec(text);
  if (!jsonMatch) throw new Error('Invalid AI response format');
  return JSON.parse(jsonMatch[0]) as SpendingInsight;
}
