import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserId } from '../utils/auth';
import { trpc } from '../utils/trpc';

const CLASS_ENUM = ['8th', '9th', '10th'];
const SUBJECT_ENUM = ['English', 'Math', 'Science', 'Social'];

export default function AdminDashboard() {
  const [selectedClass, setSelectedClass] = useState(CLASS_ENUM[0]);
  const [selectedSubject, setSelectedSubject] = useState(SUBJECT_ENUM[0]);
  const navigate = useNavigate();

  // Use getUserId from auth utils
  const adminId = getUserId();

  // Fetch students, homeworks, and submissions from trpc
  const { data: students = [], isLoading: studentsLoading } = trpc.users.findAll.useQuery({
    filter: { class: selectedClass, role: 'student' },
    page: 1,
    limit: 100,
    sort: 'updatedAt',
    select: ''
  });
  const { data: homeworks = [], isLoading: homeworksLoading } = trpc.homework.findAll.useQuery({
    filter: { class: selectedClass, subject: selectedSubject, assignedBy: adminId || undefined },
    page: 1,
    limit: 100,
    sort: 'updatedAt',
    select: ''
  });
  const { data: submissions = [], isLoading: submissionsLoading } = trpc.submission.findAll.useQuery(
    {
      filter: { homeworkId: { $in: homeworks.map((h) => h._id) } },
      page: 1,
      limit: 100,
      sort: 'updatedAt',
      select: ''
    },
    {
      enabled: homeworks.length > 0
    }
  );

  // Filter submissions for current class/subject
  const homeworksForClassSubject = homeworks;
  const studentsInClass = students;
  const submissionsForClassSubject = submissions.filter((s) =>
    homeworksForClassSubject.find((h) => h._id === s.homeworkId)
  );

  return (
    <div className="min-h-screen bg-muted px-2 py-4 flex flex-col gap-8">
      {/* Class & Subject Tabs Combined */}
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-4 mb-4">
        {/* Class Selector */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-muted-foreground mb-1">Class</label>
          <div className="flex gap-2">
            {CLASS_ENUM.map((cls) => (
              <button
                key={cls}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 text-base md:text-lg focus:outline-none border border-border ${
                  cls === selectedClass
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground hover:bg-primary/10'
                }`}
                onClick={() => {
                  setSelectedClass(cls);
                  setSelectedSubject(SUBJECT_ENUM[0]);
                }}
                type="button"
              >
                {cls}
              </button>
            ))}
          </div>
        </div>
        {/* Subject Selector */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-muted-foreground mb-1">Subject</label>
          <div className="flex gap-2 flex-wrap">
            {SUBJECT_ENUM.map((subj) => (
              <button
                key={subj}
                className={`px-3 py-1 rounded-lg font-medium transition-colors duration-200 text-base md:text-lg focus:outline-none border border-border ${
                  subj === selectedSubject
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground hover:bg-primary/10'
                }`}
                onClick={() => setSelectedSubject(subj)}
                type="button"
              >
                {subj}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-5xl mx-auto mb-4">
        <div className="bg-background shadow rounded-lg p-6 flex flex-col items-center border border-border">
          <span className="text-2xl font-bold text-blue-600">{studentsLoading ? '...' : studentsInClass.length}</span>
          <span className="text-muted-foreground mt-2">Students</span>
        </div>
        <div className="bg-background shadow rounded-lg p-6 flex flex-col items-center border border-border">
          <span className="text-2xl font-bold text-green-600">
            {homeworksLoading ? '...' : homeworksForClassSubject.length}
          </span>
          <span className="text-muted-foreground mt-2">Homeworks</span>
        </div>
        <div className="bg-background shadow rounded-lg p-6 flex flex-col items-center border border-border">
          <span className="text-2xl font-bold text-purple-600">
            {submissionsLoading ? '...' : submissionsForClassSubject.length}
          </span>
          <span className="text-muted-foreground mt-2">Submissions</span>
        </div>
      </div>
      {/* Recent Homeworks */}
      <div className="w-full max-w-5xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-card-foreground">Recent Homeworks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {homeworksLoading ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : homeworksForClassSubject.length === 0 ? (
            <div className="text-muted-foreground">No homeworks for this class/subject.</div>
          ) : (
            homeworksForClassSubject.map((hw, idx) => (
              <div
                key={hw._id || hw.title + idx}
                className="bg-background shadow rounded-lg p-4 flex flex-col gap-2 border border-border"
              >
                <span className="font-bold text-lg text-card-foreground">{hw.title}</span>
                <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                  <span className="text-blue-700 bg-blue-100 rounded px-2 py-1 w-fit">
                    Assign: {new Date(hw.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-rose-700 bg-rose-100 rounded px-2 py-1 w-fit">
                    Due:{' '}
                    {hw.dueDate
                      ? hw.dueDate
                      : hw.assignDate
                      ? new Date(
                          new Date(hw.assignDate).getTime() + (hw.daysToComplete || 0) * 24 * 60 * 60 * 1000
                        ).toLocaleDateString()
                      : ''}
                  </span>
                </div>
                <span className="text-gray-500 text-sm">{hw.description}</span>
                <span className="text-xs text-gray-400 mt-1">
                  <Link
                    to={hw.submissionURL}
                    className="inline-block px-3 py-1 rounded bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90 transition text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    View File
                  </Link>
                </span>
                <button
                  className="self-end text-blue-600 hover:underline text-sm mt-2"
                  onClick={() => {
                    if (hw._id) {
                      navigate(`/submissions/${hw._id}`)
                    }
                  }}
                >
                  View Submissions
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
