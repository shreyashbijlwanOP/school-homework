import { getAuthInfo } from '@/utils/auth';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { trpc } from '../utils/trpc';

export default function SubmitHomeworkPage() {
  const { homeworkId } = useParams<{ homeworkId: string }>();
  const navigate = useNavigate();
  const user = getAuthInfo().user;
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const createSubmission = trpc.submission.create.useMutation();
  const { data: homework, isLoading: homeworkLoading } = trpc.homework.findById.useQuery({ id: homeworkId as string });

  // Calculate if submission is in time
  function isCompletedInTime() {
    if (!homework) return false;
    const assignDate = new Date(homework.assignDate);
    const dueDate = homework.dueDate
      ? new Date(homework.dueDate)
      : new Date(assignDate.getTime() + (homework.daysToComplete || 0) * 24 * 60 * 60 * 1000);
    return new Date() <= dueDate;
  }

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
    if (uploading || submitting) return;
    if (!fileUrl || !file) {
      alert('Please upload a file before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      await createSubmission.mutateAsync({
        studentId: user.id,
        homeworkId: homeworkId as string,
        submissionDate: new Date(),
        fileURL: fileUrl,
        fileType: file.type || 'unknown',
        isCompleted: true,
        isCompletedInTime: isCompletedInTime(),
      });
      alert('Homework submitted!');
      navigate('/student/homework');
    } catch (err) {
      alert('Failed to submit homework');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-2 py-8">
      <div className="w-full max-w-xl bg-card border border-border rounded-xl shadow-lg p-8 flex flex-col gap-5">
        <h2 className="text-2xl font-bold text-primary mb-2 text-center">Submit Homework</h2>
        {homeworkLoading ? (
          <div className="text-muted-foreground text-center">Loading homework details...</div>
        ) : homework ? (
          <div className="mb-4">
            <div className="font-semibold text-lg text-card-foreground">{homework.title}</div>
            <div className="text-sm text-muted-foreground">Due: {homework.dueDate ? new Date(homework.dueDate).toLocaleDateString() : homework.assignDate ? new Date(new Date(homework.assignDate).getTime() + (homework.daysToComplete || 0) * 24 * 60 * 60 * 1000).toLocaleDateString() : ''}</div>
          </div>
        ) : null}
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-card-foreground">Upload File</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="border border-border rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              onChange={handleFileChange}
              disabled={uploading || submitting}
            />
            {uploading && (
              <span className="text-xs text-primary animate-pulse ml-2">Uploading... {uploadProgress}%</span>
            )}
          </div>
          <button
            type="submit"
            className="w-full px-8 py-3 mt-4 rounded-md bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90 transition text-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={uploading || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Homework'}
          </button>
        </form>
        {/* File Preview */}
        <div className="flex flex-col gap-4 items-center justify-center min-h-[200px]">
          <h3 className="text-xl font-semibold text-primary mb-2">Uploaded File Preview</h3>
          {file && fileUrl ? (
            <>
              {file.type.startsWith('image/') ? (
                <img src={fileUrl} alt="Preview" className="max-w-full max-h-96 rounded border border-border shadow" />
              ) : file.type === 'application/pdf' ? (
                <div className="w-full flex flex-col items-center">
                  <embed src={fileUrl} type="application/pdf" className="w-full h-[60vh] border rounded" />
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
