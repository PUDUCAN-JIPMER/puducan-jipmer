import useAuditLogs from '../lib/hooks/useAuditLogs';
  const auditLogs = useAuditLogs(user?.uid || '');
     <h2>Audit Logs</h2>
     <ul>
       {auditLogs.map(log => (
         <li key={log.id}>{log.action} on {log.resourceType} {log.resourceId} by {log.userId} at {log.timestamp}</li>
       ))}
     </ul>
