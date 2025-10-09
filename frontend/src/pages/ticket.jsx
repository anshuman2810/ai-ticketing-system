// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import ReactMarkdown from "react-markdown";

// export default function TicketDetailsPage() {
//   const { id } = useParams();
//   const [ticket, setTicket] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [replyText, setReplyText] = useState(''); // ✅ NEW: State for reply form input
//   const [submitting, setSubmitting] = useState(false); // ✅ NEW: State for submission status


//   const token = localStorage.getItem("token");

//   const userRole = (() => {
//     const userJson = localStorage.getItem('user');
//     try {
//       return userJson ? JSON.parse(userJson).role : null;
//     } catch (e) {
//       console.error("Failed to parse user role from localStorage:", e);
//       return null;
//     }
//   })();


//   const fetchTicket = async () => {
//     try {
//       const res = await fetch(
//         `${import.meta.env.VITE_SERVER_URL}/tickets/${id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       const data = await res.json();
//       if (res.ok) {
//         setTicket(data.ticket);
//       } else {
//         alert(data.message || "Failed to fetch ticket");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTicket();
//   }, [id, token]);


//   // ✅ ADDED: Function to handle reply submission
//   const handleReplySubmit = async (e) => {
//     e.preventDefault();
//     if (!replyText.trim()) return;

//     setSubmitting(true);

