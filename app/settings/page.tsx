"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Lock, Trash2, Loader2, Save } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  getCurrentUser, 
  signOut, 
  updateUserProfile, 
  updatePasswordWithVerification, 
  resetPasswordForEmail 
} from "@/lib/auth";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string; name?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form states
  const [name, setName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/auth/login");
        return;
      }
      setUser(currentUser);
      setName(currentUser.name || "");
      setIsLoading(false);
    };
    fetchUser();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const result = await updateUserProfile(name);
    if (result.success) {
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setUser(prev => prev ? { ...prev, name } : null);
    } else {
      setMessage({ type: "error", text: result.error || "Failed to update profile." });
    }
    setIsSaving(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    
    setIsSaving(true);
    setMessage(null);

    const result = await updatePasswordWithVerification(user.email, oldPassword, newPassword);
    
    if (result.success) {
      setMessage({ type: "success", text: "Password updated successfully!" });
      setOldPassword("");
      setNewPassword("");
    } else {
      setMessage({ type: "error", text: result.error || "Failed to update password." });
    }
    setIsSaving(false);
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    
    setIsResetting(true);
    setMessage(null);
    
    const result = await resetPasswordForEmail(user.email);
    
    if (result.success) {
      setMessage({ type: "success", text: "Password reset email sent! Please check your inbox." });
    } else {
      setMessage({ type: "error", text: result.error || "Failed to send reset email." });
    }
    setIsResetting(false);
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you absolutely sure? This will permanently delete your account, your profile, and all of your analysis history. This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setIsSaving(true);
      setMessage(null);
      
      const response = await fetch("/api/auth/delete-account", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete account");
      }

      await signOut();
      router.push("/");
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex flex-1 flex-col px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
            <p className="mt-2 text-muted-foreground">Manage your profile, security, and preferences</p>
          </motion.div>

          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-xl text-sm font-medium border ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
            >
              {message.text}
            </motion.div>
          )}

          <div className="space-y-6">
            {/* Profile Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center gap-3">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email Address (Read-only)</label>
                    <Input disabled value={user?.email || ""} className="bg-muted/50 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Display Name</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required />
                  </div>
                  <Button type="submit" disabled={isSaving} className="mt-2">
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </Button>
                </form>
              </div>
            </motion.div>

            {/* Security Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center gap-3">
                <Lock className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Security</h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Current Password</label>
                    <Input 
                      type="password" 
                      value={oldPassword} 
                      onChange={(e) => setOldPassword(e.target.value)} 
                      placeholder="Enter current password" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">New Password</label>
                    <Input 
                      type="password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      placeholder="Enter new password" 
                      required 
                      minLength={6} 
                    />
                  </div>
                  
                  <div className="flex items-center gap-4 pt-2">
                    <Button type="submit" disabled={isSaving || !oldPassword || newPassword.length < 6} variant="secondary">
                      {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Update Password
                    </Button>
                    
                    <button 
                      type="button" 
                      onClick={handleResetPassword} 
                      disabled={isResetting} 
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {isResetting ? "Sending email..." : "Forgot password?"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>

            {/* Danger Zone */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border border-red-500/20 bg-card overflow-hidden">
              <div className="border-b border-red-500/20 bg-red-500/5 px-6 py-4 flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-semibold text-red-500">Danger Zone</h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button onClick={handleDeleteAccount} disabled={isSaving} variant="destructive" className="bg-red-500 hover:bg-red-600">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  Delete Account
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}