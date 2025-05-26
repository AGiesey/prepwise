# Memory System Architecture

## Status
Accepted

## Context
The application needs to maintain conversation context across multiple interactions while handling different types of queries (recipe-specific, general cooking, etc.). The current StateGraph memory system is limited in its ability to maintain long-term context and perform semantic searches across conversation history.

## Decision
We will implement a multi-layered memory system with the following components:

1. **Conversation Buffer Memory**
   - Maintains immediate conversation context
   - Handles short-term memory needs
   - Uses LangChain's ConversationBufferMemory
   - Limited to recent interactions to manage token usage

2. **Summary Memory**
   - Creates high-level summaries of conversations
   - Manages long-term context
   - Uses LangChain's SummaryMemory
   - Helps maintain context without token limitations

3. **Entity Memory**
   - Tracks specific entities (recipes, ingredients)
   - Enables context-aware responses
   - Uses LangChain's EntityMemory
   - Maintains relationships between entities

4. **Vector Storage (Redis Stack)**
   - Stores conversation embeddings
   - Enables semantic search
   - Maintains conversation history
   - Supports real-time access

## Consequences
### Positive
- Comprehensive context management
- Semantic search capabilities
- Better long-term memory
- Improved user experience
- Scalable storage solution

### Negative
- Increased complexity
- Additional infrastructure requirements
- Higher resource usage
- Need for careful memory cleanup

## Alternatives Considered
1. **Simple In-Memory Storage**
   - Rejected due to scalability concerns
   - Limited persistence
   - No semantic search capabilities

2. **Traditional Database Storage**
   - Rejected due to lack of vector search capabilities
   - Would require additional search infrastructure

3. **Other Vector Databases (Pinecone, Qdrant)**
   - Rejected in favor of Redis Stack for:
     - Existing Redis usage in the application
     - Real-time capabilities
     - Simpler infrastructure

## Implementation Notes
- Memory types will be implemented in `/chat/memory`
- Redis Stack configuration in `/config`
- Each memory type will have its own manager
- Memory cleanup policies will be configurable
- Monitoring will be added for memory usage
- Vector search parameters will be tunable

## Migration Strategy
1. Implement new memory system alongside existing
2. Gradually migrate chains to new system
3. Monitor performance and usage
4. Remove old system once migration complete

## Dependencies
- Redis Stack
- LangChain memory modules
- Vector embedding model
- Monitoring system

## Future Considerations
- Memory compression techniques
- Advanced cleanup policies
- Memory type extensions
- Performance optimizations