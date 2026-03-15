# AI Recipe Creation and Modification Capabilities

## Status
In Progress — `RecipeCreationStep` implemented; modification and URL parsing pending

## Context
Currently, recipe creation in PrepWise is extremely manual and time-consuming. Users must:
- Manually add each ingredient with separate fields for quantity, unit, and name
- Add instructions one by one
- Manually enter nutrition information
- Spend 5+ minutes creating a single recipe

The chat system can answer questions about recipes and cooking, but does not help users create or modify recipes. This represents a significant missed opportunity to leverage AI for the most time-consuming task in the application.

Additionally, users cannot quickly add recipes from URLs, pasted text, or natural language descriptions, further limiting the speed and ease of recipe management.

## Decision
We will add AI-powered recipe creation and modification capabilities to the chat system, enabling users to:

1. **Create recipes via natural language** - Users can describe recipes in chat (e.g., "create a recipe for chocolate chip cookies") and the AI will extract structured recipe data
2. **Modify existing recipes via chat** - Users viewing a recipe can request modifications (e.g., "make this vegan", "double the recipe") and save the modified version
3. **Parse recipes from URLs and text** - Users can paste recipe URLs or text and have them automatically parsed into structured format
4. **Interactive recipe building** - AI can ask clarifying questions when information is incomplete

This will be implemented as new pipeline steps in the existing pipeline architecture:
- `RecipeCreationStep` - Detects recipe creation intent and parses recipes from natural language
- `RecipeModificationStep` - Detects modification intent and transforms existing recipes

Both steps will use OpenAI structured outputs to extract recipe data matching the existing `RecipeDTO` schema, integrating with the current `RecipeService` for persistence.

## Consequences

### Positive
- **Dramatically faster recipe creation** - Reduces recipe creation time from 5+ minutes to < 30 seconds
- **Better user experience** - Natural language interface is more intuitive than manual form entry
- **Leverages existing architecture** - Builds on pipeline pattern without requiring major refactoring
- **Preserves existing functionality** - Manual recipe creation via form remains available
- **Enables new workflows** - Users can quickly add recipes from URLs, text, or descriptions
- **Recipe modification capability** - Users can easily create recipe variations
- **High success rate expected** - Structured outputs provide reliable recipe extraction

### Negative
- **Increased API costs** - More LLM calls for recipe parsing and modification
- **Additional complexity** - New pipeline steps and chains to maintain
- **Dependency on AI accuracy** - Recipe extraction may sometimes require user clarification
- **Need for validation** - Must validate AI-extracted recipes before saving
- **Potential for incomplete data** - Some recipes may lack nutrition info or other optional fields
- **Error handling complexity** - Must gracefully handle parsing failures

## Alternatives Considered

1. **Manual form improvements only**
   - Rejected because it doesn't fundamentally solve the time-consuming nature of manual entry
   - Still requires users to manually structure recipe data

2. **Recipe import from URLs only**
   - Rejected because it's too limited - users also want to describe recipes naturally
   - Doesn't solve the core problem of slow recipe creation

3. **Separate AI recipe creation interface**
   - Rejected because it fragments the user experience
   - Chat is already the natural place for AI interactions
   - Would require duplicating AI capabilities

4. **Function calling instead of structured outputs**
   - Rejected because structured outputs are more reliable for complex nested data like recipes
   - Structured outputs provide better schema validation
   - More predictable parsing results

5. **External recipe parsing service**
   - Rejected due to cost and vendor lock-in concerns
   - Want to keep control over recipe parsing logic
   - Prefer to leverage existing OpenAI integration

## Implementation Notes

### Pipeline Integration
- Add `RecipeCreationStep` early in pipeline (before response steps)
- Add `RecipeModificationStep` when recipe context is available
- Steps use `canExecute` to detect intent before running
- Only proceed to response steps if no recipe action detected

### Recipe Parsing
- Use OpenAI structured outputs with JSON schema matching `CreateRecipeDTO`
- Define Zod schema for validation
- Extract: title, description, ingredients (quantity/unit/name/notes), instructions, times, nutrition estimates
- Handle incomplete information with clarifying questions

### Recipe Modification
- Always save modified recipes as new recipes (preserve originals)
- Generate descriptive titles (e.g., "Chocolate Chip Cookies (Vegan)")
- Support common modifications: dietary restrictions, scaling, substitutions
- Use same structured output approach as recipe creation

### Error Handling
- Graceful degradation if parsing fails
- Fall back to asking user for clarification
- Validate recipes before saving
- Support multi-turn conversations for missing details

### User Experience
- Show recipe preview before saving
- Allow editing after AI generation
- Support seamless transition from AI to manual editing
- Clear feedback during processing

### Implementation Phases
1. Phase 1: AI recipe creation via natural language (highest impact)
2. Phase 2: Recipe modification via chat
3. Phase 3: URL/text parsing (builds on Phase 1)
4. Phase 4: UI enhancements for preview/editing
5. Phase 5: Improved Q&A prompts (can happen in parallel)

