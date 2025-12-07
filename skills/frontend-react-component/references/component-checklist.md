# React Component Creation Checklist

## Before You Start

### Requirements Analysis
- [ ] Understand the component's purpose and functionality
- [ ] Identify all required props and their types
- [ ] Determine if the component needs state management
- [ ] Check if API calls are required
- [ ] Identify accessibility requirements
- [ ] Consider responsive design needs
- [ ] Plan for internationalization if needed

### Dependencies Check
- [ ] Verify required packages are installed
- [ ] Check if similar component already exists
- [ ] Identify utility functions needed
- [ ] Determine if custom hooks are required

## Component Structure

### File Organization
- [ ] Create component directory with PascalCase name
- [ ] Create main component file (`ComponentName.tsx`)
- [ ] Create CSS module file (`ComponentName.module.css`)
- [ ] Create index barrel file (`index.ts`)
- [ ] Create test file (`ComponentName.test.tsx`)
- [ ] Create types file if complex (`types.ts`)

### Naming Conventions
- [ ] Component name uses PascalCase
- [ ] CSS class names use camelCase
- [ ] Props interface named `ComponentNameProps`
- [ ] Boolean props prefixed with `is`, `has`, or `can`
- [ ] Event handlers named with `handle` prefix (e.g., `handleClick`)
- [ ] Files use consistent naming pattern

## TypeScript Implementation

### Type Definitions
- [ ] Define explicit props interface
- [ ] Mark optional props with `?`
- [ ] Use proper generic types for reusable components
- [ ] Import types from external libraries when needed
- [ ] Create union types for prop variants
- [ ] Define types for complex data structures

### Type Safety
- [ ] Avoid `any` type unless absolutely necessary
- [ ] Type all event handlers correctly
- [ ] Use proper typing for async operations
- [ ] Handle null/undefined cases in types
- [ ] Use discriminated unions if applicable

## React Best Practices

### Hooks Usage
- [ ] Follow rules of hooks (no conditional calls)
- [ ] Use correct dependency arrays in useEffect
- [ ] Implement cleanup in useEffect when needed
- [ ] Use useCallback for stable function references
- [ ] Use useMemo for expensive calculations
- [ ] Keep custom hooks focused and reusable

### Component Design
- [ ] Keep components small and focused
- [ ] Separate presentational from container logic
- [ ] Use composition over inheritance
- [ ] Implement proper error boundaries
- [ ] Avoid direct DOM manipulation when possible
- [ ] Use React.forwardRef if ref forwarding is needed

### State Management
- [ ] Use useState for simple state
- [ ] Use useReducer for complex state logic
- [ ] Lift state up when shared between components
- [ ] Consider context for deeply nested state
- [ ] Avoid deeply nested state objects

## Styling Guidelines

### CSS Modules
- [ ] Use CSS modules for component-scoped styles
- [ ] Apply BEM-like naming for complex classes
- [ ] Use CSS variables for theme values
- [ ] Implement responsive design with media queries
- [ ] Avoid !important declarations
- [ ] Prefer rem/em units over px for scalability

### Class Organization
- [ ] Group related styles together
- [ ] Use consistent ordering (layout, typography, colors)
- [ ] Add comments for complex selectors
- [ ] Follow mobile-first responsive design

## Testing Requirements

### Unit Tests
- [ ] Test component renders without errors
- [ ] Test all prop variations
- [ ] Test user interactions
- [ ] Test error states
- [ ] Test loading states
- [ ] Use proper queries (getByRole, getByLabelText)

### Accessibility Testing
- [ ] Test keyboard navigation
- [ ] Verify ARIA attributes
- [ ] Test with screen reader
- [ ] Check color contrast
- [ ] Verify focus management

## Performance Considerations

### Optimization
- [ ] Wrap component in React.memo if expensive
- [ ] Implement virtual scrolling for long lists
- [ ] Use code splitting for large components
- [ ] Optimize re-renders with proper memoization
- [ ] Profile component performance

### Bundle Size
- [ ] Avoid large dependencies
- [ ] Use tree-shakable imports
- [ ] Optimize images and assets
- [ ] Consider lazy loading for non-critical features

## Documentation

### Code Comments
- [ ] Document complex logic
- [ ] Explain non-obvious decisions
- [ ] Add JSDoc for custom hooks
- [ ] Document prop purposes and constraints

### Component Documentation
- [ ] Create usage examples
- [ ] Document all props with examples
- [ ] Include accessibility notes
- [ ] Add performance considerations

## Final Review

### Code Quality
- [ ] Run ESLint and fix all issues
- [ ] Run TypeScript compiler with strict mode
- [ ] Check for unused imports and variables
- [ ] Verify code follows team conventions

### Testing Coverage
- [ ] Verify all critical paths are tested
- [ ] Check test coverage meets requirements
- [ ] Run tests and ensure they pass
- [ ] Manual testing in different browsers

### Git Commit
- [ ] Stage only relevant files
- [ ] Write clear, descriptive commit message
- [ ] Link to relevant tickets or documentation
- [ ] Create pull request if required