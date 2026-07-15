import React, { useState, useRef } from "react";
import { Plus, Trash2, Edit2, Check, ArrowLeft, Upload, FileText, LayoutGrid, CheckSquare, Settings, AlertCircle, Save, Play, Instagram, Facebook, Link, Video, Image, ArrowUpRight } from "lucide-react";
import { Project } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface AdminCMSProps {
  projects: Project[];
  onBack: () => void;
  onRefreshProjects: () => Promise<void>;
  onHoverStart?: (label: string) => void;
  onHoverEnd?: () => void;
}

const CATEGORIES = [
  "Residential",
  "Commercial",
  "Hospitality",
  "Landscape",
  "Interior",
  "Master Planning",
  "Competition",
  "Research",
  "Furniture",
  "Concepts"
];

const STATUSES = ["Completed", "Construction", "Concept"];

const DEFAULT_PROJECT_FORM: Partial<Project> = {
  title: "",
  location: "",
  year: new Date().getFullYear().toString(),
  category: "Residential",
  status: "Concept",
  area: "250 m²",
  materialPalette: ["Raw Concrete", "Glass"],
  architecturalStyle: "Minimalism",
  client: "",
  team: [],
  awards: [],
  description: "",
  conceptText: "",
  heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  videoUrl: "",
  images: [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
  ],
  constructionPhotos: [],
  drawings: [
    `<svg viewBox="0 0 400 200" fill="none" stroke="currentColor" stroke-width="1" class="w-full h-full text-zinc-400"><rect x="50" y="50" width="300" height="100" /></svg>`
  ],
  featured: false,
  homepageOrder: 10,
  tags: ["Concrete", "Minimalist"],
  comparisonBeforeImage: "",
  comparisonAfterImage: "",
  comparisonLabelBefore: "Original Terrain",
  comparisonLabelAfter: "Completed Space"
};

