/**
 * UPDATE FRONTEND URLs SCRIPT
 * Run this after deploying your backend to automatically update all API URLs
 * 
 * Usage:
 * 1. Deploy your backend to Render/Railway
 * 2. Get your backend URL (e.g., https://shashini-backend-abc123.onrender.com)
 * 3. Update BACKEND_URL below
 * 4. Run: node update-urls.js
 */

const fs = require('fs');
const path = require('path');

// ⚠️ UPDATE THIS WITH YOUR DEPLOYED BACKEND URL (without /api at the end)
const BACKEND_URL = 'https://shashiniphotogrphy-production.up.railway.app';

// Files to update
const files = [
    {
        path: path.join(__dirname, 'frontend', 'admin.js'),
        search: /const API_URL = ['"]http:\/\/127\.0\.0\.1:5001\/api['"];/,
        replace: `const API_URL = '${BACKEND_URL}/api';`
    },
    {
        path: path.join(__dirname, 'frontend', 'main.js'),
        search: /const API_URL = ['"]http:\/\/127\.0\.0\.1:5001\/api['"];/,
        replace: `const API_URL = '${BACKEND_URL}/api';`
    },
    {
        path: path.join(__dirname, 'frontend', 'config.js'),
        search: /const PRODUCTION_API_URL = ['"]https:\/\/your-backend-url\.onrender\.com\/api['"];/,
        replace: `const PRODUCTION_API_URL = '${BACKEND_URL}/api';`
    }
];

console.log('🚀 Updating Frontend URLs...\n');

if (BACKEND_URL === 'https://your-backend-url.onrender.com') {
    console.error('❌ ERROR: Please update BACKEND_URL in this script first!');
    console.log('   1. Deploy your backend to Render/Railway');
    console.log('   2. Copy your backend URL');
    console.log('   3. Update line 13 in this file');
    console.log('   4. Run this script again\n');
    process.exit(1);
}

let updatedCount = 0;
let errorCount = 0;

files.forEach(file => {
    try {
        if (!fs.existsSync(file.path)) {
            console.log(`⚠️  Skipping ${path.basename(file.path)} (file not found)`);
            return;
        }

        let content = fs.readFileSync(file.path, 'utf8');
        const originalContent = content;

        content = content.replace(file.search, file.replace);

        if (content !== originalContent) {
            fs.writeFileSync(file.path, content, 'utf8');
            console.log(`✅ Updated ${path.basename(file.path)}`);
            updatedCount++;
        } else {
            console.log(`ℹ️  No changes needed in ${path.basename(file.path)}`);
        }
    } catch (error) {
        console.error(`❌ Error updating ${path.basename(file.path)}:`, error.message);
        errorCount++;
    }
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (errorCount > 0) {
    console.log(`❌ Completed with ${errorCount} error(s)`);
    process.exit(1);
} else {
    console.log(`✅ Successfully updated ${updatedCount} file(s)!`);
    console.log(`\n📋 Next Steps:`);
    console.log(`   1. Test locally: npm run dev`);
    console.log(`   2. Commit changes: git add . && git commit -m "Update API URLs"`);
    console.log(`   3. Push to GitHub: git push origin main`);
    console.log(`   4. Netlify will auto-deploy your changes\n`);
}
