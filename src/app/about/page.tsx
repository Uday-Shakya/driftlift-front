"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./About.module.css";
import teamImage from "@/app/assets/team.jpg";
import Footer from "@/app/components/Footer/Footer";
import {
  IoFitnessOutline,
  IoVideocamOutline,
  IoPeopleOutline,
  IoArrowForward,
} from "react-icons/io5";

// ── Fade-in on scroll ────────────────────────────────────
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
    transform: "translateY(24px)",
    transition: "opacity 0.7s ease, transform 0.7s ease",
  };

  return { ref, style };
}

// ── Component ────────────────────────────────────────────
export default function AboutPage() {
  const heroFade = useFadeIn();
  const statsFade = useFadeIn();
  const storyFade = useFadeIn();
  const valuesFade = useFadeIn();
  const ctaFade = useFadeIn();

  return (
    <div className={styles.page}>
      {/* ── Hero ──────────────────────────────────────── */}
      <section className={styles.hero} ref={heroFade.ref} style={heroFade.style}>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>About DriftLift</span>
          <h1 className={styles.heroTitle}>
            Built for people who <em>actually</em> train.
          </h1>
          <p className={styles.heroParagraph}>
            DriftLift combines HD form tutorials, AI-powered vision coaching,
            and real-time biometric tracking into one platform — designed by
            athletes, for athletes.
          </p>
        </div>

        <div className={styles.heroImageWrap}>
          <Image
            src={teamImage}
            alt="The DriftLift team"
            fill
            sizes="(max-width: 860px) 100vw, 50vw"
            className={styles.heroImage}
            priority
          />
          <div className={styles.heroImageOverlay} />
        </div>
      </section>

      {/* ── Divider ───────────────────────────────────── */}
      <div className={styles.divider}>
        <div className={styles.dividerLine} />
      </div>

      {/* ── Stats ─────────────────────────────────────── */}
      <section
        className={styles.statStrip}
        ref={statsFade.ref}
        style={statsFade.style}
      >
        {[
          { number: "5K+", label: "Active Athletes" },
          { number: "200+", label: "HD Tutorials" },
          { number: "50+", label: "Live Sessions / mo" },
          { number: "98%", label: "Satisfaction Rate" },
        ].map((stat) => (
          <div key={stat.label} className={styles.statBlock}>
            <div className={styles.statNumber}>{stat.number}</div>
            <div className={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </section>

      {/* ── Divider ───────────────────────────────────── */}
      <div className={styles.divider}>
        <div className={styles.dividerLine} />
      </div>

      {/* ── Story ─────────────────────────────────────── */}
      <section
        className={styles.storySection}
        ref={storyFade.ref}
        style={storyFade.style}
      >
        <div className={styles.storyColumn}>
          <span className={styles.sectionLabel}>Our Story</span>
          <h2 className={styles.storyHeading}>
            We got tired of fragmented fitness tools.
          </h2>
          <p className={styles.storyParagraph}>
            Most fitness platforms give you one thing — a library of videos, a
            calorie counter, or a workout timer. But real training doesn&apos;t
            work in silos. You need to see your form, track your volume, and
            adapt your program — all in one place.
          </p>
          <p className={styles.storyParagraph}>
            DriftLift was born from that frustration. We built a platform where
            every rep matters: AI vision tracks your movement in real-time, a 3D
            anatomical heatmap shows exactly which muscles you&apos;re working,
            and HD tutorials teach you proper form before you ever touch a
            barbell.
          </p>
        </div>

        <div className={styles.storyColumn}>
          <span className={styles.sectionLabel}>Our Approach</span>
          <h2 className={styles.storyHeading}>
            Technology that stays out of your way.
          </h2>
          <p className={styles.storyParagraph}>
            We believe the best tools are invisible. You shouldn&apos;t need to
            wrestle with an interface when you&apos;re mid-set. That&apos;s why
            DriftLift uses your phone&apos;s camera for AI rep counting, sends
            bite-sized progress summaries, and keeps the UI stripped back to what
            matters.
          </p>
          <p className={styles.storyParagraph}>
            Our engineering team ships weekly. Every feature starts as a
            hypothesis, gets tested by real athletes, and only ships when
            it&apos;s genuinely useful — not just impressive in a demo.
          </p>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────── */}
      <section
        className={styles.valuesSection}
        ref={valuesFade.ref}
        style={valuesFade.style}
      >
        <div className={styles.valuesHeader}>
          <span className={styles.sectionLabel}>What We Stand For</span>
          <h2 className={styles.valuesTitle}>Principles, not slogans.</h2>
        </div>

        <div className={styles.valuesGrid}>
          <div className={styles.valueCard}>
            <div className={styles.valueIconGreen}>
              <IoFitnessOutline />
            </div>
            <h3 className={styles.valueCardTitle}>Form Over Ego</h3>
            <p className={styles.valueCardText}>
              Every tutorial and AI feedback loop reinforces technique first. We
              don&apos;t gamify PRs at the expense of safety — because longevity
              beats a highlight reel.
            </p>
          </div>

          <div className={styles.valueCard}>
            <div className={styles.valueIconCyan}>
              <IoVideocamOutline />
            </div>
            <h3 className={styles.valueCardTitle}>Honest Progress</h3>
            <p className={styles.valueCardText}>
              Our tracking doesn&apos;t inflate numbers to make you feel good. BMR
              calculations, calorie estimates, and volume metrics are grounded in
              exercise-science literature.
            </p>
          </div>

          <div className={styles.valueCard}>
            <div className={styles.valueIconAmber}>
              <IoPeopleOutline />
            </div>
            <h3 className={styles.valueCardTitle}>Open Community</h3>
            <p className={styles.valueCardText}>
              Live sessions are peer-driven. Coaches give form checks, athletes
              share routines, and nobody gets paywalled out of the fundamentals.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section
        className={styles.ctaBanner}
        ref={ctaFade.ref}
        style={ctaFade.style}
      >
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Ready to train smarter?</h2>
          <p className={styles.ctaText}>
            Create a free account and get instant access to HD tutorials, the AI
            vision coach, and the 3D muscle heatmap.
          </p>
          <Link href="/signup" className={styles.ctaButton}>
            Get Started <IoArrowForward />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
