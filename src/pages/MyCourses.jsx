import { Link } from 'react-router-dom';
import { BookOpen, PlayCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProgressBar from '../components/ProgressBar';
import { getCourseProgress } from '../utils/storage';

export default function MyCourses() {
  const { courses, enrollments } = useApp();

  const enrolledCourses = courses.filter((course) => enrollments[course.id]);

  if (enrolledCourses.length === 0) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="glass-card p-10 md:p-14 text-center">
          <BookOpen size={28} className="mx-auto text-gold-400 mb-4" />
          <h1 className="font-cinzel font-black text-2xl text-gold-400 mb-2">My Courses</h1>
          <p className="text-cream/50 font-crimson max-w-xl mx-auto">
            You have not enrolled in any courses yet. Browse the catalog to start your learning journey.
          </p>
          <Link to="/courses" className="btn-gold inline-flex items-center gap-2 mt-6">
            Explore Courses
            <PlayCircle size={15} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="glass-card p-6 md:p-8">
        <p className="font-cinzel text-gold-400 text-sm tracking-[0.2em] mb-2">STUDENT DASHBOARD</p>
        <h1 className="font-cinzel font-black text-3xl text-cream mb-2">My Courses</h1>
        <p className="text-cream/55 font-crimson">
          Continue from where you left off and keep building steady learning momentum.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {enrolledCourses.map((course) => {
          const progress = getCourseProgress(course);

          return (
            <div key={course.id} className="glass-card overflow-hidden flex flex-col">
              <img src={course.thumbnail} alt={course.title} className="h-48 w-full object-cover" />

              <div className="p-5 space-y-4 flex-1 flex flex-col">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="badge badge-gold text-[10px]">{course.category}</span>
                    <span className="badge badge-emerald text-[10px]">{course.subject}</span>
                  </div>

                  <h2 className="font-cinzel font-bold text-gold-400 text-lg">{course.title}</h2>
                  <p className="text-sm text-cream/55 font-crimson mt-2">{course.description}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-crimson text-cream/50">
                    <span>{course.totalLessons} lessons</span>
                    <span>{progress}% complete</span>
                  </div>
                  <ProgressBar value={progress} showLabel={false} height={5} />
                </div>

                <div className="flex items-center justify-between text-xs font-crimson text-cream/45">
                  <span>{course.instructor}</span>
                  <span>{course.duration}</span>
                </div>

                <Link to={`/course/${course.id}`} state={{ course }} className="btn-gold mt-auto text-center">
                  Continue Course
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
