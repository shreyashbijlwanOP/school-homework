import { getAuthInfo } from '@/utils/auth';
import React, { useState } from 'react';
import { trpc } from '../utils/trpc';
import { useNavigate } from 'react-router-dom';

const SUBJECT_ENUM = ['English', 'Math', 'Science', 'Social'];

const HomeworkPage: React.FC = () => {
  const studentClass = getAuthInfo().user.class;

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'not_submitted'>('all');
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'English' | 'Math' | 'Science' | 'Social'>('all');
  const userId = getAuthInfo().user.id;
  const navigate = useNavigate();

  // Fetch homeworks for the student's class and selected subject (server-side filter)
  const { data: homeworks = [], isLoading } = trpc.homework.findAll.useQuery({
    filter: {
      class: studentClass,
      ...(subjectFilter !== 'all' ? { subject: subjectFilter } : {})
    },
    page: 1,
    limit: 100,
    sort: 'updatedAt',
    select: ''
  });

  // Fetch all submissions for this user and these homeworks
  const homeworkIds = (homeworks as any[]).map((hw) => hw._id);
  const { data: submissions = [], isLoading: submissionsLoading } = trpc.submission.findAll.useQuery(
    {
      filter: { homeworkId: { $in: homeworkIds }, studentId: userId },
      page: 1,
      limit: 100,
      sort: 'submissionDate',
      select: ''
    },
    { enabled: homeworkIds.length > 0 }
  );

  // Map homeworkId to submission
  const submissionMap = React.useMemo(() => {
    const map: Record<string, any> = {};
    (submissions as any[]).forEach((sub) => {
      map[sub.homeworkId] = sub;
    });
    return map;
  }, [submissions]);

  // Filter homeworks by submission status
  const filteredHomeworks = React.useMemo(() => {
    if (filter === 'all') return homeworks;
    if (filter === 'submitted') return (homeworks as any[]).filter((hw) => submissionMap[hw._id]);
    if (filter === 'not_submitted') return (homeworks as any[]).filter((hw) => !submissionMap[hw._id]);
    return homeworks;
  }, [homeworks, filter, submissionMap]);

  return (
    <div className="min-h-screen bg-muted px-2 py-8 flex flex-col gap-8 items-center">
      <div className="w-full max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-4 text-center">My Homework</h1>
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <div className="flex items-center gap-2 max-md:overflow-y-scroll hide-scrollbar">
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded-lg font-semibold border border-border transition-colors duration-200 text-base focus:outline-none ${
                  subjectFilter === 'all'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground hover:bg-primary/10'
                }`}
                onClick={() => setSubjectFilter('all')}
              >
                All
              </button>
              {SUBJECT_ENUM.map((subject) => (
                <button
                  key={subject}
                  className={`px-4 py-2 rounded-lg font-semibold border border-border transition-colors duration-200 text-base focus:outline-none ${
                    subjectFilter === subject
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground hover:bg-primary/10'
                  }`}
                  onClick={() => setSubjectFilter(subject as any)}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>
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
                filter === 'submitted'
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-background text-muted-foreground hover:bg-green-100'
              }`}
              onClick={() => setFilter('submitted')}
            >
              Submitted
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-semibold border border-border transition-colors duration-200 text-base focus:outline-none ${
                filter === 'not_submitted'
                  ? 'bg-yellow-500 text-white border-yellow-500'
                  : 'bg-background text-muted-foreground hover:bg-yellow-100'
              }`}
              onClick={() => setFilter('not_submitted')}
            >
              Not Submitted
            </button>
          </div>
        </div>
        {isLoading || submissionsLoading ? (
          <div className="bg-card border border-border rounded-xl shadow-lg p-6 text-muted-foreground text-center">
            Loading...
          </div>
        ) : filteredHomeworks.length === 0 ? (
          <div className="bg-card border border-border rounded-xl shadow-lg p-6 text-muted-foreground text-center">
            No homework found.
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredHomeworks.map((hw: any) => {
              const submission = submissionMap[hw._id];
              return (
                <li
                  key={hw._id}
                  className="bg-card shadow rounded-xl p-5 flex flex-col gap-2 border border-border relative"
                >
                  {/* 3-dot menu button, only if not submitted */}
                  {!submission && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="relative">
                        <button
                          className="p-1 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                          aria-label="More options"
                          onClick={e => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === hw._id ? null : hw._id);
                          }}
                        >
                          <svg
                            width="20"
                            height="20"
                            fill="currentColor"
                            className="text-muted-foreground"
                            viewBox="0 0 20 20"
                          >
                            <circle cx="4" cy="10" r="1.5" />
                            <circle cx="10" cy="10" r="1.5" />
                            <circle cx="16" cy="10" r="1.5" />
                          </svg>
                        </button>
                        {openDropdownId === hw._id && (
                          <div
                            className="absolute right-0 mt-2 w-40 bg-white border border-border rounded shadow-lg z-20"
                            tabIndex={-1}
                            style={{ color: '#222' }}
                            onClick={e => e.stopPropagation()}
                          >
                            <button
                              className="w-full text-left px-4 py-2 text-sm bg-muted focus:bg-muted text-card-foreground"
                              onClick={e => {
                                e.stopPropagation();
                                setOpenDropdownId(null);
                                setTimeout(() => {
                                  navigate(`/student/submit-homework/${hw._id}`);
                                }, 0);
                              }}
                            >
                              Submit Homework
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <span className="font-bold text-lg text-card-foreground">{hw.title}</span>
                  <div className="flex flex-col gap-1 text-sm font-medium">
                    <span className="text-blue-700 bg-blue-100 rounded px-2 py-1 w-fit">
                      Assign: {hw.assignDate ? new Date(hw.assignDate).toLocaleDateString() : '-'}
                    </span>
                    <span className="text-rose-700 bg-rose-100 rounded px-2 py-1 w-fit">
                      Due:{' '}
                      {hw.dueDate
                        ? new Date(hw.dueDate).toLocaleDateString()
                        : hw.assignDate
                        ? new Date(
                            new Date(hw.assignDate).getTime() + (hw.daysToComplete || 0) * 24 * 60 * 60 * 1000
                          ).toLocaleDateString()
                        : ''}
                    </span>
                  </div>
                  <span className="text-gray-500 text-sm line-clamp-3">{hw.description}</span>
                  <span className="text-xs text-gray-400 mt-1">
                    <a
                      href={hw.submissionURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-3 py-1 rounded bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90 transition text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      View File
                    </a>
                    {submission && submission.fileURL && (
                      <a
                        href={submission.fileURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-3 py-1 ml-2 rounded bg-green-600 text-white font-semibold shadow-sm hover:bg-green-700 transition text-xs focus:outline-none focus:ring-2 focus:ring-green-600"
                      >
                        View Submission
                      </a>
                    )}
                  </span>
                  {/* Submission status */}
                  <span className={`text-xs font-semibold mt-2 ${submission ? 'text-green-600' : 'text-yellow-600'}`}>
                    {submission ? 'Submitted' : 'Not Submitted'}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HomeworkPage;
