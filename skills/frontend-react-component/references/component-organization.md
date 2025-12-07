# React Component Organization Guide

## Quick Validation Checklist

For each component folder, ask yourself:

### 1. Ownership Test
- [ ] Can I delete this folder and nothing outside breaks?
- [ ] Does this folder contain everything it needs?

### 2. Colocation Check
- [ ] Are files placed as close as possible to where they're used?
- [ ] Is code colocated with its primary consumer?

### 3. Structure Validation
- [ ] Am I nesting unnecessarily (avoid >2 levels deep)?
- [ ] Does each subfolder have multiple files?
- [ ] Is the structure flat when possible?

### 4. Global vs Local Decision Tree
```
Is it used in multiple unrelated features?
├── YES → src/hooks/ or src/utils/
└── NO
    └── Is it tied to a specific component?
        ├── YES → ComponentFolder/
        └── NO
            └── Is it a domain concept (e.g., ticket, user)?
                ├── YES → src/lib/ or src/services/
                └── NO → Reconsider if needed
```

## Red Flags Checklist

Review your structure for these anti-patterns:

- [ ] Global hooks/ folder has component-specific hooks
- [ ] Global utils/ folder growing without auditing usage
- [ ] Deeply nested: Component/SubComponent/hooks/utils/
- [ ] Single file in a subfolder
- [ ] Hook named after component but lives globally
- [ ] Utility imported by only one component but lives in src/utils/
- [ ] Component folder without index.tsx (inconsistent imports)

## Refactoring Triggers

Move code when:

| Trigger | Action |
|---------|--------|
| Second component needs the hook | Promote to `src/hooks/` |
| Component folder exceeds 10 files | Split component or add subfolders |
| Hook has no component dependencies | Consider promoting to global |
| Deleting component leaves orphan files | Colocate them |

## Quick Script for Validation

When reviewing a component structure, run this mental checklist:

1. **Discovery:** Can a new developer find related code easily?
2. **Honesty:** Does global placement imply reuse that doesn't exist?
3. **Flatness:** Am I creating folders for single files?
4. **Consistency:** Does this match the team's conventions?
5. **Maintainability:** Will this structure survive future changes?

## When to Break These Rules

- **Monorepo constraints** may require different structures
- **Team conventions** take precedence over personal preference
- **Generated code** (GraphQL, OpenAPI) often has its own patterns
- **Legacy code** may not be worth restructuring

Always ask: "Does this change make the code easier to understand and maintain?"