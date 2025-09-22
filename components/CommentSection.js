import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

// Komponen CommentSection untuk menampilkan dan menambah komentar
const CommentSection = ({ roomId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [username, setUsername] = useState('');

  // Mengambil komentar dari Firestore secara real-time
  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, 'comments'),
      where('roomId', '==', roomId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = [];
      snapshot.forEach((doc) => {
        commentsData.push({ id: doc.id, ...doc.data() });
      });
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [roomId]);

  // Fungsi untuk menambah komentar baru
  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !username.trim()) return;

    try {
      await addDoc(collection(db, 'comments'), {
        roomId,
        username: username.trim(),
        text: newComment.trim(),
        timestamp: serverTimestamp()
      });

      setNewComment('');
    } catch (error) {
      console.error('Error adding comment: ', error);
      alert('Gagal menambah komentar. Silakan coba lagi.');
    }
  };

  // Format timestamp untuk ditampilkan
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="comment-section mt-6">
      <h2 className="text-xl font-bold mb-4">Komentar</h2>
      
      <form onSubmit={handleAddComment} className="mb-4">
        <div className="flex mb-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nama Anda"
            className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Tambahkan komentar..."
            className="flex-2 p-2 border-t border-b focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition"
          >
            Kirim
          </button>
        </div>
      </form>
      
      <div>
        {comments.map((comment) => (
          <div key={comment.id} className="comment">
            <div className="flex justify-between items-start">
              <div>
                <span className="comment-username">{comment.username}</span>
                <span>{comment.text}</span>
              </div>
              <span className="comment-time">{formatTime(comment.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
