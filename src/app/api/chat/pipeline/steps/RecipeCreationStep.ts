import { BaseStep } from '../BaseStep';
import { PipelineInput, PipelineOutput } from '../types';
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { CreateRecipeDTO } from '@/types/dtos';

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.2,
  responseFormat: { type: "json_object" }
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
      const systemMessage = `You are a recipe extraction assistant. Extract recipe information from the user's message and return it as a JSON object matching this exact structure:

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
        new HumanMessage(input.message)
      ];

      const response = await llm.invoke(messages);
      const content = response?.content as string;
      
      // Parse the JSON response
      let recipeData: CreateRecipeDTO;
      try {
        recipeData = JSON.parse(content);
        
        // Console.log the JSON as requested (server-side)
        console.log('Recipe Creation JSON Response:', JSON.stringify(recipeData, null, 2));
        
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
        // If JSON parsing fails, return a helpful message
        const result = "I understood you want to create a recipe, but I had trouble parsing the details. Could you provide more specific information about the recipe?";
        
        const output = this.createOutput(input, {
          result,
          metadata: {
            ...input.metadata,
            recipeCreationIntent: true,
            stepType: 'recipe-creation',
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

