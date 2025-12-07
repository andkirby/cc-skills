---
name: frontend-react-component
description: This skill should be used when creating React components, building UI features, or implementing frontend functionality in React/Next.js applications. It provides templates, patterns, and best practices for modern React development including hooks, state management, styling approaches, and TypeScript integration.
---

# Frontend React Component

## Overview

This skill enables rapid creation of production-ready React components with modern patterns, TypeScript support, and best practices. It handles everything from simple presentational components to complex feature implementations with state management and API integration.

**Note:** All file names used in examples (e.g., `useCustomLogic.ts`, `ExampleComponent.tsx`) are generic placeholders. Replace them with appropriate names for your specific use case.

## Core Capabilities

### 1. Component Creation Patterns

**Functional Components with Hooks**
- Always use functional components over class components
- Implement proper hook patterns (useState, useEffect, useCallback, useMemo)
- Follow rules of hooks (only call at top level, only from React functions)
- Use custom hooks for reusable stateful logic

**Component Architecture**
- Separate presentational components from container components
- Implement compound component patterns for complex UIs
- Use render props or children renderers for flexible APIs
- Apply composition over inheritance principles

### 2. TypeScript Integration

**Type Definitions**
- Define explicit props interfaces with proper typing
- Use generic types for reusable components
- Handle optional props with union types (e.g., `string | undefined`)
- Create type aliases for complex data structures

**Best Practices**
- Prefer interface over type for object shapes that might be extended
- Use enums for fixed sets of constants
- Implement proper event handler typing
- Handle async operations with proper typing for loading/error states

### 3. State Management

**Local State**
- Use useState for simple primitive state
- Implement useReducer for complex state logic
- Apply useState with functional updates for derived state
- Handle form state with controlled components

**Side Effects**
- Use useEffect for API calls and subscriptions
- Implement proper cleanup functions
- Handle dependencies array correctly
- Use useLayoutEffect for DOM measurements

### 4. Styling Solutions

**CSS Modules**
- Create `.module.css` files for component-scoped styles
- Use camelCase for class names in JavaScript
- Implement responsive design with CSS variables
- Handle pseudo-classes and media queries

**Styled-Components**
- Use tagged template literals for dynamic styling
- Implement theme providers for consistent design tokens
- Create styled component variants with props
- Handle animation with keyframes

**Tailwind CSS**
- Apply utility classes directly in JSX
- Use `@apply` directive for custom components
- Implement responsive prefixes (sm:, md:, lg:)
- Handle dark mode with dark: prefix

## Quick Start

When creating a new component, follow this decision tree:

1. **Is it a simple UI element?**
   - Use `assets/templates/simple-component.tsx`
   - Add props interface with TypeScript
   - Include CSS module for styling

2. **Does it need state or interactivity?**
   - Use `assets/templates/interactive-component.tsx`
   - Implement appropriate hooks
   - Add event handlers with proper typing

3. **Does it fetch data?**
   - Use `assets/templates/data-component.tsx`
   - Implement loading/error states
   - Add proper useEffect cleanup

4. **Is it a form?**
   - Use `assets/templates/form-component.tsx`
   - Implement controlled inputs
   - Add validation and submission handling

## Implementation Guidelines

### Component Organization Strategy

#### 1. File-to-Folder Promotion
A component becomes a folder the moment it has related files.

| Before | After |
|--------|-------|
| `Component.tsx` (standalone) | `Component/index.tsx` (with sub-files) |

**Trigger conditions for folder promotion:**
- Component gets a sub-component
- Component needs a dedicated hook
- Component needs a dedicated utility
- Component needs local types file

**Rule:** Never have both `Component.tsx` and `Component/` — pick one.

#### 2. Colocation Principles

**Ask for each hook/utility file:**
- Is this used by 2+ unrelated components? → Move to global `src/hooks/` or `src/utils/`
- Does it have component-specific dependencies? → Keep in component folder
- Would deleting the component make this file useless? → Keep in component folder

**Core rule:** Code lives as close as possible to where it's used.

#### 3. Folder Structure Guidelines

| File Count | Recommended Structure |
|------------|----------------------|
| 1-3 files | Single file component, no folder needed |
| 4-10 files | Flat folder structure |
| 10+ files | Add subfolders OR split component |

**File Placement Rules:**
```
[ ] Sub-component only used by parent? → Parent/SubComponent.tsx
[ ] Hook only used by this component? → Component/useHookName.ts
[ ] Utility only used by this component? → Component/utilName.ts
[ ] Types only used by this component? → Component/types.ts OR inline
[ ] Styles/variants only for this component? → Component/styles.ts
```

