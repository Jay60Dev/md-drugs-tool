import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

const jobsDir = path.join(__dirname, 'jobs');
const jobFiles = fs.readdirSync(jobsDir).map(file => path.basename(file, path.extname(file)));

console.log(jobFiles);

// // const jobsList = [
//     "beanmachine",
//     "bestbudz",
//     "burgershot",
//     "deerdiner",
//     "fishnchips",
//     "hookies",
//     "hornys",
//     "limeys",
//     "morpheouspub",
//     // "pizzeria",
//     // "popsdiner",
//     // "tacoshop",
//     // "tequilala",
//     // "uwucafe",
// ];

// i need to edit main.js list, to use jobFiles array

const mainJsPath = path.join(__dirname, 'main.js');

// replace const jobsList = [\s*([^]*?)\s*]; with const jobsList = jobFiles;

let mainJsContent = fs.readFileSync(mainJsPath, 'utf-8');
mainJsContent = mainJsContent.replace(/const jobsList = \[\s*([^]*?)\s*];/, `const jobsList = ${JSON.stringify(jobFiles)};`);
fs.writeFileSync(mainJsPath, mainJsContent, 'utf-8');
