import { useState } from 'react';
import { trpc } from '../utils/trpc';
import { useParams } from 'react-router-dom';

export default function HomeworkSubmissionsPage() {
  const { homeworkId } = useParams<{ homeworkId: string }>();
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  // Fetch all submissions for this homework
  const { data: submissions = [], isLoading } = trpc.submission.findAll.useQuery({
    filter: { homeworkId },
    page: 1,
    limit: 100,
    sort: 'submissionDate',
    select: '',
  });

  // Filter submissions by status
  const filteredSubmissions = submissions.filter((s: any) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return s.isCompleted;
    if (filter === 'pending') return !s.isCompleted;
    return true;
  });

  return (
    <div className="min-h-screen bg-muted px-2 py-8 flex flex-col gap-8 items-center">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-primary mb-2 text-center">Homework Submissions</h1>
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg font-semibold border border-border transition-colors duration-200 text-base focus:outline-none ${filter === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground hover:bg-primary/10'}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-semibold border border-border transition-colors duration-200 text-base focus:outline-none ${filter === 'completed' ? 'bg-green-600 text-white border-green-600' : 'bg-background text-muted-foreground hover:bg-green-100'}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-semibold border border-border transition-colors duration-200 text-base focus:outline-none ${filter === 'pending' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-background text-muted-foreground hover:bg-yellow-100'}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
          </div>
          <span className="text-muted-foreground text-sm">Total: {filteredSubmissions.length}</span>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-lg p-6 flex flex-col gap-4">
          {isLoading ? (
            <div className="text-muted-foreground text-center">Loading submissions...</div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-muted-foreground text-center">No submissions found.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 font-semibold text-card-foreground">Student</th>
                  <th className="p-2 font-semibold text-card-foreground">Submission Date</th>
                  <th className="p-2 font-semibold text-card-foreground">Status</th>
                  <th className="p-2 font-semibold text-card-foreground">File</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((sub: any) => (
                  <tr key={sub._id} className="border-b border-border hover:bg-muted/50 transition">
                    <td className="p-2">{sub.studentId?.name || sub.studentId || '-'}</td>
                    <td className="p-2">{sub.submissionDate ? new Date(sub.submissionDate).toLocaleDateString() : '-'}</td>
                    <td className="p-2">
                      {sub.isCompleted ? (
                        <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">Completed</span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">Pending</span>
                      )}
                    </td>
                    <td className="p-2">
                      {sub.fileURL ? (
                        <a href={sub.fileURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">View File</a>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
