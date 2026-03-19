import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { tokenStorage } from "../lib/auth";
import { Loader2, Camera, Mail, Save } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function ProfilePage() {
  const { user } = useAuth(); // or refresh user method if provided, for now we will just update localStorage
  const [profile, setProfile] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    phone: "",
    dateOfBirth: "",
    gender: "Other",
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const authToken = tokenStorage.getToken();
        const headers: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};
        
        // Fetch User Info to get avatar Media ID
        const userRes = await fetch(`${API_BASE_URL}/api/users/${user.id}`, { headers });
        if (userRes.ok) {
           const userData = await userRes.json();
           setFormData(f => ({ ...f, fullName: userData.fullName || user.fullName }));
           
           if (userData.avatarMediaId) {
             const mediaRes = await fetch(`${API_BASE_URL}/api/media_assets/${userData.avatarMediaId}`, { headers });
             if (mediaRes.ok) {
               const mediaData = await mediaRes.json();
               setAvatarUrl(mediaData.fileUrl);
             }
           }
        }

        // Fetch User Profile
        const profileRes = await fetch(`${API_BASE_URL}/api/user_profiles/${user.id}`, { headers });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
          setFormData(f => ({
            ...f,
            bio: profileData.bio || "",
            phone: profileData.phone || "",
            dateOfBirth: profileData.dateOfBirth ? profileData.dateOfBirth.split('T')[0] : "",
            gender: profileData.gender || "Other"
          }));
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, [user]);

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const authToken = tokenStorage.getToken();
      const headers = { 
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } as Record<string, string> : {}) 
      };

      // 1. Upload new avatar if changed
      let newAvatarMediaId = null;
      if (imageFile) {
        const coverFormData = new FormData();
        coverFormData.append("file", imageFile);
        const uploadRes = await fetch(`${API_BASE_URL}/api/media_assets/upload`, {
          method: "POST",
          headers: authToken ? { Authorization: `Bearer ${authToken}` } as Record<string, string> : {},
          body: coverFormData
        });
        if (uploadRes.ok) {
          const uploadObj = await uploadRes.json();
          newAvatarMediaId = uploadObj.id;
          setAvatarUrl(uploadObj.fileUrl);
          // 2. Patch User Avatar
          await fetch(`${API_BASE_URL}/api/users/${user.id}/avatar`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ avatarMediaId: newAvatarMediaId })
          });
          setImageFile(null); // clear after successful upload
        } else {
            setError("Lỗi khi tải ảnh lên");
            return;
        }
      }

      // 3. Update User Profile Table
      const profilePayload = {
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth : null,
        gender: formData.gender,
        bio: formData.bio,
        timezone: "Asia/Ho_Chi_Minh",
        preferredSignVariant: "Nam",
        currentStreakDays: profile?.currentStreakDays || 0,
        totalXp: profile?.totalXp || 0
      };
      
      const updateProfileRes = await fetch(`${API_BASE_URL}/api/user_profiles/${user.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(profilePayload)
      });
      
      // If profile doesn't exist, we should POST to create it.
      if (updateProfileRes.status === 404) {
          await fetch(`${API_BASE_URL}/api/user_profiles`, {
            method: "POST",
            headers,
            body: JSON.stringify({ ...profilePayload, userId: user.id })
         });
      }

      // 4. Update core User FullName
      await fetch(`${API_BASE_URL}/api/users/${user.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
              roleId: 2, // Default user role
              email: user.email,
              fullName: formData.fullName,
              avatarMediaId: newAvatarMediaId || profile?.avatarMediaId || null,
              status: 1
          })
      });

      // Update local storage context simply
      const currUser = tokenStorage.getUser();
      if (currUser) {
          currUser.fullName = formData.fullName;
          tokenStorage.setUser(currUser);
      }
      
      setSuccessMsg("Cập nhật hồ sơ thành công!");
    } catch (e: any) {
      setError(e.message || "Có lỗi xảy ra");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <Loader2 className="animate-spin text-[#3c6c44]" size={32} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto py-10 px-4">
      <div className="bg-white rounded-[26px] shadow-[0_6px_28px_rgba(0,0,0,0.06)] border border-[#e6ece8] overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-[#31693e] to-[#428051]" />
        
        <div className="px-8 pb-8">
          {/* Avatar Section */}
          <div className="relative flex justify-between items-end -mt-12 mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-white p-1.5 rounded-full shadow-md">
                <div className="w-full h-full bg-slate-100 rounded-full overflow-hidden flex items-center justify-center">
                  {imageFile ? (
                    <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-cover" alt="Preview Avatar" />
                  ) : avatarUrl ? (
                    <img src={avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
                  ) : (
                    <span className="text-3xl font-bold text-slate-300">
                      {formData.fullName?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                <Camera size={16} className="text-[#3c6c44]" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
                }} />
              </label>
            </div>
          </div>

          <div className="mb-6">
             <h1 className="text-2xl font-bold text-slate-800">Hồ sơ cá nhân</h1>
             <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><Mail size={14}/> {user?.email}</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{error}</div>}
          {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100">{successMsg}</div>}

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Họ và Tên</label>
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => setFormData(f => ({ ...f, fullName: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Giới tính</label>
                <select 
                  value={formData.gender}
                  onChange={(e) => setFormData(f => ({ ...f, gender: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50" 
                >
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ngày sinh</label>
                <input 
                  type="date" 
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(f => ({ ...f, dateOfBirth: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Giới thiệu bản thân (Bio)</label>
              <textarea 
                value={formData.bio}
                onChange={(e) => setFormData(f => ({ ...f, bio: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50" 
                rows={3}
                placeholder="Câu nói yêu thích, mô tả về bạn..."
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button disabled={isSaving} onClick={handleSave} className="bg-[#3b7948] text-white px-6 w-full md:w-auto h-11 justify-center rounded-xl flex items-center gap-2 hover:bg-[#336a40] transition-colors shadow-none hover:translate-y-0">
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Lưu Hồ Sơ
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
