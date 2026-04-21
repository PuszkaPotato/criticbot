import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, 'criticbot.log');

function write(level, tag, message) {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] [${level}] [${tag}] ${message}`;
    console.log(line);
    fs.appendFileSync(LOG_FILE, line + '\n');
}

export const logger = {
    info:  (tag, msg) => write('INFO ', tag, msg),
    warn:  (tag, msg) => write('WARN ', tag, msg),
    error: (tag, msg) => write('ERROR', tag, msg),
};
