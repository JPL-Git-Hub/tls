import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

export const syncClientName = onDocumentUpdated("clients/{clientId}", async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  
  if (!before || !after) {
    return;
  }
  
  const nameChanged = before.firstName !== after.firstName || before.lastName !== after.lastName;
  
  if (nameChanged) {
    functions.logger.info("Client name changed", {
      clientId: event.params.clientId,
      before: { firstName: before.firstName, lastName: before.lastName },
      after: { firstName: after.firstName, lastName: after.lastName }
    });

    const newClientName = `${after.firstName} ${after.lastName}`;
    
    const snapshot = await admin.firestore().collection("portals")
      .where("clientId", "==", event.params.clientId)
      .get();
      
    const batch = admin.firestore().batch();
    
    snapshot.forEach(doc => {
      batch.update(doc.ref, { 
        clientName: newClientName,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    
    functions.logger.info("Updated portals with new client name", {
      clientId: event.params.clientId,
      clientName: newClientName,
      portalCount: snapshot.docs.length
    });
  }
});