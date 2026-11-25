'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { IoPlay, IoTimeOutline, IoFitnessOutline, IoFlameOutline, IoArrowForward } from 'react-icons/io5'
import './HomeBanner2.css'

interface WorkoutCategory {
  type: string
  slug: string
  imageUrl: string
  durationInMin: number
  exercisesCount: number
  intensity: 'Medium' | 'High' | 'Extreme'
  splitCode: string
}

const HomeBanner2 = () => {
  const [categories] = useState<WorkoutCategory[]>([
    {
      type: 'Chest & Triceps',
      slug: 'chest',
      imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
      durationInMin: 45,
      exercisesCount: 5,
      intensity: 'High',
      splitCode: '01 · Push',
    },
    {
      type: 'Back & Posterior Chain',
      slug: 'back',
      imageUrl: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=800&q=80',
      durationInMin: 50,
      exercisesCount: 6,
      intensity: 'High',
      splitCode: '02 · Pull',
    },
    {
      type: 'Core & Trunk Stability',
      slug: 'abs',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
      durationInMin: 25,
      exercisesCount: 4,
      intensity: 'Medium',
      splitCode: '03 · Core',
    },
    {
      type: 'Shoulders & Deltoids',
      slug: 'shoulder',
      imageUrl: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=800&q=80',
      durationInMin: 40,
      exercisesCount: 5,
      intensity: 'High',
      splitCode: '04 · Shoulders',
    },
    {
      type: 'Biceps & Forearms',
      slug: 'biceps',
      imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
      durationInMin: 35,
      exercisesCount: 4,
      intensity: 'Medium',
      splitCode: '05 · Arms',
    },
    {
      type: 'Quads, Hamstrings & Glutes',
      slug: 'legs',
      imageUrl: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=800&q=80',
      durationInMin: 55,
      exercisesCount: 6,
      intensity: 'Extreme',
      splitCode: '06 · Legs',
    },
  ])

  return (
    <section className="workout-categories-section">
      <div className="section-title-row">
        <div>
          <h2 className="section-main-heading">Workout Programs</h2>
          <p className="section-subtitle">
            Guided splits with HD video demonstrations, form cues, and built-in rest timers.
          </p>
        </div>

        <Link href="/workout/chest" className="browse-all-link">
          <span>View all splits</span>
          <IoArrowForward size={14} />
        </Link>
      </div>

      <div className="workout-cards-grid">
        {categories.map((item, index) => (
          <Link
            key={index}
            href={`/workout/${item.slug}`}
            className="workout-program-card"
          >
            <div
              className="card-bg-image"
              style={{ backgroundImage: `url(${item.imageUrl})` }}
            />
            <div className="card-scrim-overlay" />

            <div className="card-top-chips">
              <span className={`intensity-chip ${item.intensity.toLowerCase()}`}>
                <IoFlameOutline size={13} /> {item.intensity}
              </span>
            </div>

            <div className="card-center-action">
              <div className="play-button-circle">
                <IoPlay size={20} className="play-icon" />
              </div>
            </div>

            <div className="card-bottom-info">
              <h3 className="workout-program-name">{item.type}</h3>
              <div className="workout-program-meta">
                <span>
                  <IoTimeOutline size={14} /> {item.durationInMin} min
                </span>
                <span className="meta-dot">•</span>
                <span>
                  <IoFitnessOutline size={14} /> {item.exercisesCount} Movements
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default HomeBanner2
