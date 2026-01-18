import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export async function getProducts() {
  const content = await fs.readFile(path.join(DATA_DIR, 'products.json'), 'utf-8');
  return JSON.parse(content);
}

export async function getShows() {
  const content = await fs.readFile(path.join(DATA_DIR, 'shows.json'), 'utf-8');
  return JSON.parse(content);
}

export async function getMusic() {
  const content = await fs.readFile(path.join(DATA_DIR, 'music.json'), 'utf-8');
  return JSON.parse(content);
}

export async function getAbout() {
  const content = await fs.readFile(path.join(DATA_DIR, 'about.json'), 'utf-8');
  return JSON.parse(content);
}

export async function getMedia() {
  const content = await fs.readFile(path.join(DATA_DIR, 'media.json'), 'utf-8');
  return JSON.parse(content);
}

export async function getHomepage() {
  const content = await fs.readFile(path.join(DATA_DIR, 'homepage.json'), 'utf-8');
  return JSON.parse(content);
}
