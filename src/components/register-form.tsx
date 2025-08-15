import {useState} from 'react';
import {Eye, EyeOff, Mail, Phone, User, Lock} from "lucide-react";

export function RegisterForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const validate = () => {
        if (!name.trim()) return "Please enter your name.";
        if (!(email.includes("@") && email.includes("."))) return "Please enter a valid email.";
        const digitCount = phone.split("").filter((c) => c >= "0" && c <= "9").length;
        if (digitCount < 7 || digitCount > 15) return "Please enter a valid phone number (7–15 digits).";
        if (password.length < 8) return "Password must be at least 8 characters.";
        return null;
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const v = validate();
        if (v) {
            setError(v);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("http://localhost:8080/auth/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({name, email, phone, password}),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.message || "Registration failed");
            }

            setSuccess("Registration successful — redirecting to login...");
            setTimeout(() => (window.location.href = "/login"), 900);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="max-w-md w-full mx-auto bg-white rounded-2xl p-8 shadow-lg">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Create your account</h1>
            <p className="text-sm text-slate-600 mb-6">Start your journey with us — fast and secure.</p>

            {error && (
                <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded">{error}</div>
            )}
            {success && (
                <div
                    className="mb-4 text-sm text-green-800 bg-green-50 border border-green-100 p-3 rounded">{success}</div>
            )}

            <form className="space-y-4" onSubmit={onSubmit} noValidate>
                <label className="block">
                    <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><User
                        className="w-4 h-4"/> Full name</span>
                    <input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        placeholder="Jane Doe"
                    />
                </label>

                <label className="block">
                    <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><Mail
                        className="w-4 h-4"/> Email</span>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        placeholder="you@company.com"
                    />
                </label>

                <label className="block">
                    <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><Phone
                        className="w-4 h-4"/> Phone</span>
                    <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        placeholder="+628123456789"
                    />
                </label>

                <label className="block relative">
                    <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><Lock
                        className="w-4 h-4"/> Password</span>
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 pr-10 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        placeholder="At least 8 characters"
                    />

                    <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-9 -mt-0.5 p-1"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                    </button>
                </label>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-white font-semibold disabled:opacity-60"
                >
                    {loading ? "Creating account..." : "Create account"}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">Already have an account? <a href="/login"
                                                                                  className="text-indigo-600 font-medium">Sign
                    in</a></p>
            </div>

            <div className="mt-6">
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-200"/>
                    <span className="text-xs text-slate-400">or continue with</span>
                    <div className="flex-1 h-px bg-slate-200"/>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm flex items-center justify-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M44.5 20H24v8.5h11.9C34.2 32.3 29 36 24 36c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.4 0 6.4 1.3 8.7 3.4l6.2-6.2C36.4 4.7 30.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22 22-9.8 22-22c0-1.5-.2-3-.5-4.4z"
                                fill="#4285F4"/>
                        </svg>
                        Google
                    </button>

                    <button
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm flex items-center justify-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.866-.014-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.607.069-.607 1.003.071 1.53 1.031 1.53 1.031.892 1.528 2.341 1.087 2.91.832.091-.647.35-1.087.636-1.337-2.22-.252-4.555-1.111-4.555-4.945 0-1.091.39-1.984 1.03-2.683-.103-.253-.447-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.338 1.91-1.294 2.748-1.025 2.748-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.338 4.688-4.566 4.936.36.31.68.922.68 1.86 0 1.342-.012 2.423-.012 2.755 0 .268.18.58.688.482C19.137 20.164 22 16.416 22 12c0-5.523-4.477-10-10-10z"
                                fill="#111"/>
                        </svg>
                        GitHub
                    </button>
                </div>
            </div>
        </div>
    );
}

