"use client";
import React from "react";
import styles from "./About.module.css";
import Image from "next/image";
import teamImage from "@/app/assets/team.jpg";

const About = () => {
  return (
    <div className={styles.aboutContainer}>
      <h1 className={styles.heading}>About Us</h1>
      <div className={styles.content}>
        <Image
          src={teamImage}
          alt="Our Team"
          width={600}
          height={400}
          className={styles.image}
        />
        <div className={styles.text}>
          <p>
            Welcome to our website! We are a team of passionate individuals
            dedicated to bringing the best experience to our users. Our mission
            is to provide high-quality services and build a strong community.
          </p>
          <p>
            Our team is made up of experienced developers, designers, and
            strategists who work together to create innovative solutions.
          </p>
          <p>
            Feel free to explore our platform and learn more about what we
            offer. If you have any questions, don't hesitate to reach out to us!
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
