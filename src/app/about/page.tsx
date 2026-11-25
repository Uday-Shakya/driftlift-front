"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./about.module.css";
import teamImage from "@/app/assets/team.jpg";
import Footer from "@/app/components/Footer/Footer";
import { toast } from "react-toastify";
import {
  IoFitnessOutline,
  IoVideocamOutline,
  IoPeopleOutline,
  IoMailOutline,
  IoCallOutline,
  IoLocationOutline,
  IoSendOutline,
  IoCheckmarkCircleOutline,
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
  const contactFade = useFadeIn();

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactTopic, setContactTopic] = useState("general");
  const [contactMessage, setContactMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      toast.warn("Please fill in your name, email, and message.");
      return;
    }
    setSubmitted(true);
    toast.success("Message sent. We'll get back to you shortly.");
    setContactName("");
    setContactEmail("");
    setContactTopic("general");
    setContactMessage("");
  };

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

      {/* ── Contact Form ────────────────────────────────── */}
      <section
        id="contact"
        className={styles.contactSection}
        ref={contactFade.ref}
        style={contactFade.style}
      >
        <div className={styles.contactCard}>
          <div className={styles.contactInfo}>
            <span className={styles.sectionLabel}>Contact</span>
            <h2 className={styles.contactTitle}>Get in touch</h2>
            <p className={styles.contactText}>
              Have a question about form tracking, team accounts, or feedback on a workout program?
              Send us a message and we&apos;ll respond directly.
            </p>

            <div className={styles.contactDetails}>
              <a href="mailto:udayshak8962@gmail.com" className={styles.contactDetailRow}>
                <IoMailOutline size={18} />
                <span>udayshak8962@gmail.com</span>
              </a>
              <div className={styles.contactDetailRow}>
                <IoCallOutline size={18} />
                <span>+91 7970240476</span>
              </div>
              <div className={styles.contactDetailRow}>
                <IoLocationOutline size={18} />
                <span>Global Kinetic Lab</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleContactSubmit} className={styles.contactForm}>
            {submitted && (
              <div className={styles.contactSuccess}>
                <IoCheckmarkCircleOutline size={18} />
                <span>Thanks for reaching out—your message has been received.</span>
              </div>
            )}

            <div className={styles.formRow}>
              <div className={styles.fieldGroup}>
                <label htmlFor="contact-name">Name</label>
                <input
                  id="contact-name"
                  type="text"
                  className="input-field"
                  placeholder="Alex Mercer"
                  value={contactName}
                  onChange={(e) => {
                    setContactName(e.target.value);
                    if (submitted) setSubmitted(false);
                  }}
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="contact-email">Email</label>
                <input
                  id="contact-email"
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={contactEmail}
                  onChange={(e) => {
                    setContactEmail(e.target.value);
                    if (submitted) setSubmitted(false);
                  }}
                  required
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="contact-topic">Topic</label>
              <select
                id="contact-topic"
                className="select-field"
                value={contactTopic}
                onChange={(e) => setContactTopic(e.target.value)}
              >
                <option value="general">General Question</option>
                <option value="coaching">Vision Coach &amp; Form Feedback</option>
                <option value="bug">Bug Report</option>
                <option value="partnership">Coaching / Gym Partnership</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                rows={4}
                className={styles.textareaField}
                placeholder="Tell us how we can help..."
                value={contactMessage}
                onChange={(e) => {
                  setContactMessage(e.target.value);
                  if (submitted) setSubmitted(false);
                }}
                required
              />
            </div>

            <button type="submit" className="btn-primary">
              <span>Send Message</span>
              <IoSendOutline size={15} />
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
