"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import './workoutPage.css';

interface Exercise {
  exercise: string;
  videoUrl: string;
  sets: number;
  reps: number;
  rest: number;
  description: string;
}

interface Workout {
  type: string;
  exercises: Exercise[];
}

const WorkoutPage = () => {
  const { type } = useParams(); // Fetch workout type from URL
  const [workout, setWorkout] = React.useState<Workout | null>(null);

  // Function to fetch workout based on type
  const getWorkout = async (workoutType: string) => {
    // Sample data for different workout types
    const workoutsData: Record<string, Workout> = {
      chest: {
        type: 'Chest',
        exercises: [
          {
            exercise: 'Flat Bench Press',
            videoUrl: 'https://gymvisual.com/img/p/1/7/5/5/2/17552.gif',
            sets: 3,
            reps: 10,
            rest: 60,
            description: 'Effective chest workout targeting the pectoral muscles.',
          },
          {
            exercise: 'Incline Bench Press',
            videoUrl: 'https://gymvisual.com/img/p/1/0/3/9/8/10398.gif',
            sets: 3,
            reps: 10,
            rest: 60,
            description: 'Builds upper chest muscles, improving overall definition.',
          },
        ],
      },
      abs: {
        type: 'Abs',
        exercises: [
          {
            exercise: 'Crunches',
            videoUrl: 'https://gymvisual.com/img/p/5/2/4/3/5243.gif',
            sets: 4,
            reps: 15,
            rest: 30,
            description: 'Targets the upper abdominal muscles for core strengthening.',
          },
          {
            exercise: 'Leg Raises',
            videoUrl: 'https://gymvisual.com/img/p/2/2/8/8/7/22887.gif',
            sets: 3,
            reps: 12,
            rest: 30,
            description: 'Engages lower abs and helps build core stability.',
          },
          {
            exercise: 'Plank',
            videoUrl: 'https://gymvisual.com/22070-large_default/front-plank-with-leg-lift-male.jpg',
            sets: 3,
            reps: 1,
            rest: 60,
            description: 'Core exercise for overall stability. Hold for 60 seconds.',
          },
        ],
      },
      shoulder: {
        type: 'Shoulder',
        exercises: [
          {
            exercise: 'Overhead Press',
            videoUrl: 'https://gymvisual.com/img/p/5/1/6/7/5167.gif',
            sets: 3,
            reps: 12,
            rest: 60,
            description: 'A classic shoulder exercise for building mass.',
          },
          {
            exercise: 'Lateral Raise',
            videoUrl: 'https://gymvisual.com/img/p/5/0/4/4/5044.gif',
            sets: 3,
            reps: 15,
            rest: 30,
            description: 'Target the middle deltoids for better shoulder definition.',
          },
        ],
      },
      back: {
        type: 'Back',
        exercises: [
          {
            exercise: 'Deadlift',
            videoUrl: 'https://gymvisual.com/img/p/2/0/8/3/1/20831.gif',
            sets: 4,
            reps: 8,
            rest: 90,
            description: 'A compound movement that targets the back and hamstrings.',
          },
          {
            exercise: 'Pull-Up',
            videoUrl: 'https://gymvisual.com/img/p/1/2/4/4/9/12449.gif',
            sets: 4,
            reps: 10,
            rest: 60,
            description: 'Focuses on the upper back muscles, including lats.',
          },
        ],
      },
      biceps: {
        type: 'Biceps',
        exercises: [
          {
            exercise: 'Bicep Curl',
            videoUrl: 'https://gymvisual.com/img/p/5/0/1/8/5018.gif',
            sets: 4,
            reps: 12,
            rest: 45,
            description: 'Classic movement for targeting the biceps.',
          },
          {
            exercise: 'Hammer Curl',
            videoUrl: 'https://gymvisual.com/img/p/2/7/3/4/0/27340.gif',
            sets: 3,
            reps: 12,
            rest: 45,
            description: 'Works the brachialis and brachioradialis muscles.',
          },
        ],
      },
      triceps: {
        type: 'Triceps',
        exercises: [
          {
            exercise: 'Tricep Dips',
            videoUrl: 'https://gymvisual.com/img/p/1/3/1/3/6/13136.gif',
            sets: 3,
            reps: 10,
            rest: 60,
            description: 'Targets the triceps and chest.',
          },
          {
            exercise: 'Skull Crushers',
            videoUrl: 'https://gymvisual.com/img/p/1/8/6/1/1/18611.gif',
            sets: 4,
            reps: 12,
            rest: 45,
            description: 'Focuses on the long head of the triceps.',
          },
        ],
      },
      legs: {
        type: 'Legs',
        exercises: [
          {
            exercise: 'Squat',
            videoUrl: 'https://gymvisual.com/img/p/2/8/1/6/0/28160.gif',
            sets: 4,
            reps: 10,
            rest: 90,
            description: 'A compound movement that targets the quads, hamstrings, and glutes.',
          },
          {
            exercise: 'Leg Press',
            videoUrl: 'https://gymvisual.com/img/p/3/4/8/2/3/34823.gif',
            sets: 4,
            reps: 12,
            rest: 60,
            description: 'Great for developing overall leg strength.',
          },
        ],
      },
      cardio: {
        type: 'Cardio',
        exercises: [
          {
            exercise: 'Running',
            videoUrl: 'https://cdn.dribbble.com/users/6390322/screenshots/18443124/media/6eb6e40b05940bb82a35830650847dc5.gif',
            sets: 1,
            reps: 1,
            rest: 0,
            description: 'Improve cardiovascular health through running.',
          },
          {
            exercise: 'Jump Rope',
            videoUrl: 'https://burnfit.io/wp-content/uploads/2023/11/JUMP_ROPE.gif',
            sets: 4,
            reps: 1,
            rest: 30,
            description: 'Boost cardiovascular endurance and coordination.',
          },
        ],
      },
      forearms: {
        type: 'Forearms',
        exercises: [
          {
            exercise: 'Wrist Curl',
            videoUrl: 'https://gymvisual.com/img/p/2/0/3/4/8/20348.gif',
            sets: 4,
            reps: 15,
            rest: 30,
            description: 'Targets the flexor muscles of the forearms.',
          },
          {
            exercise: 'Reverse Wrist Curl',
            videoUrl: 'https://gymvisual.com/img/p/1/8/6/9/1/18691.gif',
            sets: 3,
            reps: 12,
            rest: 30,
            description: 'Works the extensors in the forearms.',
          },
        ],
      },
    };

    // Fetch workout data based on type, default to chest if not found
    const selectedWorkout = workoutsData[workoutType.toLowerCase()] || workoutsData['chest'];
    setWorkout(selectedWorkout);
  };

  React.useEffect(() => {
    if (type) {
      getWorkout(type); // Fetch based on URL parameter
    }
  }, [type]);

  return (
    <div className="workout">
      <h1 className="mainhead1">{workout?.type} Day</h1>
      <div className="workout__exercises">
        {workout?.exercises.map((item: Exercise, index: number) => (
          <div
            key={index}
            className={
              index % 2 === 0
                ? 'workout__exercise'
                : 'workout__exercise workout__exercise--reverse'
            }
          >
            <h3>{index + 1}</h3>
            <div className="workout__exercise__image">
              <img src={item.videoUrl} alt={item.exercise} />
            </div>
            <div className="workout__exercise__content">
              <h2>{item.exercise}</h2>
              <span>
                {item.sets} sets X {item.reps} reps
              </span>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutPage;
