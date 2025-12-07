# Render Props Pattern

## Overview

The render props pattern is a technique for sharing code between React components using a prop whose value is a function. This function returns React elements that the component should render. It's particularly useful for:

- Sharing component logic
- Creating flexible and reusable components
- Implementing cross-cutting concerns
- Providing data to child components

## Basic Implementation

### Simple Render Prop Component

```typescript
interface RenderPropsComponentProps<T> {
  data: T;
  children: (data: T) => React.ReactNode;
}

function RenderPropsComponent<T>({ data, children }: RenderPropsComponentProps<T>) {
  return <>{children(data)}</>;
}

// Usage
<RenderPropsComponent data={{ name: 'John', age: 30 }}>
  {({ name, age }) => (
    <div>
      <h1>{name}</h1>
      <p>Age: {age}</p>
    </div>
  )}
</RenderPropsComponent>
```

### Data Provider Component

```typescript
interface DataFetcherProps<T> {
  url: string;
  children: (props: {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
  }) => React.ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return <>{children({ data, loading, error, refetch: fetchData })}</>;
}

// Usage
<DataFetcher<User[]> url="/api/users">
  {({ data, loading, error, refetch }) => {
    if (loading) return <Spinner />;
    if (error) return <ErrorMessage error={error} />;
    if (!data) return null;

    return (
      <div>
        <button onClick={refetch}>Refresh</button>
        <ul>
          {data.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      </div>
    );
  }}
</DataFetcher>
```

## Advanced Patterns

### Multiple Render Props

```typescript
interface MultiRenderProps {
  header: () => React.ReactNode;
  content: (data: any) => React.ReactNode;
  footer: (data: any) => React.ReactNode;
}

function ComplexComponent({ url, render }: { url: string; render: MultiRenderProps }) {
  const { data, loading, error } = useApi(url);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {render.header()}
      {render.content(data)}
      {render.footer(data)}
    </div>
  );
}

// Usage
<ComplexComponent
  url="/api/data"
  render={{
    header: () => <header>My Header</header>,
    content: (data) => <main>{/* render data */}</main>,
    footer: (data) => <footer>Total items: {data.length}</footer>
  }}
/>
```

### Render Prop with Default Implementation

```typescript
interface ToggleProps {
  defaultOn?: boolean;
  children?: (props: ToggleRenderProps) => React.ReactNode;
  render?: (props: ToggleRenderProps) => React.ReactNode;
  on?: boolean;
  toggle?: () => void;
}

interface ToggleRenderProps {
  on: boolean;
  toggle: () => void;
  setOn: (value: boolean) => void;
}

function Toggle({
  defaultOn = false,
  children,
  render = children,
  on: controlledOn,
  toggle: controlledToggle
}: ToggleProps) {
  const [internalOn, setInternalOn] = useState(defaultOn);

  const on = controlledOn !== undefined ? controlledOn : internalOn;

  const toggle = controlledToggle || (() => {
    setInternalOn(!internalOn);
  });

  const setOn = controlledToggle ? (value: boolean) => {
    // For controlled components, just trigger toggle
    if (value !== on) {
      toggle();
    }
  } : setInternalOn;

  const renderProps = { on, toggle, setOn };

  if (render) {
    return <>{render(renderProps)}</>;
  }

  // Default render
  return <button onClick={toggle}>{on ? 'ON' : 'OFF'}</button>;
}

// Usage with render prop
<Toggle>
  {({ on, toggle }) => (
    <div>
      <button onClick={toggle}>Toggle</button>
      {on && <div>Content is visible</div>}
    </div>
  )}
</Toggle>

// Usage as controlled component
function App() {
  const [isOn, setIsOn] = useState(false);

  return (
    <Toggle on={isOn} toggle={() => setIsOn(!isOn)}>
      {({ on }) => <div>Current state: {on ? 'ON' : 'OFF'}</div>}
    </Toggle>
  );
}
```

### Render Props for Cross-Cutting Concerns

#### Mouse Tracking

```typescript
interface MouseTrackerProps {
  children: (props: MousePosition) => React.ReactNode;
}

interface MousePosition {
  x: number;
  y: number;
}

function MouseTracker({ children }: MouseTrackerProps) {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <>{children(position)}</>;
}

// Usage
<MouseTracker>
  {({ x, y }) => (
    <div>
      Mouse position: {x}, {y}
      <div style={{
        position: 'absolute',
        left: x - 10,
        top: y - 10,
        width: 20,
        height: 20,
        backgroundColor: 'red',
        borderRadius: '50%'
      }} />
    </div>
  )}
</MouseTracker>
```

#### Form Validation

