
import {
    useEffect,
    useState,
    useCallback,
    useMemo,
    useRef
} from "react";

import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/apiFetch.js";

import {
    LayoutDashboard,
    Users,
    HardDrive,
    CalendarDays,
    Search,
    RefreshCw,
    UploadCloud,
    Grid2X2,
    List,
    Folder,
    FileText,
    FileImage,
    FileVideo,
    FileSpreadsheet,
    MoreVertical,
    Cloud,
    ShieldCheck,
    ArrowUpDown,
    Clock3,
    ChevronRight,
    Plus,
    HardDriveDownload,
    Menu,
    X,
    CheckCircle,
    AlertCircle,
    File
} from "lucide-react";

import "./GoogleDrive.css";

const API_URL =
    "http://localhost:8080/api/auth/appUsers/drive/files";

const UPLOAD_URL =
    "http://localhost:8080/api/auth/appUsers/drive/upload";

export default function GoogleDrive() {

    const navigate = useNavigate();

    const fileInputRef = useRef(null);

    const [files, setFiles] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [view, setView] = useState("grid");
    const [sort, setSort] = useState("name");

    const [mobileMenu, setMobileMenu] = useState(false);

    // Upload states
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadMessage, setUploadMessage] = useState("");
    const [uploadError, setUploadError] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    // ==========================================
    // 1. Get All Google Drive Files
    // ==========================================

    const fetchFiles = useCallback(async () => {

        try {
            setLoading(true);
            setError("");

            const response = await apiFetch(API_URL, {
                method: "GET",
                headers: {
                    Accept: "application/json"
                }
            });

            if (response.status === 401) {
                throw new Error("Session expired. Please login again.");
            }

            if (response.status === 403) {
                throw new Error("Google Drive access is not authorized.");
            }

            const result = await response.json();

            if (!response.ok || result.code !== 1) {
                throw new Error(
                    result.message || "Unable to load Google Drive files."
                );
            }

            setFiles(result.data || []);

        } catch (err) {
            console.error("Fetch Drive files error:", err);
            setError(err.message || "Unable to load files.");

        } finally {
            setLoading(false);
        }

    }, []);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    // ==========================================
    // 2. File Selection
    // ==========================================

    const selectFile = (file) => {

        if (!file) return;

        setSelectedFile(file);
        setUploadMessage("");
        setUploadError("");
        setUploadProgress(0);
    };

    const handleFileChange = (event) => {

        const file = event.target.files?.[0];

        if (file) {
            selectFile(file);
        }

        // Same file can be selected again
        event.target.value = "";
    };

    const openFilePicker = () => {

        if (!uploading) {
            fileInputRef.current?.click();
        }
    };

    // ==========================================
    // 3. Drag and Drop
    // ==========================================

    const handleDragOver = (event) => {
        event.preventDefault();

        if (!uploading) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (event) => {

        event.preventDefault();
        setIsDragging(false);

        if (uploading) return;

        const file = event.dataTransfer.files?.[0];

        if (file) {
            selectFile(file);
        }
    };

    // ==========================================
    // 4. Upload File to Google Drive
    // ==========================================

    const handleUpload = async () => {

        if (!selectedFile) {
            setUploadError("Please select a file first.");
            return;
        }

        try {

            setUploading(true);
            setUploadError("");
            setUploadMessage("");
            setUploadProgress(0);

            const formData = new FormData();

            formData.append("file", selectedFile);

            const xhr = new XMLHttpRequest();

            const uploadPromise = new Promise((resolve, reject) => {

                xhr.open("POST", UPLOAD_URL);

                // Send JSESSIONID cookie
                xhr.withCredentials = true;

                xhr.setRequestHeader(
                    "Accept",
                    "application/json"
                );

                // Upload progress
                xhr.upload.onprogress = (event) => {

                    if (event.lengthComputable) {

                        const progress = Math.round(
                            (event.loaded / event.total) * 100
                        );

                        setUploadProgress(progress);
                    }
                };

                xhr.onload = () => {

                    try {

                        const result = JSON.parse(xhr.responseText);

                        if (
                            xhr.status >= 200 &&
                            xhr.status < 300 &&
                            result.code === 1
                        ) {
                            resolve(result);
                        } else {

                            reject(
                                new Error(
                                    result.message ||
                                    `Upload failed. HTTP ${xhr.status}`
                                )
                            );
                        }

                    } catch (error) {

                        reject(
                            new Error(
                                "Invalid response received from server."
                            )
                        );
                    }
                };

                xhr.onerror = () => {
                    reject(
                        new Error("Unable to connect to backend.")
                    );
                };

                xhr.onabort = () => {
                    reject(new Error("File upload was cancelled."));
                };

                // Do not manually set Content-Type.
                // Browser sets multipart boundary automatically.
                xhr.send(formData);
            });

            await uploadPromise;

            setUploadProgress(100);

            setUploadMessage(
                `${selectedFile.name} uploaded successfully!`
            );

            setSelectedFile(null);

            // Refresh Drive files after successful upload
            await fetchFiles();

        } catch (err) {

            console.error("Upload error:", err);

            setUploadError(
                err.message || "Unable to upload file."
            );

        } finally {

            setUploading(false);
        }
    };

    const clearSelectedFile = () => {

        if (uploading) return;

        setSelectedFile(null);
        setUploadProgress(0);
        setUploadError("");
        setUploadMessage("");
    };

    // ==========================================
    // 5. File Helpers
    // ==========================================

    const isFolder = (file) =>
        file.mimeType === "application/vnd.google-apps.folder";

    const getIcon = (file) => {

        if (isFolder(file)) {
            return <Folder className="drive-folder-icon" />;
        }

        if (file.mimeType?.startsWith("image/")) {
            return <FileImage className="drive-image-icon" />;
        }

        if (file.mimeType?.startsWith("video/")) {
            return <FileVideo className="drive-video-icon" />;
        }

        if (
            file.mimeType?.includes("spreadsheet") ||
            file.mimeType?.includes("excel")
        ) {
            return <FileSpreadsheet className="drive-sheet-icon" />;
        }

        if (file.mimeType?.includes("pdf")) {
            return <FileText className="drive-pdf-icon" />;
        }

        return <FileText className="drive-doc-icon" />;
    };

    const formatSize = (size) => {

        if (!size) return "—";

        const bytes = Number(size);

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        if (bytes < 1024 * 1024 * 1024) {
            return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
        }

        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    };

    // ==========================================
    // 6. Search and Sort
    // ==========================================

    const filteredFiles = useMemo(() => {

        return files
            .filter(file =>
                file.name?.toLowerCase().includes(
                    search.toLowerCase()
                )
            )
            .sort((a, b) => {

                if (sort === "name") {
                    return (a.name || "").localeCompare(b.name || "");
                }

                if (sort === "date") {
                    return new Date(b.modifiedTime || 0) -
                        new Date(a.modifiedTime || 0);
                }

                return Number(b.size || 0) -
                    Number(a.size || 0);
            });

    }, [files, search, sort]);

    const folders = files.filter(isFolder).length;
    const totalFiles = files.length - folders;

    // ==========================================
    // 7. Open Google Drive File
    // ==========================================

    const openFile = (file) => {

        if (file.webViewLink) {
            window.open(
                file.webViewLink,
                "_blank",
                "noopener,noreferrer"
            );
        }
    };

    // ==========================================
    // 8. UI
    // ==========================================

    return (

        <div className="drive-layout">

            {/* SIDEBAR */}

            <aside className={`drive-sidebar ${mobileMenu ? "mobile-open" : ""}`}>

                <div className="drive-brand">

                    <div className="drive-brand-icon">
                        <HardDrive size={23} />
                    </div>

                    <span>
                        Darshak
                        <span className="brand-highlight">Drive</span>
                    </span>

                </div>

                <button
                    className="drive-create"
                    onClick={openFilePicker}
                    disabled={uploading}
                >
                    <Plus size={20} />
                    Upload New File
                </button>

                <p className="drive-nav-label">WORKSPACE</p>

                <div
                    className="drive-nav-item"
                    onClick={() => navigate("/dashboard")}
                >
                    <LayoutDashboard size={19} />
                    Dashboard
                </div>

                <div
                    className="drive-nav-item"
                    onClick={() => navigate("/users")}
                >
                    <Users size={19} />
                    All Users
                </div>

                <div className="drive-nav-item selected">
                    <HardDrive size={19} />
                    My Drive
                </div>

                <div
                    className="drive-nav-item"
                    onClick={() => navigate("/google-calendar")}
                >
                    <CalendarDays size={19} />
                    Calendar
                </div>

                <div className="drive-sidebar-bottom">

                    <div className="drive-cloud-box">

                        <div className="drive-cloud-icon">
                            <Cloud size={23} />
                        </div>

                        <h4>Cloud connected</h4>

                        <p>
                            Your Google Drive is connected securely.
                        </p>

                        <div className="drive-secure">
                            <ShieldCheck size={14} />
                            OAuth2 Protected
                        </div>

                    </div>

                    <p className="drive-version">
                        DARSHAK DRIVE • V1.0
                    </p>

                </div>

            </aside>

            {/* MAIN */}

            <main className="drive-main">

                <header className="drive-topbar">

                    <button
                        className="drive-mobile-menu"
                        onClick={() => setMobileMenu(!mobileMenu)}
                    >
                        <Menu />
                    </button>

                    <div className="drive-breadcrumb">
                        Workspace
                        <ChevronRight size={15} />
                        <strong>My Drive</strong>
                    </div>

                    <div className="drive-top-actions">

                        <span className="drive-live">
                            <span />
                            Connected
                        </span>

                        <button className="drive-avatar">
                            D
                        </button>

                    </div>

                </header>

                <section className="drive-content">

                    {/* HERO */}

                    <div className="drive-hero">

                        <div>

                            <div className="drive-overline">
                                <span className="drive-overline-dot" />
                                YOUR PERSONAL CLOUD SPACE
                            </div>

                            <h1>
                                Everything in <span>one place.</span>
                            </h1>

                            <p>
                                Organize, explore and manage your files
                                with a smarter cloud experience.
                            </p>

                        </div>

                        <button
                            className="drive-upload-btn"
                            onClick={openFilePicker}
                            disabled={uploading}
                        >
                            <UploadCloud size={20} />
                            Upload Files
                        </button>

                    </div>

                    {/* HIDDEN FILE INPUT */}

                    <input
                        ref={fileInputRef}
                        type="file"
                        hidden
                        onChange={handleFileChange}
                    />

                    {/* STATS */}

                    <div className="drive-stats">

                        <div className="drive-stat">

                            <div className="drive-stat-top">
                                <span>Total Items</span>

                                <div className="stat-icon purple">
                                    <HardDriveDownload />
                                </div>
                            </div>

                            <h2>{files.length}</h2>

                            <small>Items in your Drive</small>

                        </div>

                        <div className="drive-stat">

                            <div className="drive-stat-top">
                                <span>Files</span>

                                <div className="stat-icon blue">
                                    <FileText />
                                </div>
                            </div>

                            <h2>{totalFiles}</h2>

                            <small>Documents and media</small>

                        </div>

                        <div className="drive-stat">

                            <div className="drive-stat-top">
                                <span>Folders</span>

                                <div className="stat-icon orange">
                                    <Folder />
                                </div>
                            </div>

                            <h2>{folders}</h2>

                            <small>Organized folders</small>

                        </div>

                        <div className="drive-stat">

                            <div className="drive-stat-top">
                                <span>Drive Status</span>

                                <div className="stat-icon green">
                                    <Cloud />
                                </div>
                            </div>

                            <h2 className="drive-online">Online</h2>

                            <small>Google account connected</small>

                        </div>

                    </div>

                    {/* FILE SECTION */}

                    <section className="drive-files-section">

                        <div className="drive-section-heading">

                            <div>
                                <span className="drive-section-tag">
                                    YOUR STORAGE
                                </span>

                                <h2>Explore your files</h2>

                                <p>
                                    Everything you've saved, all in one place.
                                </p>
                            </div>

                            <button
                                className="drive-refresh"
                                onClick={fetchFiles}
                                disabled={loading}
                            >
                                <RefreshCw
                                    size={17}
                                    className={loading ? "drive-spinning" : ""}
                                />
                                Refresh
                            </button>

                        </div>

                        {/* UPLOAD PANEL */}

                        <div
                            className={`drive-upload-panel ${isDragging ? "drive-drag-active" : ""}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >

                            <div className="drive-upload-heading">

                                <div className="drive-upload-icon">
                                    <UploadCloud size={25} />
                                </div>

                                <div>
                                    <h3>Upload to Google Drive</h3>

                                    <p>
                                        Drag and drop your file here or browse
                                        your computer.
                                    </p>
                                </div>

                            </div>

                            <div className="drive-drop-area">

                                <UploadCloud size={30} />

                                <strong>
                                    {isDragging
                                        ? "Drop your file here"
                                        : "Drag & drop your file"}
                                </strong>

                                <span>or</span>

                                <button
                                    type="button"
                                    className="drive-choose-file"
                                    onClick={openFilePicker}
                                    disabled={uploading}
                                >
                                    Browse Files
                                </button>

                            </div>

                            {selectedFile && (

                                <div className="drive-selected-file">

                                    <div className="drive-selected-file-icon">
                                        <File size={21} />
                                    </div>

                                    <div className="drive-selected-file-info">

                                        <strong>{selectedFile.name}</strong>

                                        <span>
                                            {formatSize(selectedFile.size)}
                                        </span>

                                    </div>

                                    <button
                                        type="button"
                                        className="drive-clear-file"
                                        onClick={clearSelectedFile}
                                        disabled={uploading}
                                        title="Remove selected file"
                                    >
                                        <X size={18} />
                                    </button>

                                </div>

                            )}

                            <div className="drive-upload-actions">

                                <button
                                    type="button"
                                    className="drive-start-upload"
                                    onClick={handleUpload}
                                    disabled={!selectedFile || uploading}
                                >
                                    <UploadCloud size={18} />

                                    {uploading
                                        ? "Uploading..."
                                        : "Start Upload"}
                                </button>

                                {uploading && (
                                    <span className="drive-upload-percent">
                                        {uploadProgress}%
                                    </span>
                                )}

                            </div>

                            {uploading && (

                                <div className="drive-progress-area">

                                    <div className="drive-progress-info">
                                        <span>Uploading your file...</span>
                                        <strong>{uploadProgress}%</strong>
                                    </div>

                                    <div className="drive-progress-track">

                                        <div
                                            className="drive-progress-fill"
                                            style={{
                                                width: `${uploadProgress}%`
                                            }}
                                        />

                                    </div>

                                </div>

                            )}

                            {uploadMessage && (

                                <div className="drive-upload-success">
                                    <CheckCircle size={18} />
                                    <span>{uploadMessage}</span>
                                </div>

                            )}

                            {uploadError && (

                                <div className="drive-upload-error">
                                    <AlertCircle size={18} />
                                    <span>{uploadError}</span>
                                </div>

                            )}

                        </div>

                        {/* SEARCH AND SORT */}

                        <div className="drive-toolbar">

                            <div className="drive-search">

                                <Search size={18} />

                                <input
                                    placeholder="Search your files..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />

                            </div>

                            <div className="drive-toolbar-right">

                                <div className="drive-sort">

                                    <ArrowUpDown size={16} />

                                    <select
                                        value={sort}
                                        onChange={e => setSort(e.target.value)}
                                    >
                                        <option value="name">Name</option>
                                        <option value="date">Latest</option>
                                        <option value="size">Size</option>
                                    </select>

                                </div>

                                <div className="drive-view-toggle">

                                    <button
                                        className={view === "grid" ? "active" : ""}
                                        onClick={() => setView("grid")}
                                        title="Grid view"
                                    >
                                        <Grid2X2 size={17} />
                                    </button>

                                    <button
                                        className={view === "list" ? "active" : ""}
                                        onClick={() => setView("list")}
                                        title="List view"
                                    >
                                        <List size={19} />
                                    </button>

                                </div>

                            </div>

                        </div>

                        {/* ERROR */}

                        {error && (

                            <div className="drive-error">
                                {error}
                                <button onClick={fetchFiles}>Retry</button>
                            </div>

                        )}

                        {/* LOADING */}

                        {loading && (

                            <div className="drive-loading">
                                <RefreshCw className="drive-spinning" />
                                <span>Loading your files...</span>
                            </div>

                        )}

                        {/* FILE LIST */}

                        {!loading && !error && (

                            <>

                                <div className="drive-results">

                                    <span>
                                        <Clock3 size={15} />
                                        All files
                                    </span>

                                    <strong>
                                        {filteredFiles.length} items
                                    </strong>

                                </div>

                                <div
                                    className={`drive-file-grid ${view === "list" ? "list-view" : ""}`}
                                >

                                    {filteredFiles.map(file => (

                                        <article
                                            className="drive-file-card"
                                            key={file.id}
                                            onClick={() => openFile(file)}
                                        >

                                            <div className="drive-file-card-top">

                                                <div className="drive-file-type-icon">
                                                    {getIcon(file)}
                                                </div>

                                                <button
                                                    className="drive-more"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                    }}
                                                    title="More options"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                            </div>

                                            <div className="drive-file-title">

                                                <h3>{file.name}</h3>

                                                <span>
                                                    {isFolder(file)
                                                        ? "Folder"
                                                        : file.mimeType?.split("/").pop()}
                                                </span>

                                            </div>

                                            <div className="drive-file-card-footer">

                                                <span>
                                                    {formatSize(file.size)}
                                                </span>

                                                <span>
                                                    {file.modifiedTime
                                                        ? new Date(file.modifiedTime)
                                                            .toLocaleDateString()
                                                        : "—"}
                                                </span>

                                            </div>

                                        </article>

                                    ))}

                                    {filteredFiles.length === 0 && (

                                        <div className="drive-empty">

                                            <Folder size={38} />

                                            <h3>No files found</h3>

                                            <p>
                                                Try another search term.
                                            </p>

                                        </div>

                                    )}

                                </div>

                            </>

                        )}

                    </section>

                    {/* FOOTER */}

                    <footer className="drive-footer">

                        <span>
                            <ShieldCheck size={15} />
                            Secure Google connection
                        </span>

                        <span>
                            Powered by Google Drive API
                        </span>

                    </footer>

                </section>

            </main>

        </div>
    );
}
