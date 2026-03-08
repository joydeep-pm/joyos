/**
 * Template Registry
 *
 * Central registry for artifact templates with support for custom M2P templates.
 * Loads templates from YAML files and provides fallback to default templates.
 */

import { join } from "path";
import type { ArtifactTemplate, ArtifactType } from "../types";
import { loadTemplatesFromDirectory, validateTemplate } from "./template-loader";
import { getDefaultTemplates } from "../templates";

export class TemplateRegistry {
  private templates: Map<ArtifactType, ArtifactTemplate>;
  private customTemplatesLoaded: boolean = false;

  constructor(customConfigDir?: string) {
    // Start with default templates
    this.templates = getDefaultTemplates();

    // Load custom templates if directory provided
    if (customConfigDir) {
      this.loadCustomTemplates(customConfigDir);
    }
  }

  /**
   * Load custom templates from directory
   */
  private loadCustomTemplates(configDir: string): void {
    try {
      const customTemplates = loadTemplatesFromDirectory(configDir);

      // Validate and merge custom templates
      for (const [type, template] of customTemplates.entries()) {
        const validation = validateTemplate(template);
        if (validation.valid) {
          this.templates.set(type, template);
          console.log(`Loaded custom template: ${type}`);
        } else {
          console.error(`Invalid custom template ${type}:`, validation.errors);
        }
      }

      this.customTemplatesLoaded = true;
    } catch (error) {
      console.error("Failed to load custom templates:", error);
    }
  }

  /**
   * Get template by type
   */
  getTemplate(type: ArtifactType): ArtifactTemplate | null {
    return this.templates.get(type) || null;
  }

  /**
   * Register a new template programmatically
   */
  registerTemplate(template: ArtifactTemplate): void {
    const validation = validateTemplate(template);
    if (!validation.valid) {
      throw new Error(`Invalid template: ${validation.errors.join(", ")}`);
    }
    this.templates.set(template.type, template);
  }

  /**
   * Check if a template exists
   */
  hasTemplate(type: ArtifactType): boolean {
    return this.templates.has(type);
  }

  /**
   * Get all registered template types
   */
  getTemplateTypes(): ArtifactType[] {
    return Array.from(this.templates.keys());
  }

  /**
   * Get all templates
   */
  getAllTemplates(): ArtifactTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Check if custom templates were loaded
   */
  hasCustomTemplates(): boolean {
    return this.customTemplatesLoaded;
  }
}

/**
 * Singleton instance of the template registry
 */
let globalRegistry: TemplateRegistry | null = null;

/**
 * Get or create the global template registry
 */
export function getTemplateRegistry(): TemplateRegistry {
  if (!globalRegistry) {
    // Try to load from environment-specified directory
    const customDir = process.env.TEMPLATE_CONFIG_DIR;
    const configDir = customDir
      ? join(process.cwd(), "..", customDir)
      : join(process.cwd(), "..", ".config", "templates", "m2p");

    globalRegistry = new TemplateRegistry(configDir);
  }
  return globalRegistry;
}

/**
 * Reset the global registry (useful for testing)
 */
export function resetTemplateRegistry(): void {
  globalRegistry = null;
}
