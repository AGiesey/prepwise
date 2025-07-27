# PrepWise Architecture

> **Note**: This document describes the architecture for our recipe management application. While currently named "PrepWise", the application name may change in the future. The architectural decisions and patterns described here will remain applicable regardless of the final product name.


## Overview

PrepWise is built on a pipeline-based architecture that orchestrates multiple LangChain-powered conversation chains. The system is designed to provide a natural, context-aware chat experience while maintaining scalability and extensibility.

### Core Architectural Components

1. **Authentication System**
   - Provider-agnostic authentication with third-party services
   - Supports FusionAuth, AWS Cognito, and mock providers
   - Secure token management and session handling
   - User ownership and access control for recipes
   - Easy provider swapping via environment variables

2. **Pipeline Orchestration**
   - Implements a linear pipeline pattern for chain management
   - Each chain operates as an independent pipeline step
   - Enables clear data flow and easy addition of new capabilities
   - Supports both sequential and conditional execution paths

3. **Memory Management**
   - Multi-layered memory system combining:
     - Short-term conversation buffer
     - Long-term conversation summaries
     - Entity tracking for recipes and ingredients
   - Vector-based storage using Redis Stack for semantic search
   - Enables context-aware responses across conversation history
   - User-specific memory isolation and context

4. **Chain Types**
   - Topic Classification Chain: Routes queries to appropriate handlers
   - Context-Specific Chain: Handles recipe-specific queries
   - General Cooking Chain: Manages food-related queries
   - Recipe Modification Chain: Handles recipe transformations
   - (Extensible for future chain types)

### Key Design Decisions

1. **Authentication Provider Pattern**
   - Chosen for flexibility and security
   - Enables easy switching between authentication services
   - Provides consistent API regardless of underlying provider
   - Supports development with mock providers
   - Leverages battle-tested authentication services

2. **Pipeline Pattern**
   - Chosen for its simplicity and extensibility
   - Enables clear separation of concerns
   - Supports easy testing and maintenance
   - Allows for future parallel processing

3. **Redis Stack Integration**
   - Provides vector storage for semantic search
   - Enables real-time conversation history access
   - Supports efficient memory management
   - Allows for future scaling

4. **Memory System Design**
   - Combines multiple memory types for comprehensive context
   - Uses vector embeddings for semantic similarity
   - Implements cleanup policies for resource management
   - Supports future memory type additions
   - Includes user-specific memory isolation

### System Goals

1. **Security & Privacy**
   - Secure user authentication and authorization
   - User data isolation and privacy protection
   - Secure token management and session handling
   - Compliance with data protection regulations

2. **Scalability**
   - Support multiple concurrent users
   - Handle growing conversation histories
   - Maintain performance with increased data
   - Scale authentication across multiple providers

3. **Maintainability**
   - Clear separation of concerns
   - Well-documented architecture
   - Easy to add new features
   - Comprehensive testing support
   - Provider-agnostic authentication layer

4. **User Experience**
   - Natural conversation flow
   - Context-aware responses
   - Fast response times
   - Reliable memory of past interactions
   - Personalized user experience with ownership

---

### 🔄 Chain Orchestration (Pipeline Pattern)
- Implement a pipeline-based architecture for chain management
- Each chain becomes a pipeline step with clear input/output contracts
- Pipeline steps:
  1. Context Analysis
  2. Message Classification
  3. Chain Routing
  4. Execution
  5. Memory Management
- Benefits:
  - Clear data flow
  - Easy to add new chains
  - Simplified testing
  - Better error handling

### 🔐 Authentication System
- Implement provider-agnostic authentication:
  1. Authentication Service Layer
     - Common interface for all providers
     - Error handling and token management
     - Session validation and refresh
  2. Provider Implementations
     - FusionAuth integration
     - AWS Cognito integration
     - Mock provider for development
  3. User Management
     - User registration and login
     - Password reset and email verification
     - User profile management
  4. Invitation System
     - Invite-only registration
     - Admin invitation management
     - Role-based access control
     - Invitation tracking and validation
- Database schema updates:
  - User ownership for recipes
  - User favorites and collections
  - Access control and permissions
  - Invitation tracking and management

### 🧠 Memory Management System
- Implement comprehensive memory management:
  1. Conversation Buffer Memory
     - Maintains immediate conversation context
     - Handles short-term memory needs
  2. Summary Memory
     - Creates high-level summaries of conversations
     - Manages long-term context
  3. Entity Memory
     - Tracks specific entities (recipes, ingredients)
     - Enables context-aware responses
  4. User-Specific Memory
     - Isolates memory by user
     - Maintains user context across sessions
- Use Redis Stack for vector storage:
  - Store conversation embeddings
  - Enable semantic search
  - Maintain conversation history
  - Support real-time access
  - User-specific memory isolation

### 📅 Implementation Phases

#### Phase 1: Authentication Foundation
- [ ] Create authentication service layer
- [ ] Implement MockAuthProvider for development
- [ ] Update database schema with user ownership
- [ ] Create authentication middleware for API routes

#### Phase 2: Provider Integration
- [ ] Implement FusionAuthProvider
- [ ] Implement CognitoProvider
- [ ] Add provider-specific configuration
- [ ] Create migration scripts for existing data

#### Phase 3: Frontend Integration
- [ ] Update AuthContext to use new service
- [ ] Implement proper token management
- [ ] Add user-specific UI components
- [ ] Update protected routes and layouts

#### Phase 4: Invitation Management
- [ ] Implement invitation system with database storage
- [ ] Create invitation UI for admins to send invites
- [ ] Add invitation validation and acceptance flow
- [ ] Implement role-based access control for invitations

#### Phase 5: Recipe Ownership
- [ ] Update recipe creation/editing to include user ownership
- [ ] Implement user-specific recipe filtering
- [ ] Add favorites functionality
- [ ] Create user dashboard with personal recipes

#### Phase 5: Pipeline Foundation
- [ ] Create pipeline structure
- [ ] Convert existing chains to pipeline steps
- [ ] Implement basic routing logic
- [ ] Add error handling

#### Phase 6: Memory System
- [ ] Set up Redis Stack
- [ ] Implement memory types
- [ ] Create memory manager
- [ ] Add vector storage
- [ ] Add user-specific memory isolation

#### Phase 7: Integration
- [ ] Connect pipeline with memory system
- [ ] Add semantic search capabilities
- [ ] Implement conversation persistence
- [ ] Add memory cleanup policies
- [ ] Integrate user context with chat system

#### Phase 8: Recipe Modification
- [ ] Add recipe modification chain
- [ ] Implement recipe validation
- [ ] Add title generation
- [ ] Connect with database operations

### 🔍 Technical Notes
- Authentication code will live in `/services/auth`
- All memory-related code will live in `/chat/memory`
- Pipeline code will be in `/chat/pipeline`
- Redis configuration will be in `/config`
- Each phase should be implemented and tested independently
- Consider adding monitoring for memory usage, pipeline performance, and authentication metrics
- User context will be integrated throughout the chat system for personalized experiences