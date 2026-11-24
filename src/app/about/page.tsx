"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./about.module.css";
import teamImage from "@/app/assets/team.jpg";
import Footer from "@/app/components/Footer/Footer";
import {
  IoFitnessOutline,
  IoVideocamOutline,
  IoPeopleOutline,
  IoArrowForward,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircle
} from "react-icons/io5";

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const style: React.CSSProperties = {
    opacity: 0,
    transform: "translateY(20px)",
    transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
  };

  return { ref, style };
}

export default function AboutPage() {
  const heroFade = useFadeIn();
  const statsFade = useFadeIn();
  const storyFade = useFadeIn();
  const valuesFade = useFadeIn();
  const ctaFade = useFadeIn();

  return (
    <div className={styles.page}>
      {/* ── Editorial Hero ── */}
      <section className={styles.hero} ref={heroFade.ref} style={heroFade.style}>
        <div className={styles.heroText}>
          <div className={styles.statusPill}>
            <span className={styles.dot} />
            <span>ORIGIN & ATHLETIC MANIFESTO</span>
          </div>

          <h1 className={styles.heroTitle}>
            Built for athletes who reject guesswork.
          </h1>

          <p className={styles.heroParagraph}>
            DriftLift was engineered to solve a fundamental breakdown in modern fitness: the gap between
            exercise science, computer vision, and real-world weightroom execution.
          </p>
        </div>

        <div className={styles.heroImageWrap}>
          <Image
            src={teamImage}
            alt="The DriftLift Engineering & Coaching Team"
            fill
            sizes="(max-width: 860px) 100vw, 50vw"
            className={styles.heroImage}
            priority
          />
          <div className={styles.heroImageBorder} />
        </div>
      </section>

      {/* ── Stat Metric Strip ── */}
      <div className={styles.statContainer} ref={statsFade.ref} style={statsFade.style}>
        <div className={styles.statStrip}>
          {[
            { number: "33 Points", label: "Optical Joint Landmarks", sub: "MediaPipe 3D pipeline" },
            { number: "14 Splits", label: "Recovery Topography", sub: "DOMS volume load tracking" },
            { number: "0 Latency", label: "Local-First Persistence", sub: "Offline IndexedDB engine" },
            { number: "100%", label: "Biomechanical Rigor", sub: "Grounded in exercise literature" },
          ].map((stat) => (
            <div key={stat.label} className={styles.statBlock}>
              <div className={styles.statNumber}>{stat.number}</div>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statSub}>{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Narrative Story ── */}
      <section
        className={styles.storySection}
        ref={storyFade.ref}
        style={storyFade.style}
      >
        <div className={styles.storyColumn}>
          <span className={styles.sectionLabel}>THE FRUSTRATION</span>
          <h2 className={styles.storyHeading}>
            Fitness tools became toy trackers, not athletic instruments.
          </h2>
          <p className={styles.storyParagraph}>
            Most fitness applications are either generic calorie counters or social feed clones.
            They track whether you opened the app, but they have zero understanding of whether your knees caved on rep 4
            or whether your eccentric tempo was controlled.
          </p>
          <p className={styles.storyParagraph}>
            Real physical transformation requires telemetry: joint angle kinematics, accurate macro decomposition,
            and honest recovery mapping. We built DriftLift to deliver the precision of an Olympic training lab
            straight to your pocket.
          </p>
        </div>

        <div className={styles.storyColumn}>
          <span className={styles.sectionLabel}>OUR ARCHITECTURE</span>
          <h2 className={styles.storyHeading}>
            Technology that lives in the background of your workout.
          </h2>
          <p className={styles.storyParagraph}>
            You should never have to fight your phone while holding a 100kg barbell. DriftLift runs on-device
            neural computer vision for automatic rep counting, speaks tempo cues through your headphones,
            and operates completely offline in basement gyms.
          </p>
          <p className={styles.storyParagraph}>
            Every feature we ship is tested under real load by competitive powerlifters, bodybuilders,
            and endurance athletes before reaching production.
          </p>
        </div>
      </section>

      {/* ── Principles ── */}
      <section
        className={styles.valuesSection}
        ref={valuesFade.ref}
        style={valuesFade.style}
      >
        <div className={styles.valuesHeader}>
          <span className={styles.sectionLabel}>CORE PRINCIPLES</span>
          <h2 className={styles.valuesTitle}>Standards over marketing slogans.</h2>
        </div>

        <div className={styles.valuesGrid}>
          <div className={styles.valueCard}>
            <div className={styles.valueIconBox}>
              <IoFitnessOutline size={22} className={styles.emerald} />
            </div>
            <h3 className={styles.valueCardTitle}>Kinematic Safety First</h3>
            <p className={styles.valueCardText}>
              Every optical cue and tutorial reinforces joint longevity. We never gamify dangerous personal records
              at the expense of spinal integrity. Longevity always beats a highlight reel.
            </p>
          </div>

          <div className={styles.valueCard}>
            <div className={styles.valueIconBox}>
              <IoVideocamOutline size={22} className={styles.cyan} />
            </div>
            <h3 className={styles.valueCardTitle}>Uncompromised Accuracy</h3>
            <p className={styles.valueCardText}>
              Our nutritional and biometric calculations are grounded in peer-reviewed Mifflin-St Jeor and TDEE formulas.
              We don&apos;t inflate burned calories to make you feel comfortable.
            </p>
          </div>

          <div className={styles.valueCard}>
            <div className={styles.valueIconBox}>
              <IoPeopleOutline size={22} className={styles.amber} />
            </div>
            <h3 className={styles.valueCardTitle}>Synchronized Training</h3>
            <p className={styles.valueCardText}>
              Training alone is hard; training together builds consistency. Our multiplayer squad rooms provide
              real-time rest timer synchronization and live set telemetry with zero friction.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section
        className={styles.ctaBanner}
        ref={ctaFade.ref}
        style={ctaFade.style}
      >
        <div className={styles.ctaInner}>
          <span className={styles.ctaBadge}>JOIN THE DRIFTLIFT SQUAD</span>
          <h2 className={styles.ctaTitle}>Ready to train with real telemetry?</h2>
          <p className={styles.ctaText}>
            Sign up in 30 seconds for immediate access to optical rep counting, multimodal meal logging,
            and 3D recovery topographies.
          </p>
          <div className={styles.ctaActionGroup}>
            <Link href="/signup" className="btn-primary">
              <span>Create Athlete Account</span>
              <IoArrowForward size={15} />
            </Link>
            <Link href="/" className="btn-secondary">
              <span>Explore Dashboard</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
