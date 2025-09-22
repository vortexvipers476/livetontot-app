import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

// API Route untuk join room
export default async function handler(req, res) {
  // Hanya menerima POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { roomId, userIp } = req.body;

    // Validasi input
    if (!roomId || !userIp) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Dapatkan referensi ke dokumen room
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    // Cek apakah room ada
    if (!roomSnap.exists()) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const roomData = roomSnap.data();

    // Cek apakah room sudah penuh
    if (roomData.users && roomData.users.length >= roomData.maxUsers) {
      return res.status(403).json({ error: 'Room is full' });
    }

    // Cek apakah user sudah join
    if (roomData.users && roomData.users.includes(userIp)) {
      return res.status(200).json({ 
        success: true, 
        message: 'User already joined',
        alreadyJoined: true
      });
    }

    // Update room dengan menambahkan user IP
    await updateDoc(roomRef, {
      users: arrayUnion(userIp)
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Joined room successfully',
      alreadyJoined: false
    });
  } catch (error) {
    console.error('Error joining room:', error);
    return res.status(500).json({ error: 'Failed to join room' });
  }
}
