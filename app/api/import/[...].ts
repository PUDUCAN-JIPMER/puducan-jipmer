import { NextApiRequest, NextApiResponse } from 'next';
 import { importPatients } from '../../../lib/import/importUtils';
 import { db } from '../../../lib/firebase';

 export default async function handler(req: NextApiRequest, res: NextApiResponse) {
   if (req.method === 'POST') {
     const { rows, activeTab } = req.body;
     try {
       await importPatients(rows, activeTab, db);
       res.status(200).json({ message: 'Import successful' });
     } catch (error) {
       res.status(500).json({ message: 'Import failed', error: error.message });
     }
   } else {
     res.setHeader('Allow', ['POST']);
     res.status(405).end(`Method ${req.method} Not Allowed`);
   }
 }
