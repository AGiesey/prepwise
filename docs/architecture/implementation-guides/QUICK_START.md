# Quick Start: Unified LangGraph Migration

This is a quick reference for starting the unified LangGraph migration. Follow the [detailed migration guide](./unified-langgraph-migration-guide.md) for complete instructions.

## Prerequisites Checklist

- [ ] PostgreSQL database running
- [ ] DATABASE_URL environment variable set
- [ ] Codebase up to date
- [ ] Understanding of LangGraph StateGraph concepts

## Implementation Order

### Phase 1: Preparation (Day 1)
1. Install PostgresSaver dependency
2. Set up database schema for checkpoints
3. Create ChatState interface
4. Test PostgresSaver connection

### Phase 2: Build Unified Graph (Day 2-3)
5. Create graph configuration
6. Convert existing chains to graph nodes
7. Implement routing logic
8. Build unified StateGraph
9. Test individual nodes

### Phase 3: Integration (Day 4-5)
10. Update ChatService to use unified graph
11. Update API route (minimal changes)
12. Test end-to-end conversations
13. Test all conversation scenarios

### Phase 4: Cleanup (Day 6)
14. Remove old pipeline code
15. Remove old chain files
16. Update documentation
17. Final testing

## First Steps Right Now

1. **Install PostgresSaver dependency** (1 minute)
   ```bash
   yarn add @langchain/langgraph-checkpoint-postgres
   ```

2. **Verify DATABASE_URL is set**
   - Check your `.env.local` or `.env` file
   - Should already be set for Prisma
   - No new environment variables needed!

3. **Test PostgresSaver connection** (see migration guide Step 1.3)
   - Create a simple test script
   - Verify database connection works

4. **Create ChatState interface** (see migration guide Step 2.1)
   - Define state structure
   - Plan your graph nodes

5. **Start converting chains to nodes** (see migration guide Phase 2)

## Testing Each Phase

After each phase, test:
- [ ] PostgresSaver connection works
- [ ] Graph nodes execute correctly
- [ ] Routing logic works
- [ ] Conversation history persists
- [ ] Multi-turn conversation works
- [ ] Thread IDs are consistent
- [ ] Context switching works

## Common Issues

- **PostgresSaver connection fails**: Check DATABASE_URL environment variable
- **State not persisting**: Verify thread ID is consistent
- **Context loss**: Check all nodes use same thread ID
- **Routing issues**: Verify classification logic
- **State schema errors**: Check ChatState interface matches usage

## Key Differences from Old Approach

✅ **No Redis needed** - Uses existing PostgreSQL  
✅ **No ConversationManager** - LangGraph handles it  
✅ **No dual memory systems** - Single source of truth  
✅ **Simpler architecture** - One graph instead of pipeline + chains  

## Next Steps

Once Phase 1 is complete, proceed to Phase 2. Don't move forward until each phase is tested and working.

For detailed instructions, see the [Unified LangGraph Migration Guide](./unified-langgraph-migration-guide.md).
