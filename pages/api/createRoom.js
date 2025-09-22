import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// API Route untuk membuat room baru
export default async function handler(req, res) {
  // Hanya menerima POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { namaGroup, videoUrl, maxUsers } = req.body;

    // Validasi input
    if (!namaGroup || !videoUrl || !maxUsers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Buat room baru di Firestore
    const roomRef = await addDoc(collection(db, 'rooms'), {
      namaGroup,
      videoURL: videoUrl,
      maxUsers: parseInt(maxUsers),
      createdAt: serverTimestamp(),
      users: [],
      comments: []
    });

    // Kembalikan ID room yang baru dibuat
    return res.status(201).json({ 
      success: true, 
      roomId: roomRef.id,
      message: 'Room created successfully' 
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return res.status(500).json({ error: 'Failed to create room' });
  }
}
