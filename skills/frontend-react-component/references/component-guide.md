# React Component Structure Self-Assessment Guide

A practical checklist for validating your component file organization.

---

## 1. Colocation Check

Ask yourself for each hook/utility file:

| Question | If YES | If NO |
|----------|--------|-------|
| Is this used by 2+ unrelated components? | Move to global `src/hooks/` or `src/utils/` | Keep in component folder |
| Does it have component-specific dependencies? | Keep in component folder | Can be global |
| Would deleting the component make this file useless? | Keep in component folder | Consider global |

**Rule:** Code lives as close as possible to where it's used.

---

## 2. File-to-Folder Promotion Rule

<!-- Added new section for file-to-folder promotion -->

A component becomes a folder the moment it has related files.

| Before | After |
|--------|-------|
| `Super.tsx` (standalone) | `Super/index.tsx` (with sub-files) |

**Trigger conditions:**
- Component gets a sub-component
- Component needs a dedicated hook
- Component needs a dedicated utility
- Component needs local types file

**Example transformation:**

```
# Before: Single file
src/components/
└── Column.tsx

# After: Component gains StatusToggle sub-component
src/components/
└── {MainComponent}/
    ├── index.tsx         # Was Column.tsx
    └── StatusToggle.tsx  # New sub-component
```

**Why `index.tsx`:**
- Imports stay clean: `import { Column } from '@/components/Column'`
- Works for both `Column.tsx` and `{MainComponent}/index.tsx`
- No import path changes when promoting file to folder

**Rule:** Never have both `Component.tsx` and `Component/` — pick one.

---

## 3. Folder Nesting Check

Count files in your component folder:

| File Count | Recommended Structure |
|------------|----------------------|
| 1-3 files | Single file component, no folder needed |
| 4-10 files | Flat folder structure |
| 10+ files | Add subfolders OR split component |

**Warning signs of over-nesting:**
- `Component/hooks/useSingleHook.ts` (one hook in a folder)
- `Component/utils/oneUtil.ts` (one utility in a folder)
- More than 2 levels deep: `Component/SubComponent/hooks/`

---

## 4. File Placement Checklist

For each file, verify placement:

```
[ ] Sub-component only used by parent? 
    -> Parent/SubComponent.tsx

[ ] Hook only used by this component?
    -> Component/useHookName.ts

[ ] Utility only used by this component?
    -> Component/utilName.ts

[ ] Types only used by this component?
    -> Component/types.ts OR inline in component

[ ] Styles/variants only for this component?
    -> Component/styles.ts
```

---

## 5. Global vs Local Decision Tree

```
Is it used in multiple unrelated features?
├── YES -> src/hooks/ or src/utils/
└── NO
    └── Is it tied to a specific component?
        ├── YES -> ComponentFolder/
        └── NO
            └── Is it a domain concept (e.g., ticket, user)?
                ├── YES -> src/lib/ or src/services/
                └── NO -> Reconsider if needed
```

---

## 6. Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Component folder | PascalCase | `{MainComponent}/` |
| Component file | PascalCase | `StatusToggle.tsx` |
| Hook file | camelCase with `use` prefix | `useDropZone.ts` |
| Utility file | camelCase | `buttonModeStyles.ts` |
| Types file | camelCase or `types.ts` | `types.ts` |
| Index file | `index.tsx` | Main component export |

---

## 7. Red Flags Checklist

Review your structure for these anti-patterns:

```
[ ] Global hooks/ folder has component-specific hooks
[ ] Global utils/ folder growing without auditing usage
[ ] Deeply nested: Component/SubComponent/hooks/utils/
[ ] Single file in a subfolder
[ ] Hook named after component but lives globally
[ ] Utility imported by only one component but lives in src/utils/
[ ] Component folder without index.tsx (inconsistent imports)
```

---

## 8. Refactoring Triggers

Move code when:

| Trigger | Action |
|---------|--------|
| Second component needs the hook | Promote to `src/hooks/` |
| Component folder exceeds 10 files | Split component or add subfolders |
| Hook has no component dependencies | Consider promoting to global |
| Deleting component leaves orphan files | Colocate them |

---

## 9. Example Structures

### Small Component (1-3 files)
```
src/components/
└── Button.tsx          # No folder needed
```

### Medium Component (4-10 files)
```
src/components/
└── {MainComponent}/
    ├── index.tsx
    ├── StatusToggle.tsx
    ├── useDropZone.ts
    ├── useButtonModes.ts
    └── buttonModeStyles.ts
```

### Large Component (10+ files) - Consider Splitting
```
src/components/
└── {MainComponent}/
    ├── index.tsx
    ├── {SubComponentA}.tsx
    ├── {SubComponentB}.tsx
    ├── {SubComponentC}.tsx
    ├── hooks/
    │   ├── useDropZone.ts
    │   ├── useButtonModes.ts
    │   └── useErrorHandler.ts
    └── utils/
        ├── buttonModeStyles.ts
        └── positionCalculator.ts
```

---

## 10. Quick Validation Script

Run this mental checklist for each component folder:

1. **Ownership:** Can I delete this folder and nothing outside breaks?
2. **Completeness:** Does this folder contain everything it needs?
3. **Flatness:** Am I nesting unnecessarily?
4. **Honesty:** Does global placement imply reuse that doesn't exist?
5. **Discoverability:** Can a new developer find related code easily?

---

## 11. When to Break These Rules

Rules exist to serve you, not the other way around:

- **Monorepo constraints** may require different structures
- **Team conventions** take precedence over personal preference
- **Generated code** (GraphQL, OpenAPI) often has its own patterns
- **Legacy code** may not be worth restructuring

Always ask: "Does this change make the code easier to understand and maintain?"
