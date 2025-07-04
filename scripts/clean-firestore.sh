#!/bin/bash

# Clean Firestore Database Script
# Deletes all documents from clients, portals, and cases collections

set -e  # Exit on any error

PROJECT_ID="tls-unified"

echo "🧹 Starting Firestore database cleanup for project: ${PROJECT_ID}"
echo ""

# Function to delete all documents in a collection using Firebase Admin SDK
delete_collection() {
    local collection=$1
    echo "🔍 Deleting documents from ${collection} collection..."
    
    npx tsx --env-file=.env.local -e "
const { adminDb } = require('./src/lib/firebase/admin');

async function deleteCollectionDocs(collectionName) {
  try {
    let deletedCount = 0;
    
    const deleteDocsPage = async () => {
      const snapshot = await adminDb.collection(collectionName).limit(500).get();
      
      if (snapshot.empty) {
        return;
      }
      
      const batch = adminDb.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        deletedCount++;
      });
      
      await batch.commit();
      console.log(\`   📄 Deleted \${snapshot.size} documents from \${collectionName}\`);
      
      // Continue if there might be more documents
      if (snapshot.size === 500) {
        await deleteDocsPage();
      }
    };
    
    await deleteDocsPage();
    
    if (deletedCount === 0) {
      console.log(\`   ✅ \${collectionName} collection was already empty\`);
    } else {
      console.log(\`   ✅ Deleted \${deletedCount} documents from \${collectionName}\`);
    }
  } catch (error) {
    console.error(\`❌ Error deleting \${collectionName} documents:\`, error.message);
    throw error;
  }
}

deleteCollectionDocs('${collection}').catch(error => {
  process.exit(1);
});"
    echo ""
}

# Clean each collection
delete_collection "clients"
delete_collection "portals"
delete_collection "cases"

# Clean Firebase Auth client users (preserve attorney accounts)
echo "🔐 Cleaning Firebase Auth client users..."

# Use Firebase Admin SDK to delete client users with pagination
echo "📋 Deleting client users using Firebase Admin SDK..."
npx tsx --env-file=.env.local -e "
const { adminAuth } = require('./src/lib/firebase/admin');

async function deleteClientUsers() {
  let attorneyCount = 0;
  let clientCount = 0;
  let deletedCount = 0;
  
  const deleteClientUsersPage = async (nextPageToken) => {
    try {
      const result = await adminAuth.listUsers(1000, nextPageToken);
      
      for (const user of result.users) {
        if (user.email) {
          const claims = user.customClaims || {};
          const isAttorney = user.email.endsWith('@thelawshop.com') || claims.role === 'attorney';
          
          if (isAttorney) {
            attorneyCount++;
            console.log('   👨‍💼 Preserving attorney:', user.email);
          } else {
            clientCount++;
            console.log('   👤 Deleting client:', user.email);
            await adminAuth.deleteUser(user.uid);
            deletedCount++;
          }
        }
      }
      
      // Continue pagination if more users exist
      if (result.pageToken) {
        await deleteClientUsersPage(result.pageToken);
      }
    } catch (error) {
      console.error('❌ Error processing users:', error.message);
      throw error;
    }
  };
  
  await deleteClientUsersPage();
  
  console.log('');
  console.log(\`👨‍💼 Attorney users preserved: \${attorneyCount}\`);
  console.log(\`👤 Client users deleted: \${deletedCount}\`);
  console.log('✅ Firebase Auth client cleanup completed');
}

deleteClientUsers().catch(error => {
  console.error('❌ Client user deletion failed:', error.message);
  process.exit(1);
});
"
echo ""

# Recreate clients collection with proper schema structure
echo "🔄 Recreating clients collection..."
npx tsx --env-file=.env.local -e "
const { adminDb } = require('./src/lib/firebase/admin');
const { COLLECTIONS } = require('./src/types/schemas');

async function recreateClientsCollection() {
  try {
    // Create placeholder document to establish clients collection structure
    const placeholderRef = adminDb.collection(COLLECTIONS.CLIENTS).doc('temp-collection-init');
    await placeholderRef.set({
      _placeholder: true,
      createdAt: new Date(),
      note: 'Temporary document to establish collection structure'
    });
    
    // Immediately delete the placeholder
    await placeholderRef.delete();
    
    console.log('   ✅ Recreated clients collection');
  } catch (error) {
    console.error('❌ Collection recreation failed:', JSON.stringify({
      error_code: 'FIRESTORE_COLLECTION_CREATE_FAILED',
      message: 'Failed to recreate clients collection structure',
      service: 'Firebase Firestore',
      operation: 'collection_recreation',
      context: { collection: COLLECTIONS.CLIENTS },
      remediation: 'Check Firebase Admin SDK permissions and project configuration',
      original_error: error.message
    }, null, 2));
    throw error;
  }
}

recreateClientsCollection().catch(error => {
  process.exit(1);
});
"

# Verify cleanup using Firebase Admin SDK
echo "🔍 Verifying cleanup..."
npx tsx --env-file=.env.local -e "
const { adminDb } = require('./src/lib/firebase/admin');

async function verifyCleanup() {
  const collections = ['clients', 'portals', 'cases'];
  
  for (const collection of collections) {
    try {
      const snapshot = await adminDb.collection(collection).limit(1).get();
      if (snapshot.empty) {
        console.log(\`✅ \${collection} collection: Empty\`);
      } else {
        console.log(\`⚠️  \${collection} collection: Still contains data\`);
      }
    } catch (error) {
      console.log(\`⚠️  \${collection} collection: Error checking - \${error.message}\`);
    }
  }
}

verifyCleanup().catch(error => {
  console.error('❌ Verification failed:', error.message);
  process.exit(1);
});"

echo ""
echo "🎉 Database cleanup completed!"
echo "📝 All client, portal, and case data has been removed."
echo "🔐 Client Firebase Auth users deleted (attorney accounts preserved)."
echo "💡 You can now create fresh test data without conflicts."