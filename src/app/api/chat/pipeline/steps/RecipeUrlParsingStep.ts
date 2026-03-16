import { BaseStep } from '../BaseStep';
import { PipelineInput, PipelineOutput } from '../types';
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { CreateRecipeDTO } from '@/types/dtos';
import { logChainError, logDebug } from '@/utilities/logger';

const URL_REGEX = /https?:\/\/[^\s]+/i;

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.2,
});

const SYSTEM_MESSAGE = `You are a recipe extraction assistant. Extract recipe information from the provided web page text and return it as a JSON object.

If the page does not contain a recipe, return exactly:
{"error": "not-a-recipe", "reason": "<brief description of what the page actually contains>"}

Otherwise return a JSON object matching this exact structure:

{
  "title": "string - recipe name",
  "description": "string - brief description",
  "yield": "string - serving size (e.g., '4 servings', '12 cookies')",
  "prepTime": number - preparation time in minutes,
  "cookTime": number - cooking time in minutes,
  "totalTime": number - total time in minutes,
  "ingredients": [
    {
      "name": "string - ingredient name only, no quantities or descriptors",
      "quantity": number - amount,
      "unit": "string - unit of measurement OR size descriptor. Use standard units for measured ingredients (e.g., 'cup', 'tbsp', 'oz', 'g', 'ml'). Use size descriptors for counted ingredients (e.g., 'medium', 'large', 'small', 'clove', 'head', 'bunch', 'sprig'). Leave empty string for ingredients that need no descriptor (e.g., eggs, bay leaves).",
      "notes": "string - optional additional notes"
    }
  ],
  "instructions": ["string - step by step instructions"],
  "nutrition": {
    "calories": number,
    "protein": number - grams,
    "fat": number - grams,
    "fiber": number - grams,
    "carbohydrates": number - grams,
    "sugar": number - grams
  },
  "dietary": {"gluten-free": boolean, "vegan": boolean, "vegetarian": boolean, etc.},
  "tags": ["string - recipe tags/categories"]
}

Important:
- If information is missing, make reasonable estimates or use sensible defaults (e.g., 0 for times if not specified)
- For nutrition, provide estimates based on ingredients if not specified
- Return ONLY valid JSON, no additional text
- Ensure all required fields are present`;

async function fetchPageText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PrepWise/1.0)' },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();

  const stripped = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Truncate to avoid exceeding context limits
  return stripped.slice(0, 12000);
}

export class RecipeUrlParsingStep extends BaseStep {
  constructor() {
    super('RecipeUrlParsing');
  }

  async canExecute(input: PipelineInput): Promise<boolean> {
    return input.classification === 'parse-recipe-url';
  }

  async execute(input: PipelineInput): Promise<PipelineOutput> {
    this.logStepStart(input);
    const startTime = Date.now();

    const stopMeta = { ...input.metadata, recipeCreationIntent: true, stepType: 'recipe-creation', stopPipeline: true };

    try {
      const urlMatch = input.message.match(URL_REGEX);
      if (!urlMatch) {
        return this.createOutput(input, {
          result: "I couldn't find a URL in your message. Please paste the full link starting with https://",
          metadata: stopMeta
        });
      }

      const url = urlMatch[0];
      let pageText: string;

      try {
        pageText = await fetchPageText(url);
      } catch (fetchError) {
        logChainError(fetchError, `recipe-url-fetch-${this.name}`);
        return this.createOutput(input, {
          result: "I wasn't able to reach that URL. Please check the link and try again, or paste the recipe text directly into the chat.",
          metadata: stopMeta
        });
      }

      if (pageText.length < 200) {
        return this.createOutput(input, {
          result: "I couldn't read the content at that URL — the page may require JavaScript to load. Try copying and pasting the recipe text directly into the chat.",
          metadata: stopMeta
        });
      }

      const response = await llm.invoke([
        new SystemMessage(SYSTEM_MESSAGE),
        new HumanMessage(pageText)
      ]);
      const content = response?.content as string;

      logDebug('RecipeUrlParsingStep - Raw LLM Response', {
        stepName: this.name,
        sessionId: input.sessionId,
        contentLength: content?.length || 0,
        contentPreview: content?.substring(0, 500) || 'No content',
      });

      try {
        if (!content || content.trim() === '') {
          throw new Error('Empty content received from LLM');
        }

        const parsed = JSON.parse(content);

        if ('error' in parsed && parsed.error === 'not-a-recipe') {
          const reason = parsed.reason || 'the page doesn\'t appear to contain a recipe';
          return this.createOutput(input, {
            result: `I don't see a recipe on that page — ${reason}. Try sharing a link that goes directly to a recipe.`,
            metadata: stopMeta
          });
        }

        const recipeData = parsed as CreateRecipeDTO;
        logDebug('RecipeUrlParsingStep - Successfully Parsed JSON', {
          stepName: this.name,
          sessionId: input.sessionId,
          recipeTitle: recipeData?.title,
          ingredientsCount: recipeData?.ingredients?.length || 0,
        });

        const result = `I found a recipe for **${recipeData.title || 'your recipe'}**! Check below to review and add it to your collection.`;
        const output = this.createOutput(input, {
          result,
          metadata: { ...stopMeta, recipeData }
        });

        this.logStepEnd(input, output, Date.now() - startTime);
        return output;
      } catch (parseError) {
        const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
        logChainError(parseError, `recipe-url-parse-${this.name}`);

        const output = this.createOutput(input, {
          result: "I found the page but had trouble reading the recipe from it. Try copying and pasting the recipe text directly into the chat.",
          error: `JSON parse error: ${errorMessage}`,
          metadata: stopMeta
        });

        this.logStepEnd(input, output, Date.now() - startTime);
        return output;
      }
    } catch (error) {
      return this.handleError(error, input);
    }
  }
}
