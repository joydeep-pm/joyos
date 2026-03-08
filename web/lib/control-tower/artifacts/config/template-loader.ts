/**
 * Template Loader
 *
 * Loads artifact templates from YAML files for M2P-specific formats.
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";
import type { ArtifactTemplate, ArtifactType } from "../types";

/**
 * Load template from file path
 */
export function loadTemplateFromFile(filePath: string): ArtifactTemplate | null {
  try {
    if (!existsSync(filePath)) {
      console.warn(`Template file not found: ${filePath}`);
      return null;
    }

    const content = readFileSync(filePath, "utf-8");
    const parsed = yaml.load(content) as Partial<ArtifactTemplate>;

    // Validate required fields
    if (!parsed.type || !parsed.name || !parsed.sections) {
      console.error(`Invalid template file: ${filePath} - missing required fields`);
      return null;
    }

    return parsed as ArtifactTemplate;
  } catch (error) {
    console.error(`Failed to load template from ${filePath}:`, error);
    return null;
  }
}

/**
 * Load all templates from a directory
 */
export function loadTemplatesFromDirectory(dirPath: string): Map<ArtifactType, ArtifactTemplate> {
  const templates = new Map<ArtifactType, ArtifactTemplate>();

  try {
    if (!existsSync(dirPath)) {
      console.warn(`Template directory not found: ${dirPath}`);
      return templates;
    }

    const files = readdirSync(dirPath).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));

    for (const file of files) {
      const filePath = join(dirPath, file);
      const template = loadTemplateFromFile(filePath);

      if (template) {
        templates.set(template.type, template);
        console.log(`Loaded template: ${template.type} from ${file}`);
      }
    }

    console.log(`Loaded ${templates.size} templates from ${dirPath}`);
  } catch (error) {
    console.error(`Failed to load templates from directory ${dirPath}:`, error);
  }

  return templates;
}

/**
 * Validate template structure
 */
export function validateTemplate(template: ArtifactTemplate): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!template.type) errors.push("Missing template type");
  if (!template.name) errors.push("Missing template name");
  if (!template.sections || template.sections.length === 0) {
    errors.push("Template must have at least one section");
  }

  // Validate sections
  template.sections?.forEach((section, idx) => {
    if (!section.id) errors.push(`Section ${idx} missing id`);
    if (!section.title) errors.push(`Section ${idx} missing title`);
    if (section.required === undefined) errors.push(`Section ${idx} missing required flag`);
  });

  return {
    valid: errors.length === 0,
    errors
  };
}
