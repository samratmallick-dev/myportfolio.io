import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import Logger from '../../config/logger/logger.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesDir = path.resolve(__dirname, "../../template");

class TemplateService {
      async render(templateName, variables = {}) {
            try {
                  const filePath = path.join(templatesDir, `${templateName}.html`);

                  let html = await readFile(filePath, "utf-8");

                  // Replace variables in the template
                  for (const [key, value] of Object.entries(variables)) {
                        const regex = new RegExp(`{{${key}}}`, 'g');
                        html = html.replace(regex, String(value));
                  }

                  return html;
            } catch (error) {
                  Logger.error(`Template rendering failed for "${templateName}":`, error);
                  throw new Error(
                        `Template rendering failed for "${templateName}": ${error.message}`
                  );
            }
      }

      async getTemplateList() {
            try {
                  const { readdir } = await import("fs/promises");
                  const files = await readdir(templatesDir);
                  return files.filter(file => file.endsWith('.html')).map(file => file.replace('.html', ''));
            } catch (error) {
                  Logger.error('Failed to read templates directory:', error);
                  return [];
            }
      }
}

const templateService = new TemplateService();

export default templateService;
