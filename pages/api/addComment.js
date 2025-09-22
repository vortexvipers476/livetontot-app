import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// API Route untuk menambah komentar
export default async function handler(req, res) {
  // Hanya menerima POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { roomId, username, text } = req.body;

    // Validasi input
    if (!roomId || !username || !text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Tambah komentar baru ke koleksi 'comments'
    const commentRef = await addDoc(collection(db, 'comments'), {
      roomId,
      username,
      text,
      timestamp: serverTimestamp()
    });

    return res.status(201).json({ 
      success: true, 
      commentId: commentRef.id,
      message: 'Comment added successfully' 
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({ error: 'Failed to add comment' });
  }
}
