import React, { useState } from 'react';
 import { Modal, Table } from 'antd';
 import { useImportPreview } from '../../../lib/import/importUtils';

 const ImportPreviewModal: React.FC = () => {
   const [visible, setVisible] = useState(false);
   const { previewData, errors } = useImportPreview();

   const handleOk = () => setVisible(false);
   const handleCancel = () => setVisible(false);

   return (
     <Modal
       title="Import Preview"
       visible={visible}
       onOk={handleOk}
       onCancel={handleCancel}
     >
       <Table dataSource={previewData} pagination={false} scroll={{ y: 200 }}>
         <Table.Column title="Row" dataIndex="row" key="row" />
         <Table.Column title="Data" dataIndex="data" key="data" />
       </Table>
       {errors.length > 0 && (
         <div style={{ marginTop: 16, color: 'red' }}>
           Errors:
           <ul>
             {errors.map((error, index) => (
               <li key={index}>{error}</li>
             ))}
           </ul>
         </div>
       )}
     </Modal>
   );
 }

 export default ImportPreviewModal;
