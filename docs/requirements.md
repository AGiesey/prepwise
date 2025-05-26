# Kitchen AI App Requirements

## Overview

This is a Next.js web application that helps users manage and interact with their recipes using a natural language interface powered by LangChain. It includes the ability to add, edit, and delete recipes, and to ask questions about recipes through an AI chat system.

---

## Current Features

### ✅ Recipe Management
- Users can:
  - Add new recipes manually.
  - Edit and delete existing recipes.
- Recipes are currently stored as structured JSON.
- Each recipe contains:
  - Title, description
  - Yield, prep/cook/total times
  - Ingredients with quantities and notes
  - Step-by-step instructions
  - Nutrition information
  - Dietary restriction tags
  - Tags that help users group recipes

> 🔧 *Note: Recipes are not yet tied to users.*

---

### ✅ AI Chat Interface (LangChain-powered)
- Chat determines the type of user question:
  - If it **relates to the current recipe being viewed** → the recipe is passed as context to the LLM.
  - If it's **food-related but not about the current recipe** → the LLM is called without recipe context.
  - If it's **not food-related** → no LLM call is made.
- Prompt routing logic is handled in the backend (`/chat/route.ts`) with support files to encapsulate different chains.

---

## In-Progress / Planned Features

### 🧪 Recipe-Aware Chat Actions
- Chat will be able to:
  - Modify the current recipe to match user needs (e.g. “make it vegan”, “remove dairy”).
  - Respond with a **modified recipe in structured JSON**.
  - Suggest saving the new recipe: _“Would you like me to add this recipe to your recipes?”_
    - If the user says yes:
      - A new recipe is created.
      - A new title is auto-generated.
      - It is inserted into the database.
      - (Once user model is implemented) It is associated with the correct user.

### 🧪 Recipe Link Parsing
- If a user pastes a recipe URL:
  - The chat parses and reasons about the recipe content.
  - Offers to add the parsed recipe to the user’s recipes in structured format (as above).

---

## Near-Term Development Goals

### 👤 User Accounts & Sharing
- Create a `users` table and a join table between `users` and `recipes`.
- Allow users to:
  - View their own recipes.
  - Share recipes with other users.
- (Design still evolving) Possibly include:
  - Permission types (e.g., view-only, editable)
  - Friend or group structures

---

## Future Features (Not Yet Started)

### 🧭 Meal Planning
- Allow users to plan meals by day/week
- Link meals to existing saved recipes

### 🛒 Grocery List Generation
- Convert planned meals into an aggregated shopping list
- Support quantity merging (e.g., combine total eggs across meals)

### 🧂 Pantry Inventory
- Track what ingredients the user currently has on hand
- Suggest recipes based on pantry contents

---

## Notes for Cursor
- All LangChain-related logic lives in the `/chat` directory
- Chains are separated by purpose: `runRecipePromptChain`, `runGeneralCookingChain`, etc.
- Recipes will soon be tied to users, so database changes should be expected
- For technical implementation details, see `ARCHITECTURE.md`

