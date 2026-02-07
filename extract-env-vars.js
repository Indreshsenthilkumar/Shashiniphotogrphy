/**
 * 🔐 ENVIRONMENT VARIABLES EXTRACTOR
 * 
 * This script extracts all environment variables from your local files
 * and displays them in a format ready to copy-paste into Render.
 * 
 * Usage:
 *   cd d:\photographybyag
 *   node extract-env-vars.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔐 EXTRACTING ENVIRONMENT VARIABLES FOR RENDER\n');
console.log('━'.repeat(70));

// Read credentials.json
const credentialsPath = path.join(__dirname, 'backend', 'credentials.json');
let credentials = null;

if (fs.existsSync(credentialsPath)) {
    try {
        const credContent = fs.readFileSync(credentialsPath, 'utf8');
        credentials = JSON.parse(credContent);
        console.log('✅ Found credentials.json\n');
    } catch (error) {
        console.error('❌ Error reading credentials.json:', error.message);
        process.exit(1);
    }
} else {
    console.error('❌ credentials.json not found at:', credentialsPath);
    console.log('   Make sure you have the Google service account credentials file.\n');
    process.exit(1);
}

// Read .env file
const envPath = path.join(__dirname, 'backend', '.env');
let envVars = {};

if (fs.existsSync(envPath)) {
    try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                if (key && valueParts.length > 0) {
                    envVars[key.trim()] = valueParts.join('=').trim();
                }
            }
        });
        console.log('✅ Found .env file\n');
    } catch (error) {
        console.error('❌ Error reading .env:', error.message);
    }
} else {
    console.warn('⚠️  .env file not found - using defaults\n');
}

console.log('━'.repeat(70));
console.log('\n📋 COPY THESE ENVIRONMENT VARIABLES TO RENDER:\n');
console.log('━'.repeat(70));
console.log('\nFor each variable below:');
console.log('1. Click "+ Add Environment Variable" in Render');
console.log('2. Copy the KEY (left side)');
console.log('3. Copy the VALUE (right side)\n');
console.log('━'.repeat(70));

// Display all variables
const variables = [
    {
        key: 'PORT',
        value: '10000',
        description: 'Server port (Render uses 10000)'
    },
    {
        key: 'MASTER_FOLDER_ID',
        value: envVars.MASTER_FOLDER_ID || 'your_master_folder_id_here',
        description: 'Google Drive master folder ID',
        warning: envVars.MASTER_FOLDER_ID ? null : '⚠️  UPDATE THIS with your actual folder ID!'
    },
    {
        key: 'DELIVERY_FOLDER_ID',
        value: envVars.DELIVERY_FOLDER_ID || '1SvnOWqKVPGMlZBKhriYLsI3fHDUcCv9z',
        description: 'Google Drive delivery folder ID'
    },
    {
        key: 'CALCOM_API_KEY',
        value: envVars.CALCOM_API_KEY || 'cal_live_82cc72c8ac1ec02b20a64b5412c51852',
        description: 'Cal.com API key for booking integration'
    },
    {
        key: 'CALCOM_WEBHOOK_SECRET',
        value: envVars.CALCOM_WEBHOOK_SECRET || 'calcom_secret_placeholder',
        description: 'Cal.com webhook secret'
    },
    {
        key: 'GOOGLE_CLIENT_EMAIL',
        value: credentials.client_email,
        description: 'Google service account email'
    },
    {
        key: 'GOOGLE_PRIVATE_KEY',
        value: credentials.private_key,
        description: 'Google service account private key (ENTIRE key with BEGIN/END)',
        isLong: true
    }
];

variables.forEach((v, index) => {
    console.log(`\n${index + 1}. ${v.description}`);
    console.log('─'.repeat(70));
    console.log(`KEY:   ${v.key}`);

    if (v.isLong) {
        // For private key, show preview
        const preview = v.value.substring(0, 50) + '...' + v.value.substring(v.value.length - 30);
        console.log(`VALUE: ${preview}`);
        console.log('\n⚠️  IMPORTANT: Copy the ENTIRE private key including:');
        console.log('   - -----BEGIN PRIVATE KEY-----');
        console.log('   - All the content (with \\n characters)');
        console.log('   - -----END PRIVATE KEY-----');
    } else {
        console.log(`VALUE: ${v.value}`);
    }

    if (v.warning) {
        console.log(`\n${v.warning}`);
    }
});

console.log('\n' + '━'.repeat(70));
console.log('\n💾 SAVING TO FILE: render-env-vars.txt\n');

// Save to file for easy reference
const outputLines = [
    '🔐 RENDER ENVIRONMENT VARIABLES',
    '='.repeat(70),
    '',
    'Copy these variables to Render.com:',
    'Dashboard → Your Service → Environment → Add Environment Variable',
    '',
    '='.repeat(70),
    ''
];

variables.forEach((v, index) => {
    outputLines.push(`${index + 1}. ${v.key}`);
    outputLines.push('-'.repeat(70));
    outputLines.push(`Description: ${v.description}`);
    outputLines.push(`Value: ${v.value}`);
    if (v.warning) {
        outputLines.push(`WARNING: ${v.warning}`);
    }
    outputLines.push('');
});

outputLines.push('='.repeat(70));
outputLines.push('');
outputLines.push('⚠️  SECURITY WARNING:');
outputLines.push('- Do NOT commit this file to GitHub');
outputLines.push('- Do NOT share these credentials publicly');
outputLines.push('- Keep this file secure and delete after deployment');
outputLines.push('');

const outputPath = path.join(__dirname, 'render-env-vars.txt');
fs.writeFileSync(outputPath, outputLines.join('\n'), 'utf8');

console.log(`✅ Saved to: ${outputPath}`);
console.log('\n📖 You can open this file to copy-paste variables easily.\n');

console.log('━'.repeat(70));
console.log('\n✅ NEXT STEPS:\n');
console.log('1. Go to Render.com → Your Web Service');
console.log('2. Scroll to "Environment Variables" section');
console.log('3. For each variable above, click "+ Add Environment Variable"');
console.log('4. Copy the KEY and VALUE from above');
console.log('5. Click "Create Web Service" when done');
console.log('\n📚 For detailed instructions, see: RENDER_ENVIRONMENT_VARIABLES_GUIDE.md\n');
console.log('━'.repeat(70) + '\n');

// Check for common issues
console.log('🔍 VALIDATION:\n');

const issues = [];

if (!credentials.client_email || !credentials.client_email.includes('@')) {
    issues.push('❌ GOOGLE_CLIENT_EMAIL looks invalid');
}

if (!credentials.private_key || !credentials.private_key.includes('BEGIN PRIVATE KEY')) {
    issues.push('❌ GOOGLE_PRIVATE_KEY is missing or invalid');
}

if (envVars.MASTER_FOLDER_ID === 'your_master_folder_id_here') {
    issues.push('⚠️  MASTER_FOLDER_ID needs to be updated with your actual folder ID');
}

if (issues.length > 0) {
    console.log('⚠️  ISSUES FOUND:\n');
    issues.forEach(issue => console.log(`   ${issue}`));
    console.log('\n   Please fix these before deploying!\n');
} else {
    console.log('✅ All variables look good!\n');
}

console.log('━'.repeat(70) + '\n');
