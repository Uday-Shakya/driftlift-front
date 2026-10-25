'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { IoPlayCircle, IoTimeOutline, IoFitnessOutline, IoFlameOutline } from 'react-icons/io5'
import './HomeBanner2.css'

interface WorkoutCategory {
  type: string
  slug: string
  imageUrl: string
  durationInMin: number
  exercisesCount: number
  intensity: 'Medium' | 'High' | 'Extreme'
}

const HomeBanner2 = () => {
  const [categories] = useState<WorkoutCategory[]>([
    {
      type: 'Chest Hypertrophy',
      slug: 'chest',
      imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
      durationInMin: 45,
      exercisesCount: 5,
      intensity: 'High',
    },
    {
      type: 'V-Taper Back',
      slug: 'back',
      imageUrl: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=800&q=80',
      durationInMin: 50,
      exercisesCount: 6,
      intensity: 'High',
    },
    {
      type: 'Core & 6-Pack Abs',
      slug: 'abs',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
      durationInMin: 25,
      exercisesCount: 4,
      intensity: 'Medium',
    },
    {
      type: 'Boulder Shoulders',
      slug: 'shoulder',
      imageUrl: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=800&q=80',
      durationInMin: 40,
      exercisesCount: 5,
      intensity: 'High',
    },
    {
      type: 'Arm Cannon (Biceps)',
      slug: 'biceps',
      imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
      durationInMin: 35,
      exercisesCount: 4,
      intensity: 'Medium',
    },
    {
      type: 'Quads & Glutes (Legs)',
      slug: 'legs',
      imageUrl: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=800&q=80',
      durationInMin: 55,
      exercisesCount: 6,
      intensity: 'Extreme',
    },
  ])

  return (
    <section className="workout-categories-section">
      <div className="section-title-row">
        <div>
          <span className="badge-glow">Video Training Series</span>
          <h2 className="section-main-heading">Targeted Workout Programs</h2>
        </div>
        <p className="section-subtitle">
          Curated training plans with embedded HD video instruction, biomechanical form cues, and live set tracking.
        </p>
      </div>

      <div className="workout-cards-grid">
        {categories.map((item, index) => (
          <Link
            key={index}
            href={`/workout/${item.slug}`}
            className="workout-program-card glass-card"
            style={{ backgroundImage: `url(${item.imageUrl})` }}
          >
            <div className="card-gradient-overlay"></div>

            <div className="workout-card-badge">
              <span className="hd-tag">HD Video</span>
              <span className={`intensity-tag ${item.intensity.toLowerCase()}`}>
                <IoFlameOutline /> {item.intensity}
              </span>
            </div>

            <div className="play-button-overlay">
              <IoPlayCircle size={56} className="play-icon" />
            </div>

            <div className="workout-card-bottom">
              <h3 className="workout-program-name">{item.type}</h3>
              <div className="workout-program-meta">
                <span>
                  <IoTimeOutline /> {item.durationInMin} mins
                </span>
                <span>
                  <IoFitnessOutline /> {item.exercisesCount} Exercises
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