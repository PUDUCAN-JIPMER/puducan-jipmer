import React, { useState } from 'react';
 import { Button, Upload, message } from 'antd';
 import { useImportPreview } from '../../../lib/import/importUtils';

 const ImportForm: React.FC = () => {
   const [file, setFile] = useState<File | null>(null);
   const { previewData, errors } = useImportPreview();

   const handleFileChange = (info: any) => {
     if (info.file.status === 'done') {
       setFile(info.file.originFileObj);
     }
   };

   const handleImport = async () => {
     if (file) {
       try {
         const reader = new FileReader();
         reader.onload = async (e) => {
           const data = new Uint8Array(e.target?.result as ArrayBuffer);
           const workbook = XLSX.read(data, { type: 'array' });
           const sheetName = workbook.SheetNames[0];
           const worksheet = workbook.Sheets[sheetName];
           const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }).slice(1);
           const activeTab = 'patients';
           await importPatients(rows, activeTab, db);
           message.success('Import successful');
         };
         reader.readAsArrayBuffer(file);
       } catch (error) {
         message.error('Import failed');
       }
     }
   };

   return (
     <div>
       <Upload onChange={handleFileChange} accept=".xlsx, .xls">
         <Button icon={<UploadOutlined />}>Select File</Button>
       </Upload>
       <Button type="primary" onClick={handleImport} style={{ marginTop: 16 }}>
         Import
       </Button>
       <ImportPreviewModal previewData={previewData} errors={errors} />
     </div>
   );
 }

 export default ImportForm;
