// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function SignupPage() {
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const res = await fetch(
//         `${import.meta.env.VITE_SERVER_URL}/auth/signup`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(form),
//         }
//       );

//       const data = await res.json();

//       if (res.ok) {
//         localStorage.setItem("token", data.token);
//         localStorage.setItem("user", JSON.stringify(data.user));
//         navigate("/");
//       } else {
//         alert(data.message || "Signup failed");
//       }
//     } catch (err) {
//       alert("Something went wrong");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-base-200">
//       <div className="card w-full max-w-sm shadow-xl bg-base-100">
//         <form onSubmit={handleSignup} className="card-body">
//           <h2 className="card-title justify-center">Sign Up</h2>

//           <input
//             type="email"
//             name="email"
//             placeholder="Email"
//             className="input input-bordered"
//             value={form.email}
//             onChange={handleChange}
//             required
//           />

//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             className="input input-bordered"
//             value={form.password}
//             onChange={handleChange}
//             required
//           />

//           <div className="form-control mt-4">
//             <button
//               type="submit"
//               className="btn btn-primary w-full"
//               disabled={loading}
//             >
//               {loading ? "Signing up..." : "Sign Up"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
    // UPDATED: Include 'skills' as an empty string to match the required backend type.
    const [form, setForm] = useState({ email: "", password: "", skills: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        // This handler now updates email, password, or skills based on the input name
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Safety check to ensure the skills field isn't empty if required
        // Note: We are now sending the raw string from the form state.
        
        try {
            const res = await fetch(
                `${import.meta.env.VITE_SERVER_URL}/auth/signup`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    // 'form' now includes email, password, and the skills string
                    body: JSON.stringify(form),
                }
            );

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                navigate("/");
            } else {
                // Better error reporting using 'details' from your backend 500 handler
                alert(data.details || data.message || "Signup failed");
            }
        } catch (err) {
            alert("Something went wrong (Network or JSON parsing error)");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card w-full max-w-sm shadow-xl bg-base-100">
                <form onSubmit={handleSignup} className="card-body">
                    <h2 className="card-title justify-center">Sign Up</h2>

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        className="input input-bordered"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        className="input input-bordered"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                    
                    {/* NEW INPUT FIELD for Skills */}
                    <input
                        type="text"
                        name="skills"
                        placeholder="Skills (e.g., Node.js, Python)"
                        className="input input-bordered"
                        value={form.skills}
                        onChange={handleChange}
                        required
                    />

                    <div className="form-control mt-4">
                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? "Signing up..." : "Sign Up"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
