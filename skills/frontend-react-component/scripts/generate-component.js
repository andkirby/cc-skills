#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const templates = {
  simple: `import React from 'react';
import styles from './{{ComponentName}}.module.css';

export interface {{ComponentName}}Props {
  children?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export const {{ComponentName}}: React.FC<{{ComponentName}}Props> = ({
  children,
  className,
  variant = 'primary'
}) => {
  return (
    <div className={\`\${styles.{{componentName}}} \${styles[variant]} \${className || ''}\`}>
      {children}
    </div>
  );
};

export default {{ComponentName}};`,

  interactive: `import React, { useState, useCallback } from 'react';
import styles from './{{ComponentName}}.module.css';

export interface {{ComponentName}}Props {
  initialValue?: boolean;
  onToggle?: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const {{ComponentName}}: React.FC<{{ComponentName}}Props> = ({
  initialValue = false,
  onToggle,
  disabled = false,
  className
}) => {
  const [isActive, setIsActive] = useState(initialValue);

  const handleToggle = useCallback(() => {
    if (disabled) return;

    const newValue = !isActive;
    setIsActive(newValue);
    onToggle?.(newValue);
  }, [isActive, disabled, onToggle]);

  return (
    <button
      className={\`\${styles.{{componentName}}} \${isActive ? styles.active : ''} \${disabled ? styles.disabled : ''} \${className || ''}\`}
      onClick={handleToggle}
      disabled={disabled}
      type="button"
    >
      {isActive ? 'Active' : 'Inactive'}
    </button>
  );
};

export default {{ComponentName}};`,

  data: `import React, { useEffect, useState } from 'react';
import styles from './{{ComponentName}}.module.css';

export interface DataItem {
  id: string;
  name: string;
  // Add other properties based on your API response
}

export interface {{ComponentName}}Props {
  url: string;
  renderItem?: (item: DataItem) => React.ReactNode;
  className?: string;
}

export const {{ComponentName}}: React.FC<{{ComponentName}}Props> = ({
  url,
  renderItem,
  className
}) => {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  if (loading) {
    return <div className={\`\${styles.{{componentName}}} \${styles.loading} \${className || ''}\`}>Loading...</div>;
  }

  if (error) {
    return <div className={\`\${styles.{{componentName}}} \${styles.error} \${className || ''}\`}>Error: {error}</div>;
  }

  return (
    <div className={\`\${styles.{{componentName}}} \${className || ''}\`}>
      {data.map((item) => (
        <div key={item.id} className={styles.item}>
          {renderItem ? renderItem(item) : <div>{item.name}</div>}
        </div>
      ))}
    </div>
  );
};

export default {{ComponentName}};`,

  form: `import React, { useState, useCallback, FormEvent } from 'react';
import styles from './{{ComponentName}}.module.css';

export interface FormData {
  email: string;
  password: string;
  // Add other form fields as needed
}

export interface FormErrors {
  email?: string;
  password?: string;
}

export interface {{ComponentName}}Props {
  onSubmit: (data: FormData) => Promise<void>;
  initialValues?: Partial<FormData>;
  submitButtonText?: string;
  className?: string;
}

export const {{ComponentName}}: React.FC<{{ComponentName}}Props> = ({
  onSubmit,
  initialValues,
  submitButtonText = 'Submit',
  className
}) => {
  const [formData, setFormData] = useState<FormData>({
    email: initialValues?.email || '',
    password: initialValues?.password || ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onSubmit]);

  const handleInputChange = useCallback((field: keyof FormData) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };
  }, [errors]);

  return (
    <form onSubmit={handleSubmit} className={\`\${styles.{{componentName}}} \${className || ''}\`}>
      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          className={\`\${styles.input} \${errors.email ? styles.error : ''}\`}
          disabled={isSubmitting}
        />
        {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange('password')}
          className={\`\${styles.input} \${errors.password ? styles.error : ''}\`}
          disabled={isSubmitting}
        />
        {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={styles.submitButton}
      >
        {isSubmitting ? 'Submitting...' : submitButtonText}
      </button>
    </form>
  );
};

export default {{ComponentName}};`
};

