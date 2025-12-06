/**
 * MongoDB CRUD Test Script
 * 
 * This script tests all database operations:
 * - Create project
 * - Read project
 * - Update project
 * - Delete project
 * 
 * Run in browser console at http://localhost:3000
 */

async function testMongoDB() {
    console.log('🧪 Starting MongoDB CRUD Tests...\n');

    let testProjectId = null;
    let passedTests = 0;
    let failedTests = 0;

    // Test 1: Create Project
    console.log('Test 1: CREATE Project');
    try {
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Project - MongoDB',
                config: {
                    position: 'right',
                    websiteUrl: 'https://test.example.com',
                    colors: {
                        primary: '#FF0000',
                        header: '#FF0000',
                        background: '#FFFFFF',
                        foreground: '#000000',
                        input: '#F3F4F6',
                    },
                    branding: {
                        chatIcon: null,
                        agentIcon: null,
                        userIcon: null,
                        showChatIcon: true,
                        showAgentAvatar: true,
                        showUserAvatar: true,
                    },
                    text: {
                        headerTitle: 'Test Chat',
                        welcomeMessage: 'Test Welcome',
                        placeholder: 'Test Placeholder',
                    },
                    persona: {
                        tone: 'friendly',
                        agentType: 'general',
                        responseLength: 'balanced',
                        customInstructions: 'Test instructions',
                    },
                },
            }),
        });

        if (response.ok) {
            const data = await response.json();
            testProjectId = data.project.id;
            console.log('✅ PASS: Project created successfully');
            console.log('   Project ID:', testProjectId);
            console.log('   Project Name:', data.project.name);
            passedTests++;
        } else {
            console.error('❌ FAIL: Failed to create project');
            console.error('   Status:', response.status);
            console.error('   Response:', await response.text());
            failedTests++;
        }
    } catch (error) {
        console.error('❌ FAIL: Error creating project:', error);
        failedTests++;
    }
    console.log('');

    if (!testProjectId) {
        console.error('❌ Cannot continue tests without project ID');
        return;
    }

    // Test 2: Read Project
    console.log('Test 2: READ Project');
    try {
        const response = await fetch(`/api/projects/${testProjectId}`);

        if (response.ok) {
            const data = await response.json();
            if (data.project.id === testProjectId && data.project.name === 'Test Project - MongoDB') {
                console.log('✅ PASS: Project read successfully');
                console.log('   Retrieved:', data.project.name);
                console.log('   Website URL:', data.project.config.websiteUrl);
                passedTests++;
            } else {
                console.error('❌ FAIL: Project data mismatch');
                failedTests++;
            }
        } else {
            console.error('❌ FAIL: Failed to read project');
            console.error('   Status:', response.status);
            failedTests++;
        }
    } catch (error) {
        console.error('❌ FAIL: Error reading project:', error);
        failedTests++;
    }
    console.log('');

    // Test 3: Update Project
    console.log('Test 3: UPDATE Project');
    try {
        const response = await fetch(`/api/projects/${testProjectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Updated Test Project',
                config: {
                    websiteUrl: 'https://updated.example.com',
                    position: 'left',
                    colors: {
                        primary: '#00FF00',
                        header: '#00FF00',
                        background: '#FFFFFF',
                        foreground: '#000000',
                        input: '#F3F4F6',
                    },
                    branding: {
                        chatIcon: null,
                        agentIcon: null,
                        userIcon: null,
                        showChatIcon: true,
                        showAgentAvatar: true,
                        showUserAvatar: true,
                    },
                    text: {
                        headerTitle: 'Updated Chat',
                        welcomeMessage: 'Updated Welcome',
                        placeholder: 'Updated Placeholder',
                    },
                    persona: {
                        tone: 'professional',
                        agentType: 'general',
                        responseLength: 'detailed',
                        customInstructions: 'Updated instructions',
                    },
                },
            }),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.project.name === 'Updated Test Project' &&
                data.project.config.websiteUrl === 'https://updated.example.com' &&
                data.project.config.colors.primary === '#00FF00') {
                console.log('✅ PASS: Project updated successfully');
                console.log('   New name:', data.project.name);
                console.log('   New URL:', data.project.config.websiteUrl);
                console.log('   New color:', data.project.config.colors.primary);
                passedTests++;
            } else {
                console.error('❌ FAIL: Update data mismatch');
                failedTests++;
            }
        } else {
            console.error('❌ FAIL: Failed to update project');
            console.error('   Status:', response.status);
            failedTests++;
        }
    } catch (error) {
        console.error('❌ FAIL: Error updating project:', error);
        failedTests++;
    }
    console.log('');

    // Test 4: List Projects
    console.log('Test 4: LIST Projects');
    try {
        const response = await fetch('/api/projects');

        if (response.ok) {
            const data = await response.json();
            const found = data.projects.find(p => p.id === testProjectId);
            if (found) {
                console.log('✅ PASS: Project found in list');
                console.log('   Total projects:', data.projects.length);
                passedTests++;
            } else {
                console.error('❌ FAIL: Project not found in list');
                failedTests++;
            }
        } else {
            console.error('❌ FAIL: Failed to list projects');
            failedTests++;
        }
    } catch (error) {
        console.error('❌ FAIL: Error listing projects:', error);
        failedTests++;
    }
    console.log('');

    // Test 5: Delete Project
    console.log('Test 5: DELETE Project');
    try {
        const response = await fetch(`/api/projects/${testProjectId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            console.log('✅ PASS: Project deleted successfully');
            passedTests++;

            // Verify deletion
            const verifyResponse = await fetch(`/api/projects/${testProjectId}`);
            if (verifyResponse.status === 404) {
                console.log('✅ PASS: Deletion verified (404)');
                passedTests++;
            } else {
                console.error('❌ FAIL: Project still exists after deletion');
                failedTests++;
            }
        } else {
            console.error('❌ FAIL: Failed to delete project');
            console.error('   Status:', response.status);
            failedTests++;
        }
    } catch (error) {
        console.error('❌ FAIL: Error deleting project:', error);
        failedTests++;
    }
    console.log('');

    // Summary
    console.log('═'.repeat(50));
    console.log('📊 Test Summary');
    console.log('═'.repeat(50));
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
    console.log('═'.repeat(50));

    if (failedTests === 0) {
        console.log('\n🎉 All tests passed! MongoDB integration is working correctly.');
    } else {
        console.log('\n⚠️ Some tests failed. Check the errors above.');
    }

    return {
        passed: passedTests,
        failed: failedTests,
        total: passedTests + failedTests,
    };
}

// Make function available globally
window.testMongoDB = testMongoDB;

console.log('📝 MongoDB Test Script Loaded!');
console.log('Run: await testMongoDB()');
