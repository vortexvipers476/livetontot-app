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
    <div className="comment-section fade-in">
      <h2 className="text-xl font-bold text-white mb-4">Komentar</h2>
      
      <form onSubmit={handleAddComment} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nama Anda"
            className="flex-1 px-4 py-3 rounded-lg"
            required
          />
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Tambahkan komentar..."
            className="flex-2 px-4 py-3 rounded-lg"
            required
          />
          <button
            type="submit"
            className="btn btn-primary"
          >
            Kirim
          </button>
        </div>
      </form>
      
      <div className="space-y-3">
        {comments.length === 0 ? (
          <div className="text-center py-6 text-slate-400">
            <svg className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="mt-2">Belum ada komentar. Jadilah yang pertama!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment fade-in">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className="comment-username">{comment.username}</span>
                  <p className="text-slate-300 mt-1">{comment.text}</p>
                </div>
                <span className="comment-time ml-2 whitespace-nowrap">{formatTime(comment.timestamp)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
