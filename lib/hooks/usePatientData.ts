import { AuditLog } from '../types/audit';
   const auditLog: AuditLog = {
     id: Date.now().toString(),
     userId: 'current_user_id',
     action: 'update',
     resourceType: 'patient',
     resourceId: patientId,
     oldValue: patient,
     newValue: newData,
     timestamp: new Date(),
   };
   await setDoc(doc(db, 'auditLogs', auditLog.id), auditLog);