export default function AdminCMS({
  projects,
  onBack,
  onRefreshProjects,
  onHoverStart,
  onHoverEnd,
}: AdminCMSProps) {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formState, setFormState] = useState<Partial<Project>>(DEFAULT_PROJECT_FORM);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Upload State helper
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetField, setUploadTargetField] = useState<string | null>(null);
  const [activeSlideUploadIndex, setActiveSlideUploadIndex] = useState<number | null>(null);

  // Exhibition Media states
  const [exhibitionUploading, setExhibitionUploading] = useState(false);
  const [exhibitionUploadStatus, setExhibitionUploadStatus] = useState("");
  const [exhibitionUploadType, setExhibitionUploadType] = useState<'upload' | 'link'>('upload');
  const [exhibitionExtUrl, setExhibitionExtUrl] = useState("");
  const [exhibitionExtTitle, setExhibitionExtTitle] = useState("");
  const [exhibitionExtCoverFile, setExhibitionExtCoverFile] = useState<File | null>(null);
  const [exhibitionIsFormOpen, setExhibitionIsFormOpen] = useState(false);

  // Soundtrack CMS State
  const [activeTab, setActiveTab] = useState<'projects' | 'sounds' | 'settings'>('projects');
  const [sounds, setSounds] = useState<any[]>([]);
  const [soundsLoading, setSoundsLoading] = useState(false);
  const [newSoundName, setNewSoundName] = useState("");
  const [newSoundUrl, setNewSoundUrl] = useState("");
  const [soundError, setSoundError] = useState<string | null>(null);
  const [soundSuccess, setSoundSuccess] = useState<string | null>(null);

  // Passcode Settings State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [serverPasscode, setServerPasscode] = useState("");

  const fetchSounds = async () => {
    try {
      setSoundsLoading(true);
      const response = await fetch("/api/sounds");
      if (response.ok) {
        const data = await response.json();
        setSounds(data);
      }
    } catch (error) {
      console.error("Failed to load sounds", error);
    } finally {
      setSoundsLoading(false);
    }
  };

  const fetchServerPasscode = async () => {
    try {
      const response = await fetch("/api/admin/passcode");
      if (response.ok) {
        const data = await response.json();
        setServerPasscode(data.passcode);
      }
    } catch (error) {
      console.error("Failed to load server passcode", error);
    }
  };

  React.useEffect(() => {
    fetchSounds();
    fetchServerPasscode();
  }, []);

  const handleAddSound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSoundName.trim() || !newSoundUrl.trim()) return;

    try {
      const response = await fetch("/api/sounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSoundName.trim(), url: newSoundUrl.trim() }),
      });
      if (response.ok) {
        setNewSoundName("");
        setNewSoundUrl("");
        setSoundSuccess("Soundtrack added successfully");
        setSoundError(null);
        await fetchSounds();
        window.dispatchEvent(new Event("shailora-sound-changed"));
        setTimeout(() => setSoundSuccess(null), 3000);
      } else {
        setSoundError("Failed to add soundtrack link");
      }
    } catch (err: any) {
      setSoundError(err.message || "An error occurred");
    }
  };

  const handleSetActiveSound = async (id: string) => {
    try {
      const response = await fetch(`/api/sounds/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: true }),
      });
      if (response.ok) {
        await fetchSounds();
        window.dispatchEvent(new Event("shailora-sound-changed"));
      }
    } catch (err) {
      console.error("Failed to set active soundtrack", err);
    }
  };

  const handleDeleteSound = async (id: string) => {
    if (id === "procedural") return;
    if (!window.confirm("Are you sure you want to delete this sound track?")) return;

    try {
      const response = await fetch(`/api/sounds/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchSounds();
        window.dispatchEvent(new Event("shailora-sound-changed"));
      }
    } catch (err) {
      console.error("Failed to delete sound track", err);
    }
  };

  const handleChangePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!newPassword) {
      setPasswordError("New passcode cannot be empty");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Confirm passcode does not match new passcode");
      return;
    }

    try {
      setPasswordSaving(true);
      const response = await fetch("/api/admin/change-passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setPasswordSuccess("Curatorial passcode updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        await fetchServerPasscode();
      } else {
        setPasswordError(data.error || "Failed to update passcode");
      }
    } catch (err: any) {
      setPasswordError(err.message || "An unexpected error occurred");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleEditClick = (project: Project) => {
    const projectWithMedia = { ...project };
    if (!projectWithMedia.exhibitionMedia || projectWithMedia.exhibitionMedia.length === 0) {
      const list: any[] = [];
      if (project.videoUrl) {
        list.push({
          id: "video-main",
          type: "video",
          url: project.videoUrl,
          title: "Cinematic Video Tour",
          platform: "local"
        });
      }
      if (project.images) {
        project.images.forEach((img, i) => {
          list.push({
            id: `image-${i}`,
            type: "image",
            url: img,
            title: `${project.title} Gallery #${i + 1}`,
            platform: "local"
          });
        });
      }
      projectWithMedia.exhibitionMedia = list;
    }

    setEditingProject(projectWithMedia);
    setFormState(projectWithMedia);
    setIsNew(false);
    setSaveSuccess(false);
    setErrorMessage(null);
  };

  const handleAddNewClick = () => {
    setEditingProject(null);
    setFormState({
      ...DEFAULT_PROJECT_FORM,
      exhibitionMedia: [],
      homepageOrder: projects.length + 1,
    });
    setIsNew(true);
    setSaveSuccess(false);
    setErrorMessage(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormState((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormState((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleListChange = (name: "materialPalette" | "team" | "awards" | "tags", valueStr: string) => {
    const arr = valueStr.split(",").map((s) => s.trim()).filter(Boolean);
    setFormState((prev) => ({ ...prev, [name]: arr }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetField) return;

    setUploadProgress("Converting file...");
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result as string;
        setUploadProgress("Uploading to container filesystem...");

        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileData: base64Data,
            fileName: file.name,
            mimeType: file.type,
          }),
        });

        if (!response.ok) {
          throw new Error("File upload failed on server");
        }

        const data = await response.json();
        
        // Bind URL to form target field
        if (uploadTargetField === "heroImage") {
          setFormState((prev) => ({ ...prev, heroImage: data.url }));
        } else if (uploadTargetField === "comparisonBeforeImage") {
          setFormState((prev) => ({ ...prev, comparisonBeforeImage: data.url }));
        } else if (uploadTargetField === "comparisonAfterImage") {
          setFormState((prev) => ({ ...prev, comparisonAfterImage: data.url }));
        } else if (uploadTargetField === "images") {
          setFormState((prev) => ({
            ...prev,
            images: prev.images ? [...prev.images, data.url] : [data.url],
          }));
        } else if (uploadTargetField === "constructionPhotos") {
          setFormState((prev) => ({
            ...prev,
            constructionPhotos: prev.constructionPhotos ? [...prev.constructionPhotos, data.url] : [data.url],
          }));
        } else if (uploadTargetField === "drawings") {
          setFormState((prev) => ({
            ...prev,
            drawings: prev.drawings ? [...prev.drawings, data.url] : [data.url],
          }));
        } else if (uploadTargetField === "slide-media" && activeSlideUploadIndex !== null) {
          setFormState((prev) => {
            const media = prev.exhibitionMedia ? [...prev.exhibitionMedia] : [];
            if (media[activeSlideUploadIndex]) {
              media[activeSlideUploadIndex] = {
                ...media[activeSlideUploadIndex],
                url: data.url,
                type: file.type.startsWith("video") ? "video" : "image"
              };
            }
            return {
              ...prev,
              exhibitionMedia: media,
              images: media.filter(m => m.type === 'image' || m.type === 'embed').map(m => m.coverImage || m.url),
              videoUrl: media.find(m => m.type === 'video' || m.platform === 'youtube' || m.platform === 'vimeo')?.url || prev.videoUrl
            };
          });
          setActiveSlideUploadIndex(null);
        }

        setUploadProgress(null);
        setUploadTargetField(null);
      };
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Failed to upload image asset: " + err.message);
      setUploadProgress(null);
    }
  };

  const handleAddBlankSlide = () => {
    setFormState((prev) => {
      const media = prev.exhibitionMedia ? [...prev.exhibitionMedia] : [];
      media.push({
        id: `slide-${Date.now()}`,
        type: "image",
        url: "",
        title: "New Concept Slide",
        description: "Curated narrative description details...",
        platform: "local"
      });
      return {
        ...prev,
        exhibitionMedia: media,
        images: media.filter(m => m.type === 'image' || m.type === 'embed').map(m => m.coverImage || m.url),
        videoUrl: media.find(m => m.type === 'video' || m.platform === 'youtube' || m.platform === 'vimeo')?.url || prev.videoUrl
      };
    });
  };

  const handleRemoveSlide = (id: string | number) => {
    setFormState((prev) => {
      const media = prev.exhibitionMedia ? [...prev.exhibitionMedia] : [];
      const updated = media.filter((m) => m.id !== id);
      return {
        ...prev,
        exhibitionMedia: updated,
        images: updated.filter(m => m.type === 'image' || m.type === 'embed').map(m => m.coverImage || m.url),
        videoUrl: updated.find(m => m.type === 'video' || m.platform === 'youtube' || m.platform === 'vimeo')?.url || prev.videoUrl
      };
    });
  };

  const handleMoveSlide = (idx: number, direction: "up" | "down") => {
    setFormState((prev) => {
      const media = prev.exhibitionMedia ? [...prev.exhibitionMedia] : [];
      if (direction === "up" && idx > 0) {
        const temp = media[idx];
        media[idx] = media[idx - 1];
        media[idx - 1] = temp;
      } else if (direction === "down" && idx < media.length - 1) {
        const temp = media[idx];
        media[idx] = media[idx + 1];
        media[idx + 1] = temp;
      }
      return { ...prev, exhibitionMedia: media };
    });
  };

  const handleSlideFieldChange = (idx: number, field: string, value: any) => {
    setFormState((prev) => {
      const media = prev.exhibitionMedia ? [...prev.exhibitionMedia] : [];
      if (media[idx]) {
        media[idx] = { ...media[idx], [field]: value };
      }
      return {
        ...prev,
        exhibitionMedia: media,
        images: media.filter(m => m.type === 'image' || m.type === 'embed').map(m => m.coverImage || m.url),
        videoUrl: media.find(m => m.type === 'video' || m.platform === 'youtube' || m.platform === 'vimeo')?.url || prev.videoUrl
      };
    });
  };

  const handleTriggerSlideUpload = (idx: number) => {
    setActiveSlideUploadIndex(idx);
    setUploadTargetField("slide-media");
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const triggerUpload = (fieldName: string) => {
    setUploadTargetField(fieldName);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleExhibitionLocalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setExhibitionUploading(true);
    setExhibitionUploadStatus(`Uploading ${files.length} file(s)...`);

    try {
      const currentMedia = formState.exhibitionMedia ? [...formState.exhibitionMedia] : [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        const fileData = await base64Promise;
        setExhibitionUploadStatus(`Uploading ${file.name} (${i + 1}/${files.length})...`);
        
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            fileData,
            fileName: file.name,
            mimeType: file.type
          })
        });

        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name}`);
        }

        const data = await response.json();
        
        currentMedia.push({
          id: `media-${Date.now()}-${i}`,
          type: file.type.startsWith("video") ? "video" : "image",
          url: data.url,
          title: file.name.split(".")[0].replace(/[-_]/g, " "),
          platform: "local"
        });
      }

      setFormState(prev => {
        const updatedMedia = currentMedia;
        return {
          ...prev,
          exhibitionMedia: updatedMedia,
          images: updatedMedia.filter(m => m.type === 'image' || m.type === 'embed').map(m => m.coverImage || m.url),
          videoUrl: updatedMedia.find(m => m.type === 'video' || m.platform === 'youtube' || m.platform === 'vimeo')?.url || prev.videoUrl
        };
      });
      setExhibitionUploadStatus("");
    } catch (err: any) {
      console.error(err);
      alert("Error uploading exhibition media: " + err.message);
    } finally {
      setExhibitionUploading(false);
    }
  };

  const handleExhibitionAddExternalLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exhibitionExtUrl) return;

    setExhibitionUploading(true);
    try {
      let platform: 'youtube' | 'vimeo' | 'instagram' | 'facebook' | 'tiktok' | 'pinterest' | 'local' = 'local';
      let type: 'image' | 'video' | 'embed' = 'embed';
      
      const urlLower = exhibitionExtUrl.toLowerCase();
      if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) {
        platform = "youtube";
        type = "embed";
      } else if (urlLower.includes("vimeo.com")) {
        platform = "vimeo";
        type = "embed";
      } else if (urlLower.includes("instagram.com")) {
        platform = "instagram";
        type = "embed";
      } else if (urlLower.includes("facebook.com")) {
        platform = "facebook";
        type = "embed";
      } else if (urlLower.includes("tiktok.com")) {
        platform = "tiktok";
        type = "embed";
      } else if (urlLower.includes("pinterest.com")) {
        platform = "pinterest";
        type = "embed";
      }

      let coverUrl = "";

      if (exhibitionExtCoverFile) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(exhibitionExtCoverFile);
        });
        const fileData = await base64Promise;

        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            fileData,
            fileName: exhibitionExtCoverFile.name,
            mimeType: exhibitionExtCoverFile.type
          })
        });

        if (response.ok) {
          const data = await response.json();
          coverUrl = data.url;
        }
      }

      const currentMedia = formState.exhibitionMedia ? [...formState.exhibitionMedia] : [];
      currentMedia.push({
        id: `media-ext-${Date.now()}`,
        type,
        url: exhibitionExtUrl,
        title: exhibitionExtTitle || `${platform.toUpperCase()} Asset`,
        platform,
        originalUrl: exhibitionExtUrl,
        coverImage: coverUrl
      });

      setFormState(prev => {
        const updatedMedia = currentMedia;
        return {
          ...prev,
          exhibitionMedia: updatedMedia,
          images: updatedMedia.filter(m => m.type === 'image' || m.type === 'embed').map(m => m.coverImage || m.url),
          videoUrl: updatedMedia.find(m => m.type === 'video' || m.platform === 'youtube' || m.platform === 'vimeo')?.url || prev.videoUrl
        };
      });
      
      setExhibitionExtUrl("");
      setExhibitionExtTitle("");
      setExhibitionExtCoverFile(null);
      setExhibitionIsFormOpen(false);
    } catch (err: any) {
      console.error(err);
      alert("Error adding link: " + err.message);
    } finally {
      setExhibitionUploading(false);
    }
  };

  const handleExhibitionDeleteMedia = (mediaId: string) => {
    const currentMedia = formState.exhibitionMedia ? [...formState.exhibitionMedia] : [];
    const updatedMedia = currentMedia.filter(m => m.id !== mediaId);
    setFormState(prev => ({
      ...prev,
      exhibitionMedia: updatedMedia,
      images: updatedMedia.filter(m => m.type === 'image' || m.type === 'embed').map(m => m.coverImage || m.url),
      videoUrl: updatedMedia.find(m => m.type === 'video' || m.platform === 'youtube' || m.platform === 'vimeo')?.url || prev.videoUrl
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const method = isNew ? "POST" : "PUT";
      const url = isNew ? "/api/projects" : `/api/projects/${editingProject?.id}`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes onto the architectural database");
      }

      setSaveSuccess(true);
      await onRefreshProjects();
      
      if (isNew) {
        const savedProject = await response.json();
        setEditingProject(savedProject);
        setIsNew(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you absolutely sure you want to permanently erase this exhibition? This is irreversible.")) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Deletion failed on server database");
      }

      await onRefreshProjects();
      if (editingProject?.id === id) {
        setEditingProject(null);
        setFormState(DEFAULT_PROJECT_FORM);
        setIsNew(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete project");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* CMS Header Station */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur px-8 py-5 flex justify-between items-center z-10">
        <div className="flex items-center gap-6">
          <button
            onClick={onBack}
            onMouseEnter={() => onHoverStart && onHoverStart("BACK")}
            onMouseLeave={onHoverEnd}
            className="p-2 rounded-full border border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
          </button>
          <div>
            <span className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 uppercase leading-none block">System Console</span>
            <h1 className="text-sm font-mono tracking-widest uppercase font-semibold text-zinc-200 mt-1">SHAILORA / CMS</h1>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border border-zinc-800 rounded p-0.5 h-9 ml-4">
            <button
              onClick={() => setActiveTab("projects")}
              className={`px-4 text-[10px] font-mono uppercase tracking-wider rounded transition-all ${
                activeTab === "projects"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Exhibitions
            </button>
            <button
              onClick={() => setActiveTab("sounds")}
              className={`px-4 text-[10px] font-mono uppercase tracking-wider rounded transition-all ${
                activeTab === "sounds"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Ambient Audio
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 text-[10px] font-mono uppercase tracking-wider rounded transition-all ${
                activeTab === "settings"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Security
            </button>
          </div>
        </div>

        {activeTab === "projects" ? (
          <button
            onClick={handleAddNewClick}
            onMouseEnter={() => onHoverStart && onHoverStart("NEW EXHIBIT")}
            onMouseLeave={onHoverEnd}
            className="flex items-center gap-2 px-4 py-2 border border-zinc-700 hover:border-zinc-300 bg-zinc-900 hover:bg-zinc-100 hover:text-zinc-950 text-xs font-mono uppercase tracking-widest transition-all rounded"
          >
            <Plus size={14} /> Add Curated Exhibit
          </button>
        ) : activeTab === "sounds" ? (
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            Atmospheric Sounds Configuration
          </div>
        ) : (
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            Security & Passcode Settings
          </div>
        )}
      </header>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main CMS Split Screen */}
      {activeTab === "sounds" ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-full">
          {/* Left Side: Sound Form */}
          <div className="lg:col-span-5 border-r border-zinc-900 p-8 overflow-y-auto max-h-[calc(100vh-80px)] space-y-6">
            <div className="space-y-1">
              <span className="text-[9px] font-mono uppercase text-zinc-500 tracking-wider">Configure Atmosphere</span>
              <h3 className="text-sm font-mono uppercase tracking-[0.15em] text-zinc-200">Add Atmosphere Link</h3>
              <p className="text-[10px] font-mono text-zinc-500 uppercase leading-relaxed">
                Add standard audio track URLs (.mp3, .wav, .ogg) to populate the ambient museum selector.
              </p>
            </div>

            <form onSubmit={handleAddSound} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-mono uppercase text-zinc-400 block">Soundtrack Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Whispering Pine Valleys, Rain on Skylights"
                  value={newSoundName}
                  onChange={(e) => setNewSoundName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded text-xs font-mono text-zinc-200 focus:border-zinc-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-mono uppercase text-zinc-400 block">Audio File URL (Direct Link)</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/sound.mp3"
                  value={newSoundUrl}
                  onChange={(e) => setNewSoundUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded text-xs font-mono text-zinc-200 focus:border-zinc-500 focus:outline-none"
                />
                <span className="text-[8px] font-mono text-zinc-600 uppercase block mt-1">
                  Ensure the URL is a direct audio link that allows cross-origin requests.
                </span>
              </div>

              {soundError && (
                <div className="p-3 bg-red-950/40 border border-red-800 rounded text-red-400 text-[10px] font-mono uppercase">
                  {soundError}
                </div>
              )}

              {soundSuccess && (
                <div className="p-3 bg-green-950/40 border border-green-800 rounded text-green-400 text-[10px] font-mono uppercase">
                  {soundSuccess}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold text-xs font-mono uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={14} /> Add Atmospheric Link
              </button>
            </form>
          </div>

          {/* Right Side: Sound List */}
          <div className="lg:col-span-7 p-8 overflow-y-auto max-h-[calc(100vh-80px)] space-y-6 bg-zinc-900/10">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">ATMOSPHERIC SOUNDTRACKS</h3>
              <span className="text-[8px] font-mono text-zinc-500 uppercase">Click to Activate</span>
            </div>

            {soundsLoading ? (
              <div className="py-12 text-center text-xs font-mono text-zinc-500 uppercase">
                Loading soundtrack links...
              </div>
            ) : (
              <div className="space-y-4">
                {sounds.map((sound) => (
                  <div
                    key={sound.id}
                    onClick={() => handleSetActiveSound(sound.id)}
                    className={`p-4 border rounded transition-all duration-300 flex items-center justify-between group cursor-pointer ${
                      sound.active
                        ? "bg-zinc-900 border-zinc-400 text-white"
                        : "bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/20"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                        sound.active
                          ? "border-zinc-400 text-white"
                          : "border-zinc-800 text-zinc-600"
                      }`}>
                        {sound.active ? (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                          </span>
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-mono font-medium uppercase text-zinc-200">{sound.name}</h4>
                        <span className="text-[9px] font-mono text-zinc-500 truncate max-w-xs md:max-w-md block mt-1">
                          {sound.url === "procedural" ? "Atelier Procedural Synthesized Drone" : sound.url}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {sound.active && (
                        <span className="px-2 py-0.5 border border-white/20 rounded bg-white/10 text-[8px] font-mono uppercase tracking-widest text-white">
                          Active
                        </span>
                      )}

                      {sound.id !== "procedural" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSound(sound.id);
                          }}
                          className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : activeTab === "settings" ? (
        <div className="flex-1 flex justify-center items-center bg-zinc-900/10 p-8 overflow-y-auto">
          <div className="max-w-md w-full bg-zinc-950 border border-zinc-900 p-8 rounded-xl space-y-6">
            <div className="space-y-1 text-center">
              <span className="text-[9px] font-mono uppercase text-zinc-500 tracking-wider">Security Cabinet</span>
              <h3 className="text-sm font-mono uppercase tracking-[0.15em] text-zinc-200">Update Access Passcode</h3>
              <p className="text-[10px] font-mono text-zinc-500 uppercase leading-relaxed">
                Update the master passcode used to authenticate the curatorial system console.
              </p>
            </div>

            {/* Display Current Active Passcode & Fallbacks */}
            <div className="border border-zinc-900 bg-zinc-900/20 p-4 rounded text-[10px] font-mono space-y-2 uppercase text-zinc-400">
              <div className="flex justify-between border-b border-zinc-900/60 pb-1.5">
                <span>Active Master Key:</span>
                <span className="text-zinc-200 font-bold">{serverPasscode || "[Empty]"}</span>
              </div>
              <div className="text-[9px] text-zinc-500 normal-case leading-normal space-y-1">
                <p className="text-zinc-400 uppercase font-bold text-[8px]">Active Fallback bypasses:</p>
                <p>The system remains fully accessible via backup master credentials:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-[8px] uppercase">
                  <li><code className="bg-zinc-900 text-zinc-300 px-1 py-0.5 rounded">shailora</code></li>
                  <li><code className="bg-zinc-900 text-zinc-300 px-1 py-0.5 rounded">admin</code></li>
                  <li><code className="bg-zinc-900 text-zinc-300 px-1 py-0.5 rounded">[Empty passcode]</code></li>
                </ul>
              </div>
            </div>

            <form onSubmit={handleChangePasscode} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] font-mono uppercase text-zinc-400 block">Current Passcode</label>
                <input
                  type="password"
                  required
                  placeholder="Enter current passcode"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 px-4 py-2.5 rounded text-xs font-mono text-zinc-200 focus:border-zinc-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-mono uppercase text-zinc-400 block">New Passcode</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new passcode"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 px-4 py-2.5 rounded text-xs font-mono text-zinc-200 focus:border-zinc-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-mono uppercase text-zinc-400 block">Confirm New Passcode</label>
                <input
                  type="password"
                  required
                  placeholder="Retype new passcode"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 px-4 py-2.5 rounded text-xs font-mono text-zinc-200 focus:border-zinc-500 focus:outline-none"
                />
              </div>

              {passwordError && (
                <div className="p-3 bg-red-950/40 border border-red-800 rounded text-red-400 text-[10px] font-mono uppercase">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-green-950/40 border border-green-800 rounded text-green-400 text-[10px] font-mono uppercase">
                  {passwordSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={passwordSaving}
                className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold text-xs font-mono uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2"
              >
                <Save size={14} /> {passwordSaving ? "Updating Ledger..." : "Write New Passcode"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-full">
        
        {/* Left Side: Exhibit Master List */}
        <div className="lg:col-span-4 border-r border-zinc-900 p-6 overflow-y-auto space-y-4 max-h-[calc(100vh-80px)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">EXHIBITION ROOMS ({projects.length})</h3>
            <span className="text-[9px] font-mono text-zinc-600 uppercase">Sort Order: Homepage</span>
          </div>

          <div className="space-y-3">
            {projects.map((p) => {
              const isSelected = editingProject?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleEditClick(p)}
                  onMouseEnter={() => onHoverStart && onHoverStart("SELECT")}
                  onMouseLeave={onHoverEnd}
                  className={`p-4 border transition-all duration-300 rounded cursor-pointer relative group flex gap-4 ${
                    isSelected
                      ? "bg-zinc-900 border-zinc-400"
                      : "bg-zinc-950/40 border-zinc-900 hover:border-zinc-700 hover:bg-zinc-900/30"
                  }`}
                >
                  {/* Small preview */}
                  <img
                    src={p.heroImage}
                    alt={p.title}
                    className="w-12 h-12 object-cover bg-zinc-900 border border-zinc-800"
                    referrerPolicy="no-referrer"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block">
                      [{p.homepageOrder}] // {p.category}
                    </span>
                    <h4 className="text-xs font-mono text-zinc-200 truncate uppercase mt-0.5">{p.title}</h4>
                    <span className="text-[9px] font-mono text-zinc-500 block mt-1">{p.location}</span>
                  </div>

                  {/* Actions on hover */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(p.id);
                      }}
                      className="p-1.5 hover:bg-red-950/50 hover:text-red-400 text-zinc-600 rounded transition-all"
                      title="Delete Exhibit"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Detailed Curatorial Form */}
        <div className="lg:col-span-8 p-8 overflow-y-auto max-h-[calc(100vh-80px)] bg-zinc-900/10">
          <AnimatePresence mode="wait">
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-950/50 border border-red-800 text-red-400 text-xs font-mono rounded flex items-center gap-3 uppercase">
                <AlertCircle size={16} /> {errorMessage}
              </div>
            )}

            {saveSuccess && (
              <div className="mb-6 p-4 bg-emerald-950/50 border border-emerald-800 text-emerald-400 text-xs font-mono rounded flex items-center gap-3 uppercase">
                <Check size={16} /> Spatial modifications written onto database ledger!
              </div>
            )}

            {uploadProgress && (
              <div className="mb-6 p-4 bg-blue-950/50 border border-blue-800 text-blue-400 text-xs font-mono rounded flex items-center gap-3 animate-pulse">
                <Upload size={16} /> {uploadProgress}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                <div>
                  <h2 className="text-base font-mono uppercase tracking-widest text-zinc-200">
                    {isNew ? "CURATING NEW ARCHITECTURAL EXHIBIT" : `EDITING "${formState.title?.toUpperCase()}"`}
                  </h2>
                  <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase">Write technical coordinates and design manifestos</p>
                </div>
                
                <button
                  type="submit"
                  disabled={isSaving}
                  onMouseEnter={() => onHoverStart && onHoverStart("SAVE LEDGER")}
                  onMouseLeave={onHoverEnd}
                  className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-mono font-bold uppercase tracking-widest transition-colors rounded"
                >
                  <Save size={14} /> {isSaving ? "Writing..." : "Save Exhibit"}
                </button>
              </div>

              {/* SECTION 1: Core Identity */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">I. Architectural Core Identity</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-400 block mb-2">Project Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formState.title || ""}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. The Obsidian Pavilion"
                      className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded text-xs font-mono focus:border-zinc-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-400 block mb-2">Location Coordinates</label>
                    <input
                      type="text"
                      name="location"
                      value={formState.location || ""}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Vals, Switzerland"
                      className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded text-xs font-mono focus:border-zinc-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-400 block mb-2">Exhibition Category</label>
                    <select
                      name="category"
                      value={formState.category || "Residential"}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded text-xs font-mono focus:border-zinc-500 focus:outline-none text-zinc-300"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-400 block mb-2">Construction Status</label>
                    <select
                      name="status"
                      value={formState.status || "Concept"}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded text-xs font-mono focus:border-zinc-500 focus:outline-none text-zinc-300"
                    >
                      {STATUSES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Dimensions & Details */}
              <div className="space-y-4 pt-4 border-t border-zinc-800/60">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">II. Volumetric Dimensions & Tectonics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-400 block mb-2">Year of Realization</label>
                    <input
                      type="text"
                      name="year"
                      value={formState.year || ""}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded text-xs font-mono focus:border-zinc-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-400 block mb-2">Building Area (Scale)</label>
                    <input
                      type="text"
                      name="area"
                      value={formState.area || ""}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. 1,200 m²"
                      className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded text-xs font-mono focus:border-zinc-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-400 block mb-2">Architectural Style</label>
                    <input
                      type="text"
                      name="architecturalStyle"
                      value={formState.architecturalStyle || ""}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Nordic Brutalism"
                      className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded text-xs font-mono focus:border-zinc-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-400 block mb-2">Material Palette (Comma-separated)</label>
                    <input
                      type="text"
                      name="materialPalette"
                      value={formState.materialPalette?.join(", ") || ""}
                      onChange={(e) => handleListChange("materialPalette", e.target.value)}
                      placeholder="e.g. Raw Concrete, Siberian Larch, Satin Glass"
                      className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded text-xs font-mono focus:border-zinc-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Design Manifestos */}
              <div className="space-y-4 pt-4 border-t border-zinc-800/60">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">III. Curatorial Narrative & Concept</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-400 block mb-2">Curatorial Synopsis (Description)</label>
                    <textarea
                      name="description"
                      value={formState.description || ""}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      placeholder="Describe the architectural weight, atmosphere, and spatial dialogue with the terrain..."
                      className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded text-xs font-mono focus:border-zinc-500 focus:outline-none leading-relaxed text-zinc-300"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-400 block mb-2">Spatial Logic Text</label>
                    <textarea
                      name="conceptText"
                      value={formState.conceptText || ""}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      placeholder="Explain the specific engineering coordinates, solar capture, and volumetric distribution logic..."
                      className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded text-xs font-mono focus:border-zinc-500 focus:outline-none leading-relaxed text-zinc-300"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-400 block mb-2">Concept Write-up Background Color</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        name="conceptBgColor"
                        value={formState.conceptBgColor || "#09090b"}
                        onChange={(e) => {
                          setFormState(prev => ({ ...prev, conceptBgColor: e.target.value }));
                        }}
                        className="w-10 h-10 rounded border border-zinc-800 bg-zinc-950 cursor-pointer"
                      />
                      <input
                        type="text"
                        name="conceptBgColor"
                        value={formState.conceptBgColor || ""}
                        onChange={(e) => {
                          setFormState(prev => ({ ...prev, conceptBgColor: e.target.value }));
                        }}
                        placeholder="e.g. #09090b or transparent"
                        className="flex-1 bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded text-xs font-mono focus:border-zinc-500 focus:outline-none text-zinc-300"
                      />
                    </div>
                    <p className="text-[8px] font-mono text-zinc-500 uppercase mt-1">
                      Customize the background color of the write-up block below the gateway image.
                    </p>
                  </div>

                  {/* Spatial Logic & Curated Slides Editor */}
                  <div className="space-y-4 border border-zinc-800/80 p-5 rounded-lg bg-zinc-950/20">
                    <div className="flex justify-between items-center border-b border-zinc-800/80 pb-2.5">
                      <div>
                        <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-300">Spatial Logic Interactive Slides</h4>
                        <p className="text-[8px] font-mono text-zinc-500 uppercase">These slides form the interactive scroll-to-expand landscape gallery below</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddBlankSlide}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[8px] font-mono uppercase tracking-wider rounded border border-zinc-700"
                      >
                        <Plus size={10} /> Add Slide
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
                      {formState.exhibitionMedia && formState.exhibitionMedia.length > 0 ? (
                        formState.exhibitionMedia.map((slide, idx) => (
                          <div key={slide.id || idx} className="p-4 bg-zinc-950 border border-zinc-800/80 rounded relative space-y-3">
                            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                              <span className="text-[9px] font-mono uppercase text-zinc-400">Slide #{idx + 1}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleMoveSlide(idx, "up")}
                                  disabled={idx === 0}
                                  className="p-1 hover:bg-zinc-900 rounded text-zinc-400 disabled:opacity-30"
                                  title="Move Up"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveSlide(idx, "down")}
                                  disabled={idx === formState.exhibitionMedia!.length - 1}
                                  className="p-1 hover:bg-zinc-900 rounded text-zinc-400 disabled:opacity-30"
                                  title="Move Down"
                                >
                                  ▼
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSlide(slide.id || idx)}
                                  className="p-1 hover:bg-red-950/40 rounded text-red-400 hover:text-red-300"
                                  title="Delete Slide"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {/* Left Media Preview & Upload */}
                              <div className="space-y-2">
                                <label className="text-[8px] font-mono uppercase text-zinc-500 block">Media Source</label>
                                {slide.url ? (
                                  slide.type === "video" ? (
                                    <video src={slide.url} className="w-full h-24 object-cover rounded bg-black" muted />
                                  ) : (
                                    <img src={slide.url} className="w-full h-24 object-cover rounded bg-zinc-900" referrerPolicy="no-referrer" />
                                  )
                                ) : (
                                  <div className="w-full h-24 rounded border border-dashed border-zinc-800 flex items-center justify-center text-zinc-600 text-[9px] font-mono">
                                    No Media
                                  </div>
                                )}
                                
                                <div className="flex gap-1.5 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleTriggerSlideUpload(idx)}
                                    className="flex-1 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-[8px] font-mono uppercase tracking-wider text-zinc-300"
                                  >
                                    Upload
                                  </button>
                                  <select
                                    value={slide.type || "image"}
                                    onChange={(e) => handleSlideFieldChange(idx, "type", e.target.value)}
                                    className="bg-zinc-900 border border-zinc-800 rounded text-[8px] font-mono text-zinc-300 px-1 focus:outline-none"
                                  >
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                  </select>
                                </div>
                              </div>

                              {/* Right Fields (Title & Narrative) */}
                              <div className="md:col-span-2 space-y-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[8px] font-mono uppercase text-zinc-500 block mb-1">Slide Title / Topic</label>
                                    <input
                                      type="text"
                                      value={slide.title || ""}
                                      onChange={(e) => handleSlideFieldChange(idx, "title", e.target.value)}
                                      placeholder="e.g. Tactile Materials"
                                      className="w-full bg-zinc-950 border border-zinc-800 px-2 py-1 rounded text-[10px] font-mono focus:border-zinc-500 focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[8px] font-mono uppercase text-zinc-500 block mb-1">Media URL (Or upload)</label>
                                    <input
                                      type="text"
                                      value={slide.url || ""}
                                      onChange={(e) => handleSlideFieldChange(idx, "url", e.target.value)}
                                      placeholder="https://..."
                                      className="w-full bg-zinc-950 border border-zinc-800 px-2 py-1 rounded text-[10px] font-mono focus:border-zinc-500 focus:outline-none"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[8px] font-mono uppercase text-zinc-500 block mb-1">Curatorial Narrative / Write-up</label>
                                  <textarea
                                    value={slide.description || ""}
                                    onChange={(e) => handleSlideFieldChange(idx, "description", e.target.value)}
                                    placeholder="The narrative text details that will change dynamically as the user scrolls..."
                                    rows={2}
                                    className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-[10px] font-mono focus:border-zinc-500 focus:outline-none leading-normal text-zinc-300"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 border border-dashed border-zinc-800/80 rounded bg-zinc-950/10 text-zinc-500 text-[10px] font-mono uppercase">
                          No slides created yet. Add slides to build your custom storytelling.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Media & Drawings */}
              <div className="space-y-4 pt-4 border-t border-zinc-800/60">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">IV. Exhibition Media & Blueprint Blueprints</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-400 block mb-2">Hero Cinematic Image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="heroImage"
                        value={formState.heroImage || ""}
                        onChange={handleInputChange}
                        required
                        className="flex-1 bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded text-xs font-mono focus:border-zinc-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => triggerUpload("heroImage")}
                        className="px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded flex items-center justify-center"
                        title="Upload Hero"
                      >
                        <Upload size={14} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-400 block mb-2">Autoplay Video Loop MP4 URL (Optional)</label>
                    <input
                      type="text"
                      name="videoUrl"
                      value={formState.videoUrl || ""}
                      onChange={handleInputChange}
                      placeholder="e.g. /video-loop.mp4 or Mixkit MP4 link"
                      className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded text-xs font-mono focus:border-zinc-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-400 block mb-2">Gallery Images (Exhibits)</label>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formState.images?.map((img, i) => (
                          <div key={i} className="relative group border border-zinc-800 p-1 bg-zinc-950 rounded">
                            <img src={img} className="w-10 h-10 object-cover" />
                            <button
                              type="button"
                              onClick={() => setFormState(prev => ({ ...prev, images: prev.images?.filter((_, idx) => idx !== i) }))}
                              className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-700 text-white p-0.5 rounded-full text-[8px]"
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => triggerUpload("images")}
                        className="w-full py-2.5 border border-dashed border-zinc-800 hover:border-zinc-500 bg-zinc-950 text-zinc-400 hover:text-zinc-200 text-[10px] font-mono uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        <Plus size={12} /> Add Gallery Image
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-400 block mb-2">In-Progress Construction Photos</label>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formState.constructionPhotos?.map((img, i) => (
                          <div key={i} className="relative group border border-zinc-800 p-1 bg-zinc-950 rounded">
                            <img src={img} className="w-10 h-10 object-cover" />
                            <button
                              type="button"
                              onClick={() => setFormState(prev => ({ ...prev, constructionPhotos: prev.constructionPhotos?.filter((_, idx) => idx !== i) }))}
                              className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-700 text-white p-0.5 rounded-full text-[8px]"
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => triggerUpload("constructionPhotos")}
                        className="w-full py-2.5 border border-dashed border-zinc-800 hover:border-zinc-500 bg-zinc-950 text-zinc-400 hover:text-zinc-200 text-[10px] font-mono uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        <Plus size={12} /> Add Archival Photo
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-400 block mb-2">Technical Blueprints / Drawings</label>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formState.drawings?.map((img, i) => (
                          <div key={i} className="relative group border border-zinc-800 p-1 bg-zinc-950 rounded">
                            {img.startsWith("<") ? (
                              <div className="w-10 h-10 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded overflow-hidden text-[8px] text-zinc-500 font-mono">SVG</div>
                            ) : (
                              <img src={img} className="w-10 h-10 object-cover" />
                            )}
                            <button
                              type="button"
                              onClick={() => setFormState(prev => ({ ...prev, drawings: prev.drawings?.filter((_, idx) => idx !== i) }))}
                              className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-700 text-white p-0.5 rounded-full text-[8px]"
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => triggerUpload("drawings")}
                        className="w-full py-2.5 border border-dashed border-zinc-800 hover:border-zinc-500 bg-zinc-950 text-zinc-400 hover:text-zinc-200 text-[10px] font-mono uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        <Plus size={12} /> Add Blueprint Drawing
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-400 block mb-2">Comparison Before Image (Unbuilt)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="comparisonBeforeImage"
                        value={formState.comparisonBeforeImage || ""}
                        onChange={handleInputChange}
                        placeholder="Image URL showing unbuilt/blueprint state"
                        className="flex-1 bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded text-xs font-mono focus:border-zinc-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => triggerUpload("comparisonBeforeImage")}
                        className="px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded flex items-center justify-center"
                      >
                        <Upload size={14} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-400 block mb-2">Comparison After Image (Completed)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="comparisonAfterImage"
                        value={formState.comparisonAfterImage || ""}
                        onChange={handleInputChange}
                        placeholder="Image URL showing completed space"
                        className="flex-1 bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded text-xs font-mono focus:border-zinc-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => triggerUpload("comparisonAfterImage")}
                        className="px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded flex items-center justify-center"
                      >
                        <Upload size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: Exhibition Gallery / Project Archive Media Manager */}
              <div className="space-y-4 pt-4 border-t border-zinc-800/60">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">V. Project Archive Media Manager</h3>
                    <p className="text-[9px] font-mono text-zinc-500 uppercase mt-0.5">Manage high-res photo exhibits, video tours, or platform linked assets</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExhibitionIsFormOpen(!exhibitionIsFormOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-[9px] font-mono uppercase tracking-wider rounded border border-zinc-700"
                  >
                    <Plus size={10} /> {exhibitionIsFormOpen ? "Close Upload" : "Add Photos & Videos"}
                  </button>
                </div>

                {exhibitionIsFormOpen && (
                  <div className="border border-zinc-800 p-4 rounded bg-zinc-950/40 space-y-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setExhibitionUploadType('upload')}
                        className={`flex-1 py-1.5 text-[9px] font-mono uppercase tracking-wider border rounded transition-colors ${
                          exhibitionUploadType === 'upload'
                            ? "bg-zinc-100 border-zinc-100 text-zinc-950 font-bold"
                            : "border-zinc-800 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <Upload size={10} className="inline mr-1.5" /> Upload Local Files
                      </button>
                      <button
                        type="button"
                        onClick={() => setExhibitionUploadType('link')}
                        className={`flex-1 py-1.5 text-[9px] font-mono uppercase tracking-wider border rounded transition-colors ${
                          exhibitionUploadType === 'link'
                            ? "bg-zinc-100 border-zinc-100 text-zinc-950 font-bold"
                            : "border-zinc-800 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <Link size={10} className="inline mr-1.5" /> Link Social/Platform URL
                      </button>
                    </div>

                    {exhibitionUploadType === 'upload' ? (
                      <div className="border border-dashed border-zinc-800 rounded p-6 text-center bg-zinc-950/60 hover:bg-zinc-900/40 transition-colors relative cursor-pointer">
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          onChange={handleExhibitionLocalUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={exhibitionUploading}
                        />
                        <Upload size={18} className="mx-auto text-zinc-500 mb-2" />
                        <span className="text-[10px] font-mono text-zinc-400 uppercase block">Drag and drop or click to upload files</span>
                        <span className="text-[8px] font-mono text-zinc-500 uppercase mt-1 block">Supports multiple image or video file selection</span>
                      </div>
                    ) : (
                      <div className="space-y-3 bg-zinc-950 p-4 rounded border border-zinc-800">
                        <div className="space-y-1">
                          <label className="text-[8px] font-mono uppercase tracking-wider text-zinc-500 block">Social Media / Platform URL</label>
                          <input
                            type="url"
                            placeholder="e.g. https://www.youtube.com/watch?v=..., instagram, facebook"
                            value={exhibitionExtUrl}
                            onChange={(e) => setExhibitionExtUrl(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-[10px] font-mono text-zinc-200 focus:outline-none focus:border-zinc-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[8px] font-mono uppercase tracking-wider text-zinc-500 block">Asset Label / Title (Optional)</label>
                            <input
                              type="text"
                              placeholder="e.g. Interior Drone Footage"
                              value={exhibitionExtTitle}
                              onChange={(e) => setExhibitionExtTitle(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-[10px] font-mono text-zinc-200 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] font-mono uppercase tracking-wider text-zinc-500 block">Thumbnail Cover Image (Optional)</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setExhibitionExtCoverFile(e.target.files[0]);
                                }
                              }}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1 text-[10px] font-mono text-zinc-400 file:mr-2 file:py-0.5 file:px-2 file:border-0 file:text-[8px] file:font-mono file:bg-zinc-800 file:text-zinc-200"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleExhibitionAddExternalLink}
                          disabled={exhibitionUploading}
                          className="w-full py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 hover:opacity-90 transition-opacity text-[9px] font-mono uppercase tracking-widest rounded font-bold"
                        >
                          Save Platform Asset
                        </button>
                      </div>
                    )}

                    {exhibitionUploading && (
                      <div className="flex items-center gap-2 text-[9px] font-mono uppercase text-zinc-500 animate-pulse mt-2 pl-1">
                        <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" />
                        <span>{exhibitionUploadStatus || "Uploading assets..."}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Grid of existing exhibition media items */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                  {(formState.exhibitionMedia || []).map((item) => (
                    <div
                      key={item.id}
                      className="border border-zinc-800/80 bg-zinc-950/20 rounded p-2 flex flex-col justify-between relative group hover:border-zinc-700 transition-colors"
                    >
                      <div className="relative aspect-video bg-zinc-900 rounded overflow-hidden flex items-center justify-center">
                        {item.type === 'video' ? (
                          <div className="flex flex-col items-center justify-center text-zinc-500">
                            <Video size={16} />
                            <span className="text-[7px] font-mono uppercase mt-1">Video</span>
                          </div>
                        ) : (
                          <img
                            src={item.coverImage || item.url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        
                        {/* Type badge */}
                        <span className="absolute bottom-1 left-1 px-1 py-0.5 bg-black/70 text-[6px] font-mono text-zinc-300 uppercase rounded">
                          {item.platform === 'local' ? 'Local' : item.platform}
                        </span>
                      </div>

                      <div className="mt-2 min-w-0">
                        <h4 className="text-[9px] font-mono text-zinc-300 truncate uppercase" title={item.title}>
                          {item.title || "Untitled"}
                        </h4>
                        <span className="text-[7px] font-mono text-zinc-500 uppercase tracking-widest block mt-0.5">
                          {item.type === 'image' ? 'Image' : 'Video'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleExhibitionDeleteMedia(item.id)}
                        className="absolute top-1 right-1 p-1 bg-zinc-900/80 hover:bg-red-950 hover:text-red-400 text-zinc-500 rounded transition-colors"
                        title="Delete asset"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}

                  {(formState.exhibitionMedia || []).length === 0 && (
                    <div className="col-span-full py-8 text-center border border-dashed border-zinc-800 rounded bg-zinc-950/10">
                      <Image size={18} className="mx-auto text-zinc-700 mb-2" />
                      <p className="text-[9px] font-mono uppercase text-zinc-500">Project Archive Gallery is Empty</p>
                      <p className="text-[8px] font-mono text-zinc-500 uppercase mt-1">Use the upload tool above to curate this project&apos;s photos and videos</p>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 6: Exhibition Rules & Metadata */}
              <div className="space-y-4 pt-4 border-t border-zinc-800/60">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">VI. Curatorial Logistics & Metadata</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-400 block mb-2">Atelier Team (Comma-separated)</label>
                    <input
                      type="text"
                      name="team"
                      value={formState.team?.join(", ") || ""}
                      onChange={(e) => handleListChange("team", e.target.value)}
                      placeholder="e.g. Lara Shailora, Takahiro Sato"
                      className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded text-xs font-mono focus:border-zinc-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-400 block mb-2">Accolades & Distinctions (Comma-separated)</label>
                    <input
                      type="text"
                      name="awards"
                      value={formState.awards?.join(", ") || ""}
                      onChange={(e) => handleListChange("awards", e.target.value)}
                      placeholder="e.g. Nordic Design Award 2024 - Gold"
                      className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded text-xs font-mono focus:border-zinc-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-400 block mb-2">Client Coordinates</label>
                    <input
                      type="text"
                      name="client"
                      value={formState.client || ""}
                      onChange={handleInputChange}
                      placeholder="e.g. Horikawa Family Trust"
                      className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded text-xs font-mono focus:border-zinc-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-400 block mb-2">Tags / Spatial Keycodes (Comma-separated)</label>
                    <input
                      type="text"
                      name="tags"
                      value={formState.tags?.join(", ") || ""}
                      onChange={(e) => handleListChange("tags", e.target.value)}
                      placeholder="e.g. Minimal, Cold, Shadow, Brutalism"
                      className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded text-xs font-mono focus:border-zinc-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-400 block mb-2">Homepage Order (Rank)</label>
                    <input
                      type="number"
                      name="homepageOrder"
                      value={formState.homepageOrder || 10}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded text-xs font-mono focus:border-zinc-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      id="featured"
                      name="featured"
                      checked={!!formState.featured}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded accent-zinc-100 bg-zinc-950 border-zinc-800 focus:ring-0 focus:outline-none"
                    />
                    <label htmlFor="featured" className="text-[10px] font-mono uppercase text-zinc-400 cursor-pointer select-none">Featured Museum Exhibit</label>
                  </div>
                </div>
              </div>

              {/* SECTION 6: External Media & Social Links */}
              <div className="space-y-4 pt-4 border-t border-zinc-800/60">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">VI. External Media & Social Links</h3>
                <p className="text-[9px] font-mono text-zinc-500 uppercase">Define specific links for video walkthroughs, news/press features, or social media handles for this project.</p>
                
                <div className="space-y-3">
                  {(formState.externalLinks || []).map((lnk, idx) => (
                    <div key={idx} className="flex gap-3 items-center bg-zinc-950/40 p-3 border border-zinc-800 rounded">
                      <div className="w-1/4">
                        <label className="text-[8px] font-mono uppercase text-zinc-500 block mb-1">Label</label>
                        <input
                          type="text"
                          value={lnk.label}
                          onChange={(e) => {
                            const updated = [...(formState.externalLinks || [])];
                            updated[idx] = { ...updated[idx], label: e.target.value };
                            setFormState((prev) => ({ ...prev, externalLinks: updated }));
                          }}
                          placeholder="e.g. YouTube Video"
                          className="w-full bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded text-xs font-mono text-white focus:outline-none focus:border-zinc-500"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="text-[8px] font-mono uppercase text-zinc-500 block mb-1">URL Link</label>
                        <input
                          type="text"
                          value={lnk.url}
                          onChange={(e) => {
                            const updated = [...(formState.externalLinks || [])];
                            updated[idx] = { ...updated[idx], url: e.target.value };
                            setFormState((prev) => ({ ...prev, externalLinks: updated }));
                          }}
                          placeholder="https://..."
                          className="w-full bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded text-xs font-mono text-white focus:outline-none focus:border-zinc-500"
                        />
                      </div>

                      <div className="w-1/5">
                        <label className="text-[8px] font-mono uppercase text-zinc-500 block mb-1">Type</label>
                        <select
                          value={lnk.type}
                          onChange={(e) => {
                            const updated = [...(formState.externalLinks || [])];
                            updated[idx] = { ...updated[idx], type: e.target.value as any };
                            setFormState((prev) => ({ ...prev, externalLinks: updated }));
                          }}
                          className="w-full bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded text-xs font-mono text-white focus:outline-none focus:border-zinc-500"
                        >
                          <option value="video">Video</option>
                          <option value="article">Article</option>
                          <option value="social">Social</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const updated = (formState.externalLinks || []).filter((_, i) => i !== idx);
                          setFormState((prev) => ({ ...prev, externalLinks: updated }));
                        }}
                        className="p-2 text-zinc-600 hover:text-red-400 mt-4 rounded hover:bg-zinc-900"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...(formState.externalLinks || []), { label: "", url: "", type: "other" as const }];
                      setFormState((prev) => ({ ...prev, externalLinks: updated }));
                    }}
                    className="w-full py-2 border border-dashed border-zinc-800 hover:border-zinc-500 text-[9px] font-mono text-zinc-400 hover:text-zinc-200 uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <Plus size={12} /> Add Media / Social Link
                  </button>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-8 flex justify-end gap-4 pb-12">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-5 py-2.5 border border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-mono font-bold uppercase tracking-widest transition-colors rounded"
                >
                  <Save size={14} /> {isSaving ? "Writing..." : "Save Exhibit"}
                </button>
              </div>
            </form>
          </AnimatePresence>
        </div>
      </div>
      )}
    </div>
  );
}
