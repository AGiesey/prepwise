import { BaseStep } from '../BaseStep';
import { PipelineInput, PipelineOutput } from '../types';
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { CreateRecipeDTO } from '@/types/dtos';
import { logChainError, logDebug } from '@/utilities/logger';

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.2,
});

const SYSTEM_MESSAGE = `You are a recipe creation assistant. Create a complete recipe based on the user's request and return it as a JSON object matching this exact structure:

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
- Use sensible defaults for any unspecified details (e.g., 0 for times if not applicable)
- Estimate nutrition based on ingredients
- Return ONLY valid JSON, no additional text
- Ensure all required fields are present`;

export class RecipeCreationStep extends BaseStep {
  constructor() {
    super('RecipeCreation');
  }

  async canExecute(input: PipelineInput): Promise<boolean> {
    return input.classification === 'create-recipe';
  }

  async execute(input: PipelineInput): Promise<PipelineOutput> {
    this.logStepStart(input);
    const startTime = Date.now();

    try {
      const response = await llm.invoke([
        new SystemMessage(SYSTEM_MESSAGE),
        new HumanMessage(input.message)
      ]);
      const content = response?.content as string;

      logDebug('RecipeCreationStep - Raw LLM Response', {
        stepName: this.name,
        sessionId: input.sessionId,
        contentLength: content?.length || 0,
        contentPreview: content?.substring(0, 500) || 'No content',
        fullContent: content
      });

      let recipeData: CreateRecipeDTO;
      try {
        if (!content || content.trim() === '') {
          throw new Error('Empty content received from LLM');
        }

        recipeData = JSON.parse(content);

        console.log('Recipe Creation JSON Response:', JSON.stringify(recipeData, null, 2));
        logDebug('RecipeCreationStep - Successfully Parsed JSON', {
          stepName: this.name,
          sessionId: input.sessionId,
          recipeTitle: recipeData?.title,
          ingredientsCount: recipeData?.ingredients?.length || 0,
          instructionsCount: recipeData?.instructions?.length || 0
        });

        const result = `I've created a recipe for **${recipeData.title || 'your recipe'}**! Check below to review and add it to your collection.`;

        const output = this.createOutput(input, {
          result,
          metadata: {
            ...input.metadata,
            recipeCreationIntent: true,
            stepType: 'recipe-creation',
            recipeData: recipeData,
            stopPipeline: true
          }
        });

        this.logStepEnd(input, output, Date.now() - startTime);
        return output;
      } catch (parseError) {
        const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
        logChainError(parseError, `recipe-creation-parse-${this.name}`);

        const output = this.createOutput(input, {
          result: "I understood you want to create a recipe, but I had trouble formatting the details. Could you describe what you'd like to make?",
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
