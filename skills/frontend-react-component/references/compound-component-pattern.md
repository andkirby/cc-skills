# Compound Component Pattern

## Overview

The compound component pattern allows you to create flexible and composable components by grouping multiple related components that work together. This pattern is particularly useful for complex UI elements like tabs, menus, modals, and forms.

## Basic Implementation

### Step 1: Create Context

```typescript
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TabsContextValue {
  activeTab: number;
  setActiveTab: (index: number) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab components must be used within a Tabs provider');
  }
  return context;
}
```

### Step 2: Create Root Component

```typescript
interface TabsProps {
  children: ReactNode;
  defaultTab?: number;
  onTabChange?: (index: number) => void;
}

export function Tabs({ children, defaultTab = 0, onTabChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    onTabChange?.(index);
  };

  const value = {
    activeTab,
    setActiveTab: handleTabChange
  };

  return (
    <TabsContext.Provider value={value}>
      {children}
    </TabsContext.Provider>
  );
}
```

### Step 3: Create Sub-components

```typescript
interface TabListProps {
  children: ReactNode;
  className?: string;
}

export function TabList({ children, className }: TabListProps) {
  return (
    <div role="tablist" className={className}>
      {children}
    </div>
  );
}

interface TabProps {
  index: number;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function Tab({ index, children, disabled = false, className }: TabProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === index;

  const handleClick = () => {
    if (!disabled) {
      setActiveTab(index);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled}
      tabIndex={isActive ? 0 : -1}
      className={className}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

interface TabPanelsProps {
  children: ReactNode;
  className?: string;
}

export function TabPanels({ children, className }: TabPanelsProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

interface TabPanelProps {
  index: number;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ index, children, className }: TabPanelProps) {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === index;

  if (!isActive) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      className={className}
    >
      {children}
    </div>
  );
}
```

### Step 4: Combine Components

```typescript
// Attach sub-components to the main component
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panels = TabPanels;
Tabs.Panel = TabPanel;

export default Tabs;
```

## Usage Example

```typescript
import Tabs from './Tabs';

function Example() {
  return (
    <Tabs onTabChange={(index) => console.log('Tab changed to:', index)}>
      <Tabs.List>
        <Tabs.Tab index={0}>Profile</Tabs.Tab>
        <Tabs.Tab index={1}>Settings</Tabs.Tab>
        <Tabs.Tab index={2} disabled>Billing</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panels>
        <Tabs.Panel index={0}>
          <h2>Profile Information</h2>
          {/* Profile content */}
        </Tabs.Panel>
        <Tabs.Panel index={1}>
          <h2>Settings</h2>
          {/* Settings content */}
        </Tabs.Panel>
        <Tabs.Panel index={2}>
          <h2>Billing Information</h2>
          {/* Billing content */}
        </Tabs.Panel>
      </Tabs.Panels>
    </Tabs>
  );
}
```

## Advanced Pattern: Flexible Compound Components

### Using Children as Function

```typescript
interface MenuProps {
  children: (state: { isOpen: boolean; toggle: () => void }) => ReactNode;
}

export function Menu({ children }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return <>{children({ isOpen, toggle })}</>;
}

// Usage
<Menu>
  {({ isOpen, toggle }) => (
    <>
      <button onClick={toggle}>Menu</button>
      {isOpen && (
        <div className="dropdown">
          {/* Menu items */}
        </div>
      )}
    </>
  )}
</Menu>
```

### Using CloneElement for Prop Injection

```typescript
import { cloneElement, isValidElement, ReactNode } from 'react';

interface AccordionProps {
  children: ReactNode;
  allowMultiple?: boolean;
}

interface AccordionItemProps {
  isOpen?: boolean;
  onToggle?: () => void;
  children: ReactNode;
}

export function Accordion({ children, allowMultiple = false }: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const handleToggle = (index: number) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);

      if (newSet.has(index)) {
        newSet.delete(index);
      } else if (allowMultiple) {
        newSet.add(index);
      } else {
        // Close all others and open this one
        newSet.clear();
        newSet.add(index);
      }

      return newSet;
    });
  };

  return (
    <>
      {React.Children.map(children, (child, index) => {
        if (!isValidElement<AccordionItemProps>(child)) {
          return child;
        }

        return cloneElement(child, {
          isOpen: openItems.has(index),
          onToggle: () => handleToggle(index)
        });
      })}
    </>
  );
}
```

## Compound Component with State Management

### Reducer Pattern for Complex State

```typescript
type DropdownAction =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'TOGGLE' }
  | { type: 'SELECT'; value: any };

interface DropdownState {
  isOpen: boolean;
  selectedValue: any;
}

function dropdownReducer(state: DropdownState, action: DropdownAction): DropdownState {
  switch (action.type) {
    case 'OPEN':
      return { ...state, isOpen: true };
    case 'CLOSE':
      return { ...state, isOpen: false };
    case 'TOGGLE':
      return { ...state, isOpen: !state.isOpen };
    case 'SELECT':
      return { ...state, selectedValue: action.value, isOpen: false };
    default:
      return state;
  }
}

export function Dropdown({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dropdownReducer, {
    isOpen: false,
    selectedValue: null
  });

  const value = {
    ...state,
    open: () => dispatch({ type: 'OPEN' }),
    close: () => dispatch({ type: 'CLOSE' }),
    toggle: () => dispatch({ type: 'TOGGLE' }),
    select: (value: any) => dispatch({ type: 'SELECT', value })
  };

  return (
    <DropdownContext.Provider value={value}>
      {children}
    </DropdownContext.Provider>
  );
}
```

## Best Practices

1. **Context Management**
   - Create separate contexts for different concerns
   - Keep context values minimal and focused
   - Use TypeScript for type safety

2. **Performance**
   - Memoize context values to prevent unnecessary re-renders
   - Split contexts if some values change more frequently
   - Use React.memo for sub-components that don't need to re-render

3. **Accessibility**
   - Implement proper ARIA attributes
   - Handle keyboard navigation
   - Manage focus correctly
   - Provide screen reader announcements

4. **Flexibility**
   - Allow customization through props
   - Support different render patterns
   - Make components composable
   - Provide sensible defaults

5. **Developer Experience**
   - Provide helpful error messages
   - Document component contracts
   - Use TypeScript for better intellisense
   - Include usage examples

## Testing Compound Components

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Tabs from './Tabs';

describe('Tabs Component', () => {
  it('renders tabs and panels correctly', () => {
    render(
      <Tabs>
        <Tabs.List>
          <Tabs.Tab index={0}>Tab 1</Tabs.Tab>
          <Tabs.Tab index={1}>Tab 2</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panels>
          <Tabs.Panel index={0}>Content 1</Tabs.Panel>
          <Tabs.Panel index={1}>Content 2</Tabs.Panel>
        </Tabs.Panels>
      </Tabs>
    );

    expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });

  it('switches tabs when clicked', () => {
    render(
      <Tabs>
        <Tabs.List>
          <Tabs.Tab index={0}>Tab 1</Tabs.Tab>
          <Tabs.Tab index={1}>Tab 2</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panels>
          <Tabs.Panel index={0}>Content 1</Tabs.Panel>
          <Tabs.Panel index={1}>Content 2</Tabs.Panel>
        </Tabs.Panels>
      </Tabs>
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Tab 2' }));

    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });
});
```