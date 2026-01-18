import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export type DataFile = 'products' | 'shows' | 'music' | 'about' | 'media' | 'homepage' | 'orders' | 'visibility';

export async function readData<T>(file: DataFile): Promise<T> {
  const filePath = path.join(DATA_DIR, `${file}.json`);
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

export async function writeData<T>(file: DataFile, data: T): Promise<void> {
  const filePath = path.join(DATA_DIR, `${file}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
