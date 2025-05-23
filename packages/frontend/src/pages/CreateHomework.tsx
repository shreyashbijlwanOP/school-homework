import { useState } from 'react';
import { trpc } from '../utils/trpc';
import { getUserId } from '@/utils/auth';

const CLASS_ENUM = ['8th', '9th', '10th'];
const SUBJECT_ENUM = ['English', 'Math', 'Science', 'Social'];

export default function CreateHomeWork() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClass, setSelectedClass] = useState(CLASS_ENUM[0]);
  const [selectedSubject, setSelectedSubject] = useState(SUBJECT_ENUM[0]);
  const [daysToComplete, setDaysToComplete] = useState(3);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const createHomework = trpc.homework.create.useMutation();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFile(selected);
    if (selected) {
      // Upload file to server with progress
      const formData = new FormData();
      formData.append('file', selected);
      setUploading(true);
      setUploadProgress(0);
      try {
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', 'https://school-homework-o29e.onrender.com/api/upload');
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(percent);
            }
          };
          xhr.onload = () => {
            setUploading(false);
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                setFileUrl(data.url);
                resolve();
              } catch {
                setFileUrl(null);
                alert('File upload failed');
                reject();
              }
            } else {
              setFileUrl(null);
              alert('File upload failed');
              reject();
            }
          };
          xhr.onerror = () => {
            setUploading(false);
            setFileUrl(null);
            alert('File upload failed');
            reject();
          };
          xhr.send(formData);
        });
      } catch (err) {
        setUploading(false);
        setFileUrl(null);
      }
    } else {
      setFileUrl(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (uploading) return; // Prevent submit while uploading
    if (!fileUrl || !file) {
      alert('Please upload a file before submitting.');
      return;
    }
    try {
      await createHomework.mutateAsync({
        title,
        description,
        assignDate: new Date(),
        class: selectedClass,
        subject: selectedSubject,
        daysToComplete,
        submissionURL: fileUrl,
        FileType: file.type || 'unknown',
        assignedBy: getUserId()
      });
      setTitle('');
      setDescription('');
      setSelectedClass(CLASS_ENUM[0]);
      setSelectedSubject(SUBJECT_ENUM[0]);
      setDaysToComplete(3);
      setFile(null);
      setFileUrl(null);
      setUploading(false);
      setUploadProgress(0);
      alert('Homework created!');
    } catch (err) {
      alert('Failed to create homework');
    }
  }

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-2 py-8">
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Create Homework Form */}
        <form
          className="bg-card border border-border rounded-xl shadow-lg p-8 flex flex-col gap-5"
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-bold text-primary mb-2 text-center">Create Homework</h2>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-card-foreground">Title</label>
            <input
              className="border border-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Homework title"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-card-foreground">Description</label>
            <textarea
              className="border border-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Homework description"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <label className="font-medium text-card-foreground">Class</label>
              <select
                className="border border-border rounded px-3 py-2 bg-background text-foreground"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {CLASS_ENUM.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="font-medium text-card-foreground">Subject</label>
              <select
                className="border border-border rounded px-3 py-2 bg-background text-foreground"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                {SUBJECT_ENUM.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <label className="font-medium text-card-foreground">Days to Complete</label>
              <input
                type="number"
                min={1}
                max={30}
                className="border border-border rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={daysToComplete}
                onChange={(e) => setDaysToComplete(Number(e.target.value))}
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-card-foreground flex items-center gap-2">
              Upload File
              {uploading && (
                <span className="text-xs text-primary animate-pulse ml-2">Uploading... {uploadProgress}%</span>
              )}
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="border border-border rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>
          <button
            type="submit"
            className="w-full px-8 py-3 mt-4 rounded-md bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90 transition text-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Create Homework
          </button>
        </form>
        {/* Right: File Preview */}
        <div className="bg-card border border-border rounded-xl shadow-lg p-8 flex flex-col gap-4 items-center justify-center min-h-[400px]">
          <h3 className="text-xl font-semibold text-primary mb-4">Uploaded File Preview</h3>
          {file && fileUrl ? (
            <>
              {file.type.startsWith('image/') ? (
                <img src={fileUrl} alt="Preview" className="max-w-full max-h-96 rounded border border-border shadow" />
              ) : file.type === 'application/pdf' ? (
                <div className="w-full flex flex-col items-center">
                  <embed src={fileUrl} type="application/pdf" className="w-full h-[80vh] border rounded" />
                </div>
              ) : null}
              <div className="text-xs text-muted-foreground break-all mt-2">{fileUrl}</div>
            </>
          ) : (
            <div className="text-muted-foreground italic">No file selected.</div>
          )}
        </div>
      </div>
    </div>
  );
}
