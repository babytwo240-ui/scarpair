const fs = require('fs');
const path = require('path');

function removeBOM(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== 'build') {
                removeBOM(filePath);
            }
        } else if (file.match(/\.(js|jsx|ts|tsx)$/)) {
            let content = fs.readFileSync(filePath);
            if (content[0] === 0xEF && content[1] === 0xBB && content[2] === 0xBF) {
                console.log(`Removing BOM from ${filePath}`);
                content = content.slice(3);
                fs.writeFileSync(filePath, content);
            }
        }
    });
}

const workspaces = [
    'c:/Users/Admin/Desktop/scarpair/backend/src',
    'c:/Users/Admin/Desktop/scarpair/frontend/src',
    'c:/Users/Admin/Desktop/scarpair/admin/backend/src',
    'c:/Users/Admin/Desktop/scarpair/admin/frontend/src'
];

workspaces.forEach(ws => {
    if (fs.existsSync(ws)) {
        removeBOM(ws);
    }
});
