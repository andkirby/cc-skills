import React from 'react';
import styles from './{{ComponentName}}.module.css';

export interface {{ComponentName}}Props {
  /**
   * Content to be displayed inside the component
   */
  children?: React.ReactNode;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Visual variant of the component
   */
  variant?: 'primary' | 'secondary' | 'tertiary';

  /**
   * Size of the component
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Whether the component should be disabled
   */
  disabled?: boolean;

  /**
   * Click handler
   */
  onClick?: () => void;
}

/**
 * A simple reusable component that displays content with customizable styling
 */
export const {{ComponentName}}: React.FC<{{ComponentName}}Props> = ({
  children,
  className,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick
}) => {
  const classNames = [
    styles.{{componentName}},
    styles[variant],
    styles[size],
    disabled ? styles.disabled : '',
    className || ''
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classNames}
      onClick={disabled ? undefined : onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && !disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </div>
  );
};

export default {{ComponentName}};