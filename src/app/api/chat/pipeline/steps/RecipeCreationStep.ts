import { BaseStep } from '../BaseStep';
import { PipelineInput, PipelineOutput } from '../types';
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { CreateRecipeDTO } from '@/types/dtos';
import { logChainError, logDebug } from '@/utilities/logger';

const URL_REGEX = /https?:\/\/[^\s]+/i;

async function fetchPageText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PrepWise/1.0)' },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();

  // Remove script, style, and other non-content tags with their contents
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

  // Truncate to avoid exceeding context limits (~12k chars is plenty for a recipe page)
  return stripped.slice(0, 12000);
}

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.2,
  // Note: responseFormat is handled via prompt instructions for better compatibility
});

export class RecipeCreationStep extends BaseStep {
  constructor() {
    super('RecipeCreation');
  }

  async canExecute(input: PipelineInput): Promise<boolean> {
    // Execute if the topic classification detected recipe creation intent
    return input.classification === 'create-recipe';
  }

  async execute(input: PipelineInput): Promise<PipelineOutput> {
    this.logStepStart(input);
    const startTime = Date.now();

    try {
      // If the message contains a URL, fetch the page content and use that instead
      let sourceText = input.message;
      const urlMatch = input.message.match(URL_REGEX);
      if (urlMatch) {
        const url = urlMatch[0];
        try {
          const pageText = await fetchPageText(url);
          if (pageText.length < 200) {
            const result = "I couldn't read the content at that URL — the page may require JavaScript to load. Try copying and pasting the recipe text directly into the chat.";
            return this.createOutput(input, {
              result,
              metadata: { ...input.metadata, recipeCreationIntent: true, stepType: 'recipe-creation', stopPipeline: true }
            });
          }
          sourceText = pageText;
        } catch (fetchError) {
          const result = "I wasn't able to reach that URL. Please check the link and try again, or paste the recipe text directly.";
          logChainError(fetchError, `recipe-creation-fetch-${this.name}`);
          return this.createOutput(input, {
            result,
            metadata: { ...input.metadata, recipeCreationIntent: true, stepType: 'recipe-creation', stopPipeline: true }
          });
        }
      }

      const systemMessage = `You are a recipe extraction assistant. Extract recipe information from the provided text and return it as a JSON object.

If the text does not contain a recipe, return exactly: {"error": "not-a-recipe", "reason": "<brief description of what the page actually contains>"}

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
      "name": "string - ingredient name",
      "quantity": number - amount,
      "unit": "string - unit of measurement (e.g., 'cup', 'tbsp', 'oz', 'pieces')",
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

      const messages = [
        new SystemMessage(systemMessage),
        new HumanMessage(sourceText)
      ];

      const response = await llm.invoke(messages);
      const content = response?.content as string;
      
      // Log the raw content before parsing for debugging
      logDebug('RecipeCreationStep - Raw LLM Response', {
        stepName: this.name,
        sessionId: input.sessionId,
        contentLength: content?.length || 0,
        contentPreview: content?.substring(0, 500) || 'No content',
        fullContent: content // Include full content for debugging
      });
      console.error('=== RecipeCreationStep - Raw LLM Response ===');
      console.error('Content Length:', content?.length || 0);
      console.error('Content Type:', typeof content);
      console.error('Full Content:', content);
      console.error('===========================================');
      
      // Parse the JSON response
      let recipeData: CreateRecipeDTO;
      try {
        // Check if content is empty or null
        if (!content || content.trim() === '') {
          throw new Error('Empty content received from LLM');
        }

        recipeData = JSON.parse(content);

        // Check if the LLM signalled that the content isn't a recipe
        if ('error' in recipeData && (recipeData as Record<string, unknown>).error === 'not-a-recipe') {
          const reason = (recipeData as Record<string, unknown>).reason as string || 'unknown content';
          const result = `That URL doesn't appear to contain a recipe (${reason}). Try sharing a link that goes directly to a recipe page.`;
          return this.createOutput(input, {
            result,
            metadata: { ...input.metadata, recipeCreationIntent: true, stepType: 'recipe-creation', stopPipeline: true }
          });
        }

        // Console.log the JSON as requested (server-side)
        console.log('Recipe Creation JSON Response:', JSON.stringify(recipeData, null, 2));
        logDebug('RecipeCreationStep - Successfully Parsed JSON', {
          stepName: this.name,
          sessionId: input.sessionId,
          recipeTitle: recipeData?.title,
          ingredientsCount: recipeData?.ingredients?.length || 0,
          instructionsCount: recipeData?.instructions?.length || 0
        });
        
        // Return a simple message - the detailed summary will be shown in the hidden section of ChatForm
        const result = `I've created a recipe for **${recipeData.title || 'your recipe'}**! Check below to review and add it to your collection.`;
        
        const output = this.createOutput(input, {
          result,
          metadata: {
            ...input.metadata,
            recipeCreationIntent: true,
            stepType: 'recipe-creation',
            recipeData: recipeData,
            stopPipeline: true // Stop pipeline execution - we've handled the recipe creation intent
          }
        });

        this.logStepEnd(input, output, Date.now() - startTime);
        return output;
      } catch (parseError) {
        // Enhanced error logging for JSON parsing failures
        const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
        const errorStack = parseError instanceof Error ? parseError.stack : 'No stack trace available';
        
        logChainError(parseError, `recipe-creation-parse-${this.name}`);
        logDebug('RecipeCreationStep - JSON Parse Error Details', {
          stepName: this.name,
          sessionId: input.sessionId,
          errorMessage,
          errorStack,
          contentLength: content?.length || 0,
          contentType: typeof content,
          contentPreview: content?.substring(0, 1000) || 'No content',
          fullContent: content // Include full content in debug log
        });
        
        console.error('=== RecipeCreationStep - JSON Parse Error ===');
        console.error('Error Message:', errorMessage);
        console.error('Error Stack:', errorStack);
        console.error('Content Length:', content?.length || 0);
        console.error('Content Type:', typeof content);
        console.error('Content that failed to parse:');
        console.error(content);
        console.error('==========================================');
        
        // If JSON parsing fails, return a helpful message
        const result = "I understood you want to create a recipe, but I had trouble parsing the details. Could you provide more specific information about the recipe?";
        
        const output = this.createOutput(input, {
          result,
          error: `JSON parse error: ${errorMessage}`,
          metadata: {
            ...input.metadata,
            recipeCreationIntent: true,
            stepType: 'recipe-creation',
            parseError: errorMessage,
            stopPipeline: true
          }
        });

        this.logStepEnd(input, output, Date.now() - startTime);
        return output;
      }
    } catch (error) {
      return this.handleError(error, input);
    }
  }

}

