# PrepWise Architecture

> **Note**: This document describes the architecture for our recipe management application. While currently named "PrepWise", the application name may change in the future. The architectural decisions and patterns described here will remain applicable regardless of the final product name.


## Overview

PrepWise is built on a pipeline-based architecture that orchestrates multiple LangChain-powered conversation chains. The system is designed to provide a natural, context-aware chat experience while maintaining scalability and extensibility.

### Core Architectural Components

1. **Pipeline Orchestration**
   - Implements a linear pipeline pattern for chain management
   - Each chain operates as an independent pipeline step
   - Enables clear data flow and easy addition of new capabilities
   - Supports both sequential and conditional execution paths

2. **Memory Management**
   - Multi-layered memory system combining:
     - Short-term conversation buffer
     - Long-term conversation summaries
     - Entity tracking for recipes and ingredients
   - Vector-based storage using Redis Stack for semantic search
   - Enables context-aware responses across conversation history

3. **Chain Types**
   - Topic Classification Chain: Routes queries to appropriate handlers
   - Context-Specific Chain: Handles recipe-specific queries
   - General Cooking Chain: Manages food-related queries
   - Recipe Modification Chain: Handles recipe transformations
   - (Extensible for future chain types)

### Key Design Decisions

1. **Pipeline Pattern**
   - Chosen for its simplicity and extensibility
   - Enables clear separation of concerns
   - Supports easy testing and maintenance
   - Allows for future parallel processing

2. **Redis Stack Integration**
   - Provides vector storage for semantic search
   - Enables real-time conversation history access
   - Supports efficient memory management
   - Allows for future scaling

3. **Memory System Design**
   - Combines multiple memory types for comprehensive context
   - Uses vector embeddings for semantic similarity
   - Implements cleanup policies for resource management
   - Supports future memory type additions

### System Goals

1. **Scalability**
   - Support multiple concurrent users
   - Handle growing conversation histories
   - Maintain performance with increased data

2. **Maintainability**
   - Clear separation of concerns
   - Well-documented architecture
   - Easy to add new features
   - Comprehensive testing support

3. **User Experience**
   - Natural conversation flow
   - Context-aware responses
   - Fast response times
   - Reliable memory of past interactions

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
- Use Redis Stack for vector storage:
  - Store conversation embeddings
  - Enable semantic search
  - Maintain conversation history
  - Support real-time access

### 📅 Implementation Phases

#### Phase 1: Pipeline Foundation
- [ ] Create pipeline structure
- [ ] Convert existing chains to pipeline steps
- [ ] Implement basic routing logic
- [ ] Add error handling

#### Phase 2: Memory System
- [ ] Set up Redis Stack
- [ ] Implement memory types
- [ ] Create memory manager
- [ ] Add vector storage

#### Phase 3: Integration
- [ ] Connect pipeline with memory system
- [ ] Add semantic search capabilities
- [ ] Implement conversation persistence
- [ ] Add memory cleanup policies

#### Phase 4: Recipe Modification
- [ ] Add recipe modification chain
- [ ] Implement recipe validation
- [ ] Add title generation
- [ ] Connect with database operations

### 🔍 Technical Notes
- All memory-related code will live in `/chat/memory`
- Pipeline code will be in `/chat/pipeline`
- Redis configuration will be in `/config`
- Each phase should be implemented and tested independently
- Consider adding monitoring for memory usage and pipeline performance