```typescript
interface FormValidatorProps<T> {
  initialValues: T;
  validationRules: ValidationRules<T>;
  onSubmit: (values: T) => void | Promise<void>;
  children: (props: FormRenderProps<T>) => React.ReactNode;
}

interface ValidationRules<T> {
  [K in keyof T]?: (value: T[K]) => string | null;
}

interface FormRenderProps<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  handleChange: (field: keyof T) => (value: T[keyof T]) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e: React.FormEvent) => void;
  isValid: boolean;
}

function FormValidator<T extends Record<string, any>>({
  initialValues,
  validationRules,
  onSubmit,
  children
}: FormValidatorProps<T>) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((field: keyof T, value: T[keyof T]): string | null => {
    const rule = validationRules[field];
    return rule ? rule(value) : null;
  }, [validationRules]);

  const handleChange = useCallback((field: keyof T) => (value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }));

    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  }, [validateField]);

  const handleBlur = useCallback((field: keyof T) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, values[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  }, [values, validateField]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const field in validationRules) {
      const error = validateField(field as keyof T, values[field as keyof T]);
      if (error) {
        newErrors[field as keyof T] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    if (isValid) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validationRules, validateField, onSubmit]);

  const isValid = Object.keys(errors).every(key => !errors[key as keyof T]);

  const renderProps: FormRenderProps<T> = {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isValid
  };

  return <>{children(renderProps)}</>;
}

// Usage
interface LoginForm {
  email: string;
  password: string;
}

<FormValidator<LoginForm>
  initialValues={{ email: '', password: '' }}
  validationRules={{
    email: (value) => {
      if (!value) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Invalid email address';
      }
      return null;
    },
    password: (value) => {
      if (!value) return 'Password is required';
      if (value.length < 8) return 'Password must be at least 8 characters';
      return null;
    }
  }}
  onSubmit={async (values) => {
    console.log('Submitting:', values);
    // Handle form submission
  }}
>
  {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="email"
          value={values.email}
          onChange={(e) => handleChange('email')(e.target.value)}
          onBlur={handleBlur('email')}
          placeholder="Email"
        />
        {touched.email && errors.email && (
          <div style={{ color: 'red' }}>{errors.email}</div>
        )}
      </div>
      <div>
        <input
          type="password"
          value={values.password}
          onChange={(e) => handleChange('password')(e.target.value)}
          onBlur={handleBlur('password')}
          placeholder="Password"
        />
        {touched.password && errors.password && (
          <div style={{ color: 'red' }}>{errors.password}</div>
        )}
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )}
</FormValidator>
```

## Render Props vs Other Patterns

### Render Props vs HOC

```typescript
// HOC Pattern
function withData<T>(url: string) {
  return function(Component: React.ComponentType<{ data: T }>) {
    return function WrappedComponent(props: any) {
      const { data, loading, error } = useApi<T>(url);

      if (loading) return <div>Loading...</div>;
      if (error) return <div>Error: {error}</div>;

      return <Component {...props} data={data} />;
    };
  };
}

// Usage
const UserList = withData<User[]>('/api/users')(({ data }) => (
  <ul>{data?.map(user => <li key={user.id}>{user.name}</li>)}</ul>
));

// Render Props Pattern (more flexible)
<DataFetcher url="/api/users">
  {({ data, loading, error }) => {
    if (loading) return <Spinner />;
    if (error) return <ErrorMessage error={error} />;

    return (
      <div>
        <h2>Users ({data?.length})</h2>
        <ul>{data?.map(user => <li key={user.id}>{user.name}</li>)}</ul>
      </div>
    );
  }}
</DataFetcher>
```

### Render Props vs Custom Hooks

```typescript
// Custom Hook Pattern
function useData<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch logic
  }, [url]);

  return { data, loading, error, refetch: () => {} };
}

// Usage
function UserList() {
  const { data, loading, error } = useData<User[]>('/api/users');

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return <ul>{data?.map(user => <li key={user.id}>{user.name}</li>)}</ul>;
}

// Choose custom hooks when:
// - You just need to share logic
// - No additional JSX rendering needed
// - Component has simple rendering needs

// Choose render props when:
// - You need to control rendering from parent
// - Component has complex conditional rendering
// - You need to pass multiple render functions
```

## Best Practices

1. **Performance**
   - Use React.memo for render prop functions if they're expensive
   - Avoid creating new functions in render
   - Consider using useCallback for stable references

2. **TypeScript**
   - Use generics for type safety
   - Define clear interfaces for render props
   - Make render props optional with defaults

3. **Composition**
   - Keep render prop components focused
   - Combine multiple render props for complex logic
   - Use default renders for simple cases

4. **Naming**
   - Use clear, descriptive prop names
   - Consider both `children` and `render` props
   - Follow consistent naming conventions

5. **Documentation**
   - Document all available render props
   - Provide clear examples
   - Explain the shape of data passed to renders