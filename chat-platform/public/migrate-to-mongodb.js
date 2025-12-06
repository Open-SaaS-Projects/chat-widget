/**
 * Migration Script: localStorage to MongoDB
 * 
 * This script helps migrate existing projects from browser localStorage to MongoDB
 * 
 * Usage:
 * 1. Open browser console on http://localhost:3000
 * 2. Copy and paste this entire script
 * 3. Run: await migrateToMongoDB()
 * 4. Follow the prompts
 */

async function migrateToMongoDB() {
    console.log('🔄 Starting migration from localStorage to MongoDB...\n');

    // Step 1: Export localStorage data
    console.log('Step 1: Exporting localStorage data...');
    const projects = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('project:')) {
            const projectJson = localStorage.getItem(key);
            if (projectJson) {
                try {
                    const project = JSON.parse(projectJson);
                    projects.push(project);
                } catch (error) {
                    console.error(`Failed to parse project ${key}:`, error);
                }
            }
        }
    }

    console.log(`✅ Found ${projects.length} projects in localStorage\n`);

    if (projects.length === 0) {
        console.log('No projects to migrate. Exiting.');
        return;
    }

    // Display projects
    console.log('Projects to migrate:');
    projects.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name} (${p.id})`);
    });
    console.log('');

    // Step 2: Confirm migration
    const confirm = window.confirm(
        `Migrate ${projects.length} project(s) to MongoDB?\n\n` +
        `This will:\n` +
        `1. Upload all projects to MongoDB\n` +
        `2. Keep localStorage data intact (you can clear it manually later)\n\n` +
        `Continue?`
    );

    if (!confirm) {
        console.log('❌ Migration cancelled');
        return;
    }

    // Step 3: Send to server
    console.log('Step 2: Uploading to MongoDB...');

    try {
        const response = await fetch('/api/projects/migrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projects }),
        });

        const result = await response.json();

        console.log('\n📊 Migration Results:');
        console.log(`   ✅ Success: ${result.results.success}`);
        console.log(`   ❌ Failed: ${result.results.failed}`);

        if (result.results.errors.length > 0) {
            console.log('\n⚠️ Errors:');
            result.results.errors.forEach(err => console.log(`   - ${err}`));
        }

        if (result.results.success > 0) {
            console.log('\n✅ Migration successful!');
            console.log('\nNext steps:');
            console.log('1. Refresh the page to see your migrated projects');
            console.log('2. Verify all projects loaded correctly');
            console.log('3. (Optional) Clear localStorage by running: clearLocalStorage()');
        }

        return result;
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

/**
 * Clear localStorage after successful migration
 * CAUTION: This will delete all project data from localStorage!
 */
function clearLocalStorage() {
    const confirm = window.confirm(
        '⚠️ WARNING: This will permanently delete all project data from localStorage!\n\n' +
        'Make sure you have:\n' +
        '1. Successfully migrated to MongoDB\n' +
        '2. Verified all projects are in the database\n\n' +
        'Continue?'
    );

    if (!confirm) {
        console.log('❌ Cancelled');
        return;
    }

    const keysToDelete = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('project:') || key.startsWith('projects:'))) {
            keysToDelete.push(key);
        }
    }

    keysToDelete.forEach(key => localStorage.removeItem(key));

    console.log(`✅ Cleared ${keysToDelete.length} items from localStorage`);
    console.log('Refresh the page to verify projects still load from MongoDB');
}

// Export functions to window for easy access
window.migrateToMongoDB = migrateToMongoDB;
window.clearLocalStorage = clearLocalStorage;

console.log('📝 Migration script loaded!');
console.log('');
console.log('Available commands:');
console.log('  await migrateToMongoDB()  - Migrate localStorage to MongoDB');
console.log('  clearLocalStorage()       - Clear localStorage (after migration)');
console.log('');
