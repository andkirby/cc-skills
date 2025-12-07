#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const validationRules = {
  // Naming conventions
  classNaming: {
    pattern: /^[a-z][a-zA-Z0-9]*$/,
    message: 'Class names should use camelCase starting with a lowercase letter'
  },

  // Avoid using IDs in CSS modules
  noIds: {
    pattern: /^[^#]*$/,
    message: 'Avoid using ID selectors (#) in CSS modules'
  },

  // Avoid universal selectors
  noUniversal: {
    pattern: /^[^*]*$/,
    message: 'Avoid using universal selector (*) in CSS modules'
  },

  // Prefer rem/em over px for better accessibility
  preferRelativeUnits: {
    validate: (css) => {
      const pxMatches = (css.match(/\b\d+px\b/g) || []).length;
      const remEmMatches = (css.match(/\b\d+(rem|em)\b/g) || []).length;
      return {
        valid: remEmMatches > 0 || pxMatches === 0,
        message: `Found ${pxMatches} px units. Consider using rem/em for better accessibility`
      };
    }
  },

  // Check for !important usage
  noImportant: {
    pattern: /^[^!]*$/,
    message: 'Avoid using !important in CSS modules'
  }
};

function validateCSS(content, filePath) {
  const issues = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('/*') || trimmed.startsWith('//')) {
      return;
    }

    // Extract selectors and rules
    if (trimmed.includes('{')) {
      const selector = trimmed.split('{')[0].trim();

      // Validate selector rules
      Object.entries(validationRules).forEach(([ruleName, rule]) => {
        if (rule.pattern && !rule.pattern.test(selector)) {
          issues.push({
            line: lineNum,
            rule: ruleName,
            message: rule.message,
            content: selector
          });
        }
      });

      // Validate rule content
      if (validationRules.noImportant.validate) {
        const result = validationRules.noImportant.validate(trimmed);
        if (!result.valid) {
          issues.push({
            line: lineNum,
            rule: 'noImportant',
            message: result.message,
            content: trimmed
          });
        }
      }
    }

    // Check for px units in the entire line
    if (validationRules.preferRelativeUnits.validate) {
      const result = validationRules.preferRelativeUnits.validate(trimmed);
      if (!result.valid) {
        issues.push({
          line: lineNum,
          rule: 'preferRelativeUnits',
          message: result.message,
          content: trimmed
        });
      }
    }
  });

  return issues;
}

function validateFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return validateCSS(content, filePath);
  } catch (error) {
    return [{
      line: 0,
      rule: 'fileError',
      message: `Could not read file: ${error.message}`,
      content: ''
    }];
  }
}

function findCSSModules(dir) {
  const modules = [];

  function traverse(currentDir) {
    const files = fs.readdirSync(currentDir);

    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        traverse(filePath);
      } else if (file.endsWith('.module.css')) {
        modules.push(filePath);
      }
    }
  }

  traverse(dir);
  return modules;
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.error('Usage: node style-validator.js <command> [options]');
    console.log('');
    console.log('Commands:');
    console.log('  file <path>                Validate a single CSS module file');
    console.log('  dir <directory>            Validate all CSS modules in directory');
    console.log('  watch <directory>          Watch directory for changes and validate');
    console.log('');
    console.log('Examples:');
    console.log('  node style-validator.js file components/Button/Button.module.css');
    console.log('  node style-validator.js dir components');
    process.exit(1);
  }

  switch (command) {
    case 'file': {
      const filePath = args[1];
      if (!filePath) {
        console.error('Error: File path is required');
        process.exit(1);
      }

      console.log(`🔍 Validating: ${filePath}`);
      const issues = validateFile(filePath);

      if (issues.length === 0) {
        console.log('✅ No issues found');
      } else {
        console.log(`\n❌ Found ${issues.length} issue(s):\n`);
        issues.forEach(issue => {
          console.log(`  Line ${issue.line}: [${issue.rule}] ${issue.message}`);
          if (issue.content) {
            console.log(`    ${issue.content}`);
          }
          console.log('');
        });
        process.exit(1);
      }
      break;
    }

    case 'dir': {
      const dir = args[1] || 'components';
      console.log(`🔍 Scanning directory: ${dir}`);

      const modules = findCSSModules(dir);
      console.log(`Found ${modules.length} CSS module(s)\n`);

      let totalIssues = 0;

      for (const module of modules) {
        console.log(`Validating: ${module}`);
        const issues = validateFile(module);

        if (issues.length > 0) {
          console.log(`  ❌ ${issues.length} issue(s) found`);
          issues.forEach(issue => {
            console.log(`    Line ${issue.line}: ${issue.message}`);
          });
          totalIssues += issues.length;
        } else {
          console.log(`  ✅ No issues`);
        }
      }

      console.log(`\n📊 Summary: ${totalIssues} total issue(s) across ${modules.length} file(s)`);
      if (totalIssues > 0) {
        process.exit(1);
      }
      break;
    }

    case 'watch': {
      const dir = args[1] || 'components';
      console.log(`👀 Watching directory: ${dir}`);
      console.log('Press Ctrl+C to stop\n');

      const chokidar = require('chokidar');

      const watcher = chokidar.watch(path.join(dir, '**/*.module.css'), {
        persistent: true,
        ignoreInitial: true
      });

      watcher.on('change', (filePath) => {
        console.log(`\n📝 File changed: ${filePath}`);
        const issues = validateFile(filePath);

        if (issues.length === 0) {
          console.log('✅ No issues found');
        } else {
          console.log(`❌ ${issues.length} issue(s) found:`);
          issues.forEach(issue => {
            console.log(`  Line ${issue.line}: ${issue.message}`);
          });
        }
        console.log('Watching...\n');
      });

      process.on('SIGINT', () => {
        console.log('\n👋 Stopping file watcher');
        watcher.close();
        process.exit(0);
      });

      break;
    }

    default:
      console.error(`Error: Unknown command: ${command}`);
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateCSS, validateFile, findCSSModules, validationRules };