#### 4. Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Component folder | PascalCase | `MainComponent/` |
| Component file | PascalCase | `ExampleComponent.tsx` |
| Hook file | camelCase with `use` prefix | `useCustomLogic.ts` |
| Utility file | camelCase | `helperFunctions.ts` |
| Types file | camelCase or `types.ts` | `types.ts` |
| Index file | `index.tsx` | Main component export |

#### 5. Example Structures

**Small Component (1-3 files):**
```
src/components/
└── Button.tsx          # No folder needed
```

**Medium Component (4-10 files):**
```
src/components/
└── MainComponent/
    ├── index.tsx
    ├── SubComponent.tsx
    ├── useCustomLogic.ts
    ├── useComponentState.ts
    └── helperFunctions.ts
```

**Large Component (10+ files):**
```
src/components/
└── MainComponent/
    ├── index.tsx
    ├── SubComponentA.tsx
    ├── SubComponentB.tsx
    ├── hooks/
    │   ├── useApiData.ts
    │   ├── useComponentState.ts
    │   └── useEventHandlers.ts
    └── utils/
        ├── styleHelpers.ts
        └── calculationHelpers.ts
```

### File Structure for Individual Components
```
ComponentName/
├── index.ts               # Export barrel
├── ComponentName.tsx      # Main component
├── ComponentName.module.css # Styles
├── ComponentName.test.tsx   # Tests
└── types.ts               # Type definitions
```

### Naming Conventions
- Use PascalCase for component names
- Use camelCase for props and methods
- Prefix boolean props with `is`, `has`, or `can`
- Use descriptive names for handlers (e.g., `handleSubmit` not `onSubmit`)

### Performance Optimization
- Use React.memo for expensive components
- Implement useMemo for expensive calculations
- Apply useCallback for stable function references
- Lazy load components with React.lazy
- Virtualize long lists with react-window

### Testing
- Write unit tests with React Testing Library
- Test behavior, not implementation details
- Use proper queries (getByRole, getByLabelText)
- Mock API calls with jest.mock
- Test accessibility with axe-core

## Common Patterns

### 1. Custom Hook for API Calls
```typescript
// references/api-hook-pattern.md
const useApi = <T>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};
```

### 2. Compound Component
```typescript
// references/compound-component-pattern.md
const Tabs = ({ children }: { children: React.ReactNode }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
};

const TabList = ({ children }: { children: React.ReactNode }) => (
  <div role="tablist">{children}</div>
);

const Tab = ({ index, children }: { index: number; children: React.ReactNode }) => {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === index;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(index)}
    >
      {children}
    </button>
  );
};
```

### 3. Render Props Pattern
```typescript
// references/render-props-pattern.md
const DataProvider = ({ url, children }: {
  url: string;
  children: (props: { data: any; loading: boolean; error: string | null }) => React.ReactNode
}) => {
  const { data, loading, error } = useApi(url);

  return children({ data, loading, error });
};

// Usage:
<DataProvider url="/api/users">
  {({ data, loading, error }) => {
    if (loading) return <Spinner />;
    if (error) return <ErrorMessage error={error} />;
    return <UserList users={data} />;
  }}
</DataProvider>
```

## Resources

### scripts/
- `componentGenerator.js` - CLI tool to scaffold new components with proper file structure
- `typeGenerator.ts` - Utility to generate TypeScript types from API schemas
- `styleValidator.js` - Lints CSS modules for consistency

### references/
- `component-guide.md` - Architectural decision-making guide for file organization, colocation principles, and folder structure patterns
- `component-checklist.md` - Pre-flight checklist before component creation
- `performance-tips.md` - Common performance pitfalls and solutions
- `accessibility-guide.md` - WCAG compliance for React components
- `testing-patterns.md` - Testing strategies and examples

### assets/
- `templates/` - Boilerplate templates for different component types
  - `presentational-component.tsx` - Basic presentational component
  - `interactive-component.tsx` - Component with state
  - `dataFetching-component.tsx` - Data-fetching component
  - `form-component.tsx` - Form component with validation
- `styles/` - Common CSS patterns and utilities
- `hooks/` - Reusable custom hooks

## Usage Examples

**Creating a Button Component:**
```bash
node scripts/componentGenerator Button --type=presentational --styled
# Creates: Button/index.ts, Button/Button.tsx, Button/Button.module.css
```

**Creating a Data Table:**
```bash
node scripts/componentGenerator DataTable --type=dataFetching --typed
# Creates typed component with API integration
```

**Adding Custom Hook:**
```typescript
// Copy from assets/hooks/exampleHook.ts
import { useExampleHook } from './hooks/exampleHook';

const [state, setState] = useExampleHook(initialValue);
```