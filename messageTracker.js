import fs from 'fs';

const PATH = './config.json';

const read = () => JSON.parse(fs.readFileSync(PATH, 'utf8'));
const write = (data) => fs.writeFileSync(PATH, JSON.stringify(data, null, 2));

export const isFirstMessageToday = () => {
    const today = new Date().toISOString().split('T')[0];
    const last = read().lastEmpressMessageDate;
    return last !== today;
};

export const updateEmpressMessageDate = () => {
    const today = new Date().toISOString().split('T')[0];
    write({ ...read(), lastEmpressMessageDate: today });
};