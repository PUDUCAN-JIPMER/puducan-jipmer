import { db } from "@/firebase";
import {doc, writeBatch} from "firebase/firestore";

export async function bulkDeletePatients(
    ids: string[],
    collectionNames: string
): Promise<void> {
    const BATCH_SIZE = 500; // Firestore batch limit
    const chunks: string[][] = [];

    for ( let i = 0; i < ids.length; i += BATCH_SIZE) {
        chunks.push(ids.slice(i, i + BATCH_SIZE));
    }

    for (const chunk of chunks) {
        const batch = writeBatch(db)
        chunk.forEach((id) => {
            const ref = doc(db, collectionNames, id);
            batch.delete(ref);
        })
        await batch.commit();
    }

}