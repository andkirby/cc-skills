# Claude Code Skills

> A collection of specialized skills for Claude Code that enhance development productivity

This project contains modular skills that extend Claude Code's capabilities for specific development workflows, including React component development, UI implementation, and frontend best practices.

## Features

- **React Component Development** - Production-ready component templates and patterns
- **Modern Development Patterns** - Hooks, TypeScript, and best practices
- **Automated Tooling** - Scripts for component generation and validation
- **Comprehensive References** - Implementation guides and architectural patterns

## Quick Start

### Prerequisites

- Claude Code CLI installed
- Node.js 18+ (for running skill scripts)

### Usage

These skills integrate with Claude Code's `/skill` command. To use a skill:

```bash
/skill frontend-react-component
```

This activates the React component development skill, which provides:
- Component scaffolding with proper TypeScript types
- File organization patterns
- Performance optimization guidance
- Testing setup and examples

### Example Usage

```bash
# After activating the skill
Create a reusable Button component with variants for primary, secondary, and danger states
```

The skill will generate:
- Properly typed component with TypeScript
- CSS module for styling
- Component tests
- Usage examples

## Project Structure

```
skills/
└── frontend-react-component/
    ├── SKILL.md                   # Skill definition and capabilities
    ├── assets/                    # Reusable assets
    │   ├── hooks/                 # Custom React hooks
    │   ├── styles/                # CSS patterns
    │   └── templates/             # Component templates
    ├── scripts/                   # Automation scripts
    │   ├── generate-component.js  # Component scaffold generator
    │   ├── style-validator.js     # CSS linting utility
    │   └── type-generator.ts      # TypeScript type generator
    └── references/                # Implementation guides
        ├── component-guide.md     # Component organization patterns
        ├── api-hook-pattern.md    # API data fetching patterns
        └── *.md                   # Additional guides and patterns
```

## Available Skills

### Frontend React Component

A comprehensive skill for React development that includes:

- **Component Creation**: Templates for presentational, interactive, data-fetching, and form components
- **TypeScript Integration**: Proper typing patterns and best practices
- **File Organization**: Guidelines for component structure and colocation
- **Performance**: Optimization patterns with React.memo, useMemo, and useCallback
- **Testing**: Testing patterns with React Testing Library
- **Styling**: Support for CSS modules, styled-components, and Tailwind CSS

## Contributing

Contributions are welcome! To add a new skill:

1. Create a new directory under `skills/`
2. Add a `SKILL.md` file following the skill definition format
3. Include any necessary assets, scripts, or references
4. Update this README with your skill's description

## License

This project is licensed under the MIT License.

## Resources

- [Claude Code Documentation](https://docs.anthropic.com/claude/docs/claude-code)
- [Skill Creator Guide](https://docs.anthropic.com/claude/docs/claude-code/skills)
- [Issue Tracker](https://github.com/anthropics/claude-code/issues)
