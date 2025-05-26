# Deployment Notes

## Development
```bash
docker-compose up -d
```

## Production
```bash
docker-compose --profile prod up
```
```

**docs/README.md**:
```markdown
# Documentation

## Overview
This directory contains all project documentation, including requirements, architecture, and decision records.

## Contents
- `ARCHITECTURE.md`: Technical architecture and implementation details
- `requirements.md`: Feature requirements and user stories
- `CHANGELOG.md`: Record of changes and updates
- `DEPLOYMENT.md`: Deployment instructions
- `architecture/`: Detailed technical documentation
  - `decisions/`: Architectural Decision Records (ADRs)
  - `PIVOTS.md`: Documentation of major architectural changes
  - `diagrams/`: Architecture diagrams and visualizations

## How to Use
1. Start with `requirements.md` for feature understanding
2. Refer to `ARCHITECTURE.md` for technical implementation
3. Check `CHANGELOG.md` for recent changes
4. Review ADRs for specific decision rationales
5. Consult `PIVOTS.md` for major architectural changes

## Contributing
- Update relevant documents when making changes
- Create new ADRs for significant decisions
- Update CHANGELOG.md for all changes
- Keep diagrams up to date
```

**docs/architecture/decisions/001-pipeline-pattern.md**:
```markdown
# Pipeline Pattern for Chain Orchestration

## Status
Accepted

## Context
The application needs to handle multiple types of conversations (recipe-specific, general cooking, etc.) while maintaining context and enabling easy addition of new capabilities.

## Decision
We will implement a pipeline pattern for chain orchestration with the following characteristics:
- Linear flow of data through the system
- Clear input/output contracts for each step
- Support for both sequential and conditional execution
- Easy integration of new chains

## Consequences
### Positive
- Clear separation of concerns
- Easy to test individual components
- Simplified addition of new capabilities
- Better error handling

### Negative
- Additional complexity in setup
- Need for careful state management
- Potential performance overhead

## Alternatives Considered
1. Event-driven architecture
   - Rejected due to complexity in maintaining conversation context
2. Simple if-else routing
   - Rejected due to scalability concerns
3. Microservices approach
   - Rejected due to overhead for this scale

## Implementation Notes
- Each chain becomes a pipeline step
- State is passed between steps
- Error handling at each step
- Monitoring capabilities built-in
```

**docs/architecture/PIVOTS.md**:
```markdown
# Architecture Pivots

## What is a Pivot?
A pivot is a significant change in the architecture that affects multiple components or the overall system design.

## How to Handle Pivots

### 1. Documentation Updates
- Create a new ADR explaining the pivot
- Update ARCHITECTURE.md with new patterns
- Mark deprecated patterns clearly
- Update implementation phases

### 2. Code Migration
- Create migration guides
- Document breaking changes
- Provide backward compatibility where possible
- Set clear timelines for deprecation

### 3. Communication
- Document the rationale for the pivot
- List affected components
- Provide migration paths
- Set expectations for timeline

## Example Pivot: Memory System Enhancement
### Before
- Simple StateGraph memory
- In-memory storage only
- Limited context retention

### After
- Multi-layered memory system
- Redis Stack integration
- Vector-based semantic search

### Migration Path
1. Implement new memory system alongside existing
2. Gradually migrate chains to new system
3. Monitor performance and usage
4. Remove old system once migration complete
```

Would you like me to:
1. Show you the commands to create these files?
2. Help you verify the content after creation?
3. Add any additional ADRs or documentation?