import { useState, useMemo } from 'react';
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
    select: ''
  });

  // Collect unique studentIds from submissions
  const studentIds = useMemo(() => {
    const ids = new Set<string>();
    submissions.forEach((s: any) => {
      if (s.studentId) ids.add(s.studentId);
    });
    return Array.from(ids);
  }, [submissions]);

  // Fetch student details for all studentIds
  const { data: students = [] } = trpc.users.findAll.useQuery(
    {
      filter: { _id: { $in: studentIds } },
      page: 1,
      limit: 100,
      sort: '-updatedAt',
      select: ''
    },
    { enabled: studentIds.length > 0 }
  );

  // Map studentId to student info
  const studentMap = useMemo(() => {
    const map: Record<string, any> = {};
    students.forEach((stu: any) => {
      map[stu._id] = stu;
    });
    return map;
  }, [students]);

  // Filter submissions by status
  const filteredSubmissions = submissions.filter((s: any) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return s.isCompleted;
    if (filter === 'pending') return !s.isCompleted;
    return true;
  });

  // Fetch homework details
  const { data: homework, isLoading: isHomeworkLoading } = trpc.homework.findById.useQuery(
    {
      id: homeworkId as string,
      select: 'title'
    },
    { enabled: !!homeworkId }
  );

  return (
    <div className="min-h-screen bg-muted px-2 py-8 flex flex-col gap-8 items-center">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-primary mb-2 text-center flex flex-row items-center gap-3 justify-center">
          <span>Homework Submissions</span>
          <span className="text-base font-normal text-white bg-primary/80 rounded px-3 py-1">
            {isHomeworkLoading ? 'Loading homework...' : homework?.title || '-'}
          </span>
        </h1>
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg font-semibold border border-border transition-colors duration-200 text-base focus:outline-none ${
                filter === 'all'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground hover:bg-primary/10'
              }`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-semibold border border-border transition-colors duration-200 text-base focus:outline-none ${
                filter === 'completed'
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-background text-muted-foreground hover:bg-green-100'
              }`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-semibold border border-border transition-colors duration-200 text-base focus:outline-none ${
                filter === 'pending'
                  ? 'bg-yellow-500 text-white border-yellow-500'
                  : 'bg-background text-muted-foreground hover:bg-yellow-100'
              }`}
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
                  <th className="p-2 font-semibold text-white">Student</th>
                  <th className="p-2 font-semibold text-white">Class</th>
                  <th className="p-2 font-semibold text-white">Submission Date</th>
                  <th className="p-2 font-semibold text-white">Status</th>
                  <th className="p-2 font-semibold text-white">In Time</th>
                  <th className="p-2 font-semibold text-white">File</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((sub: any) => {
                  const stu = studentMap[sub.studentId] || {};
                  return (
                    <tr key={sub._id} className="border-b last:border-b-0">
                      <td className="p-2 text-white">{stu.name || 'Unknown'}</td>
                      <td className="p-2 text-white">{stu.class || '-'}</td>
                      <td className="p-2 text-white">
                        {sub.submissionDate ? new Date(sub.submissionDate).toLocaleString() : '-'}
                      </td>
                      <td className="p-2 text-white">
                        {sub.isCompleted ? (
                          <span className="text-green-600 font-semibold">Completed</span>
                        ) : (
                          <span className="text-yellow-600 font-semibold">Pending</span>
                        )}
                      </td>
                      <td className="p-2 text-white">
                        {sub.isCompletedInTime ? (
                          <span className="text-green-600">Yes</span>
                        ) : (
                          <span className="text-red-600">No</span>
                        )}
                      </td>
                      <td className="p-2 text-white">
                        {sub.fileURL ? (
                          <a
                            href={sub.fileURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