//     try {
//       const res = await fetch(
//         `${import.meta.env.VITE_SERVER_URL}/tickets/${id}/reply`, // The new POST route
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`,
//           },
//           body: JSON.stringify({ replyText }),
//         }
//       );

//       const data = await res.json();
//       if (res.ok) {
//         // Update the local state with the new reply object returned from the BE
//         // The BE sends back the new reply with the sender's email populated.
//         setTicket(prev => ({
//           ...prev,
//           replies: [...(prev.replies || []), data.reply] 
//         }));
//         setReplyText(''); // Clear the form
//       } else {
//         alert(`Failed to send reply: ${data.message}`);
//       }
//     } catch (error) {
//       console.error('Reply submission failed:', error);
//       alert('Network error or internal server error.');
//     } finally {
//         setSubmitting(false);
//     }
//   };
//   // -----------------------------------------------------------------


//   if (loading)
//     return <div className="text-center mt-10">Loading ticket details...</div>;
//   if (!ticket) return <div className="text-center mt-10">Ticket not found</div>;

//   return (
//     <div className="max-w-3xl mx-auto p-4">
//       <h2 className="text-2xl font-bold mb-4">Ticket Details</h2>

//       <div className="card bg-gray-800 shadow p-4 space-y-4">
//         <h3 className="text-xl font-semibold">{ticket.title}</h3>
//         <p>{ticket.description}</p>

//         {/* Conditionally render extended details */}
//         {ticket.status && (
//           <>
//             <div className="divider">Metadata</div>
//             <p>
//               <strong>Status:</strong> {ticket.status}
//             </p>
//             {ticket.priority && (
//               <p>
//                 <strong>Priority:</strong> {ticket.priority}
//               </p>
//             )}

//             {ticket.relatedSkills?.length > 0 && (
//               <p>
//                 <strong>Related Skills:</strong>{" "}
//                 {ticket.relatedSkills.join(", ")}
//               </p>
//             )}

//             {ticket.helpfulNotes && (
//               <div>
//                 <strong>Helpful Notes:</strong>
//                 <div className="prose max-w-none rounded mt-2">
//                   <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
//                 </div>
//               </div>
//             )}

//             {ticket.assignedTo && (
//               <p>
//                 <strong>Assigned To:</strong> {ticket.assignedTo?.email}
//               </p>
//             )}

//             {ticket.createdAt && (
//               <p className="text-sm text-gray-500 mt-2">
//                 Created At: {new Date(ticket.createdAt).toLocaleString()}
//               </p>
//             )}
//           </>
//         )}
//       </div>

//       <div className="divider">Conversation History</div>
      
//       {/* 1. Display Reply History */}
//       <div className="bg-gray-800 p-4 rounded-lg mb-6">
//         <h2 className="text-xl font-semibold mb-3">Replies ({ticket.replies?.length || 0})</h2>
//         {ticket.replies?.length > 0 ? (
//           <div className="space-y-3 max-h-60 overflow-y-auto">
//             {ticket.replies.map((reply) => (
//               <div 
//                 key={reply._id || reply.sentAt} 
//                 className="border-l-4 border-blue-500 pl-3 p-2 bg-gray-700 rounded"
//               >
//                 <p className="text-sm">
//                   <strong className="text-blue-400">
//                     {/* Access the populated sentBy email */}
//                     {reply.sentBy?.email || 'System'}
//                   </strong>
//                   : {reply.text}
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   {new Date(reply.sentAt).toLocaleString()}
//                 </p>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p className="text-gray-500">No replies yet. Start the conversation!</p>
//         )}
//       </div>

//       {/* 2. Reply Form */}
//       <form onSubmit={handleReplySubmit} className="mt-6 p-4 bg-gray-700 rounded-lg">
//         <h2 className="text-xl font-semibold mb-3">Send a Reply</h2>
//         <textarea
//           className="textarea textarea-bordered w-full h-24 bg-gray-800 text-white"
//           placeholder="Type your response here..."
//           value={replyText}
//           onChange={(e) => setReplyText(e.target.value)}
//           required
//           disabled={submitting}
//         />
//         <button 
//           type="submit" 
//           className="btn btn-primary mt-3"
//           disabled={submitting}
//         >
//           {submitting ? 'Sending...' : 'Send Reply'}
//         </button>
//       </form>

//     </div>
//   );
//   }


import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const token = localStorage.getItem("token");

  // Get the user role for authorization checks (Close Ticket button visibility)
  const userRole = (() => {
    const userJson = localStorage.getItem('user');
    try {
      return userJson ? JSON.parse(userJson).role : null;
    } catch (e) {
      console.error("Failed to parse user role from localStorage:", e);
      return null;
    }
  })();


  const fetchTicket = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/tickets/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setTicket(data.ticket);
      } else {
        alert(data.message || "Failed to fetch ticket");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id, token]);


  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmitting(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/tickets/${id}/reply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ replyText }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setTicket(prev => ({
          ...prev,
          replies: [...(prev.replies || []), data.reply] 
        }));
        setReplyText('');
      } else {
        alert(`Failed to send reply: ${data.message}`);
      }
    } catch (error) {
      console.error('Reply submission failed:', error);
      alert('Network error or internal server error.');
    } finally {
        setSubmitting(false);
    }
  };
  

  // ✅ ADDED: Function to handle closing the ticket
  const handleCloseTicket = async () => {
    if (!window.confirm("Are you sure you want to close this ticket? This action cannot be undone.")) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/tickets/${id}/close`, 
        {
          method: 'PUT', // Using PUT method as defined in the BE route
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("Ticket closed successfully!");
        // Update the ticket status in the local state immediately
        setTicket(prev => ({
            ...prev,
            status: 'CLOSED'
        }));
      } else {
        alert(`Failed to close ticket: ${data.message}`);
      }
    } catch (error) {
      console.error('Close ticket failed:', error);
      alert('Network error or internal server error.');
    } finally {
      setSubmitting(false);
    }
  };
  // -----------------------------------------------------------------


  if (loading)
    return <div className="text-center mt-10">Loading ticket details...</div>;
  if (!ticket) return <div className="text-center mt-10">Ticket not found</div>;

  // ✅ ADDED: Condition for displaying the close button
  const isClosed = ticket.status === 'CLOSED';
  const canClose = (userRole === 'admin' || userRole === 'moderator') && !isClosed;


  return (
    <div className="max-w-3xl mx-auto p-4">
      
      {/* ✅ MODIFIED: Container for Title and Close Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Ticket Details</h2>
        
        {canClose && (
            <button 
                onClick={handleCloseTicket}
                className="btn btn-error btn-sm"
                disabled={submitting}
            >
                {submitting ? 'Closing...' : 'Close Ticket'}
            </button>
        )}
        {isClosed && (
            <span className="badge badge-lg badge-success text-white">CLOSED</span>
        )}
      </div>

      <div className="card bg-gray-800 shadow p-4 space-y-4">
        <h3 className="text-xl font-semibold">{ticket.title}</h3>
        <p>{ticket.description}</p>

        {ticket.status && (
          <>
            <div className="divider">Metadata</div>
            <p>
              <strong>Status:</strong> {ticket.status}
            </p>
            {ticket.priority && (
              <p>
                <strong>Priority:</strong> {ticket.priority}
              </p>
            )}

            {ticket.relatedSkills?.length > 0 && (
              <p>
                <strong>Related Skills:</strong>{" "}
                {ticket.relatedSkills.join(", ")}
              </p>
            )}

            {/* Note: helpfulNotes is hidden from regular users by the backend */}
            {ticket.helpfulNotes && (
              <div>
                <strong>Helpful Notes:</strong>
                <div className="prose max-w-none rounded mt-2">
                  <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
                </div>
              </div>
            )}

            {ticket.assignedTo && (
              <p>
                <strong>Assigned To:</strong> {ticket.assignedTo?.email}
              </p>
            )}

            {ticket.createdAt && (
              <p className="text-sm text-gray-500 mt-2">
                Created At: {new Date(ticket.createdAt).toLocaleString()}
              </p>
            )}
          </>
        )}
      </div>

      <div className="divider">Conversation History</div>
      
      {/* 1. Display Reply History */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">Replies ({ticket.replies?.length || 0})</h2>
        {ticket.replies?.length > 0 ? (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {ticket.replies.map((reply) => (
              <div 
                key={reply._id || reply.sentAt} 
                className="border-l-4 border-blue-500 pl-3 p-2 bg-gray-700 rounded"
              >
                <p className="text-sm">
                  <strong className="text-blue-400">
                    {reply.sentBy?.email || 'System'}
                  </strong>
                  : {reply.text}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(reply.sentAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No replies yet. Start the conversation!</p>
        )}
      </div>

      {/* 2. Reply Form */}
      <form onSubmit={handleReplySubmit} className="mt-6 p-4 bg-gray-700 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Send a Reply</h2>
        <textarea
          className="textarea textarea-bordered w-full h-24 bg-gray-800 text-white"
          placeholder="Type your response here..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          required
          // ✅ MODIFIED: Disable if submitting or closed
          disabled={submitting || isClosed} 
        />
        <button 
          type="submit" 
          className="btn btn-primary mt-3"
          // ✅ MODIFIED: Disable if submitting or closed
          disabled={submitting || isClosed} 
        >
          {submitting ? 'Sending...' : 'Send Reply'}
        </button>
        {/* ✅ ADDED: Display message if closed */}
        {isClosed && (
             <p className="text-red-400 mt-2">This ticket is closed and cannot receive new replies.</p>
        )}
      </form>

    </div>
  );
}