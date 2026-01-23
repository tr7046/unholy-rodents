import { promises as fs } from 'fs';
import path from 'path';

// Use __dirname equivalent for ES modules to get reliable path
// process.cwd() can vary in Next.js depending on how the app is run
const DATA_DIR = path.join(process.cwd(), 'data');

export type DataFile = 'products' | 'shows' | 'music' | 'about' | 'media' | 'homepage' | 'orders' | 'visibility';

export async function readData<T>(file: DataFile): Promise<T> {
  const filePath = path.join(DATA_DIR, `${file}.json`);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`[data.ts] Failed to read ${filePath}:`, error);
    throw error;
  }
}

export async function writeData<T>(file: DataFile, data: T): Promise<void> {
  const filePath = path.join(DATA_DIR, `${file}.json`);
  try {
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`[data.ts] Successfully wrote to ${filePath}`);
  } catch (error) {
    console.error(`[data.ts] Failed to write ${filePath}:`, error);
    throw error;
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
