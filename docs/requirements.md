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

> 🔧 *Note: Recipes will be tied to authenticated users once the authentication system is implemented.*

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
      - It is associated with the authenticated user.
- **User Context Integration**:
  - Chat responses include user-specific context
  - User memory isolation for personalized conversations
  - Recipe modifications respect user ownership

### 🧪 Recipe Link Parsing
- If a user pastes a recipe URL:
  - The chat parses and reasons about the recipe content.
  - Offers to add the parsed recipe to the user’s recipes in structured format (as above).

---

## Near-Term Development Goals

### 🔐 Authentication System
- **Provider-Agnostic Authentication**: Support multiple authentication providers (FusionAuth, AWS Cognito) with easy switching
- **User Management**: 
  - User registration and login through authentication providers
  - Secure token management and session handling
  - User profile management with roles and permissions
- **Role-Based Access Control**:
  - Support for multiple user roles (user, admin, moderator, etc.)
  - Role-based route protection and UI components
  - Permission checking utilities and hooks
- **Database Integration**:
  - User model with roles array, external ID, and provider tracking
  - Recipe ownership with user relationships
  - Public/private recipe controls

### 👤 User Accounts & Recipe Ownership
- **User-Recipe Relationships**: 
  - Tie recipes to authenticated users
  - User-specific recipe filtering and management
  - Recipe privacy controls (public/private)
- **Recipe Management**:
  - Users can view, create, edit, and delete their own recipes
  - Recipe creation automatically associates with current user
  - User dashboard with personal recipe collections
- **Access Control**:
  - Users can only modify their own recipes
  - Public recipes visible to all users
  - Private recipes only visible to owner

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
- Authentication system will be implemented with provider-agnostic design
- User context will be integrated with chat system for personalized experiences
- For technical implementation details, see `ARCHITECTURE.md` and `docs/architecture/authentication-system.md`

