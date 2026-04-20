import fs from 'fs';

const PATH = './config.json';

const read = () => JSON.parse(fs.readFileSync(PATH, 'utf8'));
const write = (data) => fs.writeFileSync(PATH, JSON.stringify(data, null, 2));

export const get = () => read().crazinessLevel;
export const set = (val) => write({ ...read(), crazinessLevel: Math.max(0, Math.min(100, val)) });
export const increase = (by = 1) => set(get() + by);
export const decrease = (by = 1) => set(get() - by);
export const reset = () => set(0);