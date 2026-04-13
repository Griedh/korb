import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { FileReadError } from './errors.js';

export interface CurrentStore { wwIdent: string; zipCode: string }

const configDir = () => join(process.env.XDG_CONFIG_HOME ?? join(homedir(), '.config'), 'korb');

export const writeSettings = (wwIdent: string, zipCode: string): CurrentStore => {
  const dir = configDir();
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'selected_store'), wwIdent);
  writeFileSync(join(dir, 'selected_zip'), zipCode);
  return { wwIdent, zipCode };
};

export const readSettings = (): CurrentStore => {
  const dir = configDir();
  try {
    const wwIdent = readFileSync(join(dir, 'selected_store'), 'utf8');
    const zipCode = readFileSync(join(dir, 'selected_zip'), 'utf8');
    return { wwIdent, zipCode };
  } catch (e) {
    throw new FileReadError(String(e));
  }
};
