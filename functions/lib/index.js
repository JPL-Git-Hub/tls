'use strict'
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k
        var desc = Object.getOwnPropertyDescriptor(m, k)
        if (
          !desc ||
          ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k]
            },
          }
        }
        Object.defineProperty(o, k2, desc)
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k
        o[k2] = m[k]
      })
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v })
      }
    : function (o, v) {
        o['default'] = v
      })
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = []
          for (var k in o)
            if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k
          return ar
        }
      return ownKeys(o)
    }
    return function (mod) {
      if (mod && mod.__esModule) return mod
      var result = {}
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i])
      __setModuleDefault(result, mod)
      return result
    }
  })()
Object.defineProperty(exports, '__esModule', { value: true })
exports.syncClientName = void 0
const admin = __importStar(require('firebase-admin'))
const functions = __importStar(require('firebase-functions'))
const firestore_1 = require('firebase-functions/v2/firestore')
if (admin.apps.length === 0) {
  admin.initializeApp()
}
exports.syncClientName = (0, firestore_1.onDocumentUpdated)(
  'clients/{clientId}',
  async event => {
    var _a, _b
    const before =
      (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data()
    const after =
      (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data()
    if (!before || !after) {
      return
    }
    const nameChanged =
      before.firstName !== after.firstName || before.lastName !== after.lastName
    if (nameChanged) {
      functions.logger.info('Client name changed', {
        clientId: event.params.clientId,
        before: { firstName: before.firstName, lastName: before.lastName },
        after: { firstName: after.firstName, lastName: after.lastName },
      })
      const newClientName = `${after.firstName} ${after.lastName}`
      const snapshot = await admin
        .firestore()
        .collection('portals')
        .where('clientId', '==', event.params.clientId)
        .get()
      const batch = admin.firestore().batch()
      snapshot.forEach(doc => {
        batch.update(doc.ref, {
          clientName: newClientName,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
      })
      await batch.commit()
      functions.logger.info('Updated portals with new client name', {
        clientId: event.params.clientId,
        clientName: newClientName,
        portalCount: snapshot.docs.length,
      })
    }
  }
)
//# sourceMappingURL=index.js.map
