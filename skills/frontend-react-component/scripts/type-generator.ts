#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

interface Property {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

interface Schema {
  name: string;
  properties: Property[];
  interfaces?: string[];
}

function generateTypeScriptTypes(schema: Schema): string {
  const { name, properties, interfaces = [] } = schema;

  // Generate imports for interfaces
  const imports = interfaces.length > 0
    ? interfaces.map(i => `import { ${i} } from './${i}';`).join('\n') + '\n\n'
    : '';

  // Generate property definitions
  const props = properties.map(prop => {
    const optional = prop.required ? '' : '?';
    const comment = prop.description ? `  /** ${prop.description} */\n` : '';
    return `${comment}  ${prop.name}${optional}: ${prop.type};`;
  }).join('\n');

  // Generate the interface
  const interfaceDefinition = `export interface ${name} {\n${props}\n}`;

  // Generate a props version for React components
  const propsInterface = `export interface ${name}Props {\n${props}\n}`;

  return `${imports}${interfaceDefinition}\n\n${propsInterface}\n`;
}

function generateFromJSON(jsonSchema: any, typeName: string): string {
  const properties: Property[] = [];

  if (jsonSchema.properties) {
    for (const [key, value] of Object.entries(jsonSchema.properties)) {
      const prop = value as any;
      const required = jsonSchema.required?.includes(key) || false;

      let tsType: string;
      switch (prop.type) {
        case 'string':
          tsType = 'string';
          break;
        case 'number':
          tsType = 'number';
          break;
        case 'boolean':
          tsType = 'boolean';
          break;
        case 'array':
          tsType = `${prop.items?.type || 'any'}[]`;
          break;
        case 'object':
          if (prop.additionalProperties) {
            tsType = 'Record<string, any>';
          } else {
            tsType = 'object';
          }
          break;
        default:
          tsType = 'any';
      }

      properties.push({
        name: key,
        type: tsType,
        required,
        description: prop.description
      });
    }
  }

  return generateTypeScriptTypes({
    name: typeName,
    properties,
    interfaces: []
  });
}

function generateFromGraphQL(schema: string, typeName: string): string {
  // Simple GraphQL schema parser (basic implementation)
  const lines = schema.split('\n');
  const inType = lines.some(line => line.includes(`type ${typeName}`));

  if (!inType) {
    throw new Error(`Type ${typeName} not found in GraphQL schema`);
  }

  const properties: Property[] = [];
  let inTargetType = false;

  for (const line of lines) {
    if (line.includes(`type ${typeName}`)) {
      inTargetType = true;
      continue;
    }

    if (inTargetType) {
      if (line.includes('}')) {
        break;
      }

      if (line.trim() && !line.startsWith('#')) {
        const match = line.match(/^\s*(\w+)(\!?):\s*([^\s]+)/);
        if (match) {
          const [, name, bang, type] = match;
          properties.push({
            name,
            type: type.replace('!', ''),
            required: bang === '!'
          });
        }
      }
    }
  }

  return generateTypeScriptTypes({
    name: typeName,
    properties,
    interfaces: []
  });
}

// CLI interface
function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node type-generator.ts <command> <options>');
    console.log('');
    console.log('Commands:');
    console.log('  json <schema-file> <type-name>   Generate types from JSON schema');
    console.log('  graphql <schema-file> <type-name> Generate types from GraphQL schema');
    console.log('');
    console.log('Examples:');
    console.log('  node type-generator.ts json user-schema.json User');
    console.log('  node type-generator.ts graphql schema.graphql User');
    process.exit(1);
  }

  const [command, ...rest] = args;

  try {
    let output: string;

    switch (command) {
      case 'json': {
        const [schemaFile, typeName] = rest;
        if (!schemaFile || !typeName) {
          throw new Error('JSON schema file and type name are required');
        }

        const schemaContent = fs.readFileSync(schemaFile, 'utf8');
        const jsonSchema = JSON.parse(schemaContent);
        output = generateFromJSON(jsonSchema, typeName);
        break;
      }

      case 'graphql': {
        const [schemaFile, typeName] = rest;
        if (!schemaFile || !typeName) {
          throw new Error('GraphQL schema file and type name are required');
        }

        const schemaContent = fs.readFileSync(schemaFile, 'utf8');
        output = generateFromGraphQL(schemaContent, typeName);
        break;
      }

      default:
        throw new Error(`Unknown command: ${command}`);
    }

    const outputFile = rest[2] || `${rest[1].toLowerCase()}.ts`;
    fs.writeFileSync(outputFile, output);
    console.log(`✅ Generated TypeScript types: ${outputFile}`);

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { generateTypeScriptTypes, generateFromJSON, generateFromGraphQL };