const cssTemplates = {
  simple: `.{{componentName}} {
  display: inline-block;
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.{{componentName}}:hover {
  background-color: #f5f5f5;
}

.primary {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.primary:hover {
  background-color: #0056b3;
}

.secondary {
  background-color: #6c757d;
  color: white;
  border-color: #6c757d;
}

.secondary:hover {
  background-color: #545b62;
}`,

  interactive: `.{{componentName}} {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.{{componentName}}.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.{{componentName}}.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.{{componentName}}:not(.disabled):hover {
  background-color: #f5f5f5;
}

.{{componentName}}.active:hover {
  background-color: #0056b3;
}`,

  data: `.{{componentName}} {
  padding: 16px;
}

.{{componentName}}.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #666;
}

.{{componentName}}.error {
  color: #dc3545;
  text-align: center;
  padding: 16px;
}

.item {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.item:last-child {
  border-bottom: none;
}`,

  form: `.{{componentName}} {
  max-width: 400px;
  padding: 24px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: white;
}

.field {
  margin-bottom: 16px;
}

.label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #333;
}

.input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.input.error {
  border-color: #dc3545;
}

.errorMessage {
  display: block;
  margin-top: 4px;
  color: #dc3545;
  font-size: 12px;
}

.submitButton {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submitButton:hover:not(:disabled) {
  background-color: #0056b3;
}

.submitButton:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}`
};

function createComponent(componentName, options = {}) {
  const { type = 'simple', styled = true, typed = true } = options;
  const componentDir = path.join(process.cwd(), 'components', componentName);

  // Create component directory
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
  }

  // Replace template variables
  const template = templates[type] || templates.simple;
  const cssTemplate = styled ? (cssTemplates[type] || cssTemplates.simple) : null;

  const componentContent = template
    .replace(/{{ComponentName}}/g, componentName)
    .replace(/{{componentName}}/g, componentName.toLowerCase());

  // Write component file
  const componentFile = path.join(componentDir, `${componentName}.tsx`);
  fs.writeFileSync(componentFile, componentContent);

  // Write CSS module if styled
  if (cssTemplate) {
    const cssContent = cssTemplate.replace(/{{componentName}}/g, componentName.toLowerCase());
    const cssFile = path.join(componentDir, `${componentName}.module.css`);
    fs.writeFileSync(cssFile, cssContent);
  }

  // Write index barrel file
  const indexContent = typed ?
    `export { ${componentName}, type ${componentName}Props } from './${componentName}';
export { default } from './${componentName}';` :
    `export { ${componentName} } from './${componentName}';
export { default } from './${componentName}';`;
  fs.writeFileSync(path.join(componentDir, 'index.ts'), indexContent);

  // Write test file
  const testContent = `import React from 'react';
import { render, screen } from '@testing-library/react';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName} />);
  });

  it('applies custom className', () => {
    const { container } = render(<${componentName} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});`;
  fs.writeFileSync(path.join(componentDir, `${componentName}.test.tsx`), testContent);

  console.log(`✅ Created component: ${componentName}`);
  console.log(`   Location: ${componentDir}`);
  console.log(`   Files created:`);
  console.log(`   - ${componentName}.tsx`);
  if (styled) console.log(`   - ${componentName}.module.css`);
  console.log(`   - index.ts`);
  console.log(`   - ${componentName}.test.tsx`);
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const componentName = args[0];

  if (!componentName) {
    console.error('Error: Component name is required');
    console.log('Usage: node generate-component.js <ComponentName> [options]');
    console.log('Options:');
    console.log('  --type=<simple|interactive|data|form> (default: simple)');
    console.log('  --styled (default: true)');
    console.log('  --typed (default: true)');
    process.exit(1);
  }

  const options = {};
  for (const arg of args.slice(1)) {
    if (arg.startsWith('--type=')) {
      options.type = arg.split('=')[1];
    } else if (arg === '--styled') {
      options.styled = true;
    } else if (arg === '--no-styled') {
      options.styled = false;
    } else if (arg === '--typed') {
      options.typed = true;
    } else if (arg === '--no-typed') {
      options.typed = false;
    }
  }

  try {
    createComponent(componentName, options);
  } catch (error) {
    console.error('Error creating component:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createComponent, templates, cssTemplates };