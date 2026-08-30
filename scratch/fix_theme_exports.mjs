import fs from 'fs';
import path from 'path';

const themeDir = path.join(process.cwd(), 'apps', 'mobile', 'src', 'theme');

const indexCode = `export * from './colors';
export * from './spacing';
export * from './radius';
export * from './Typography';
export * from './shadows';
export * from './layout';
export * from './motion';
export * from './icons';
export * from './ThemeProvider';
`;

fs.writeFileSync(path.join(themeDir, 'index.ts'), indexCode, 'utf8');
fs.writeFileSync(path.join(themeDir, 'tokens.ts'), indexCode, 'utf8');
console.log('✅ Theme index files successfully written.');
