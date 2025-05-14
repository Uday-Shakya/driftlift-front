"use client"
import Image from 'next/image'
import styles from './page.module.css'
import HomeBanner1 from '@/app/components/Homebanner1/HomeBanner1'
import HomeBanner2 from '@/app/components/HomeBanner2/HomeBanner2'
import Footer from './components/Footer/Footer'

const Home = () => {

  const scrollToFooter = () => {
    const footer = document.getElementById('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <main className={styles.main}>
      <HomeBanner1 />
      <HomeBanner2 />
      <Footer />
    </main>
  )
}

export default Home