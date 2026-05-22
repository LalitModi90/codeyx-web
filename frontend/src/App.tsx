import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const App = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} style={{
        background: scrolled ? 'rgba(5, 5, 5, 0.95)' : 'rgba(5, 5, 5, 0.8)',
        boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.5)' : 'none'
      }}>
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon"></span>
            <span className="logo-text">Coderyx</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#showcase">Showcase</a>
            <a href="#leaderboard">Leaderboard</a>
          </div>
          <div className="nav-actions">
            <button className="btn btn-secondary">Log In</button>
            <button className="btn btn-primary">Get Started</button>
          </div>
        </div>
      </nav>

      <header className="hero">
        <motion.div 
          className="hero-content"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.2 } }
          }}
        >
          <motion.div variants={fadeInUp} className="badge">🚀 v2.0 Now Live</motion.div>
          <motion.h1 variants={fadeInUp} className="hero-title">Level Up Your <br /> <span className="text-gradient">Coding Journey</span></motion.h1>
          <motion.p variants={fadeInUp} className="hero-subtitle">The all-in-one developer workspace. Track your competitive programming stats, curate your portfolio, and dominate leaderboards with our premium bento-grid experience.</motion.p>
          <motion.div variants={fadeInUp} className="hero-cta">
            <button className="btn btn-primary btn-large">Start Building Free</button>
            <button className="btn btn-outline btn-large">View Demo</button>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="hero-visual"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, type: "spring" }}
        >
          <div className="glass-panel main-dashboard">
            <div className="panel-header">
              <div className="window-controls">
                <span></span><span></span><span></span>
              </div>
              <div className="window-title">coderyx-dashboard</div>
            </div>
            <div className="panel-body bento-preview">
              <div className="bento-box box-1">
                <h3>Global Rank</h3>
                <div className="stat">#1,024</div>
                <div className="chart-mockup line"></div>
              </div>
              <div className="bento-box box-2">
                <h3>Problems Solved</h3>
                <div className="stat text-gradient">842</div>
                <div className="progress-bar"><div className="progress" style={{ width: '78%' }}></div></div>
              </div>
              <div className="bento-box box-3">
                <h3>Activity</h3>
                <div className="heatmap-mockup"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </header>

      <section id="features" className="features-section">
        <motion.div 
          className="section-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <h2 className="section-title">Everything you need to <span className="text-gradient">succeed</span></h2>
          <p className="section-subtitle">A premium suite of tools designed specifically for developers and competitive programmers.</p>
        </motion.div>

        <motion.div 
          className="bento-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.15 } }
          }}
        >
          <motion.div variants={fadeInUp} className="bento-card bento-large">
            <div className="card-content">
              <h3>Unified Portfolios</h3>
              <p>Connect your LeetCode, Codeforces, and GitHub profiles in one seamless, high-performance dashboard.</p>
            </div>
            <div className="card-visual port-visual">
              <div className="profile-card">
                <div className="avatar"></div>
                <div className="details">
                  <div className="line w-70"></div>
                  <div className="line w-40"></div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div variants={fadeInUp} className="bento-card">
            <div className="card-content">
              <h3>Coding Sheets</h3>
              <p>Curated problem lists to master algorithms and data structures.</p>
            </div>
            <div className="card-icon">📋</div>
          </motion.div>
          
          <motion.div variants={fadeInUp} className="bento-card">
            <div className="card-content">
              <h3>Analytics</h3>
              <p>Deep insights into your coding patterns and growth.</p>
            </div>
            <div className="card-icon">📈</div>
          </motion.div>
          
          <motion.div variants={fadeInUp} className="bento-card bento-wide">
            <div className="card-content">
              <h3>Real-time Leaderboards</h3>
              <p>Compete with friends and developers worldwide. Track your ranking dynamically.</p>
            </div>
            <div className="card-visual leaderboard-visual">
              <div className="rank-row"><span>1</span><div className="line w-50"></div><span>2400</span></div>
              <div className="rank-row"><span>2</span><div className="line w-40"></div><span>2150</span></div>
              <div className="rank-row"><span>3</span><div className="line w-60"></div><span>1980</span></div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <footer>
        <div className="footer-content">
          <div className="footer-logo">Coderyx</div>
          <p>Empowering the next generation of developers.</p>
        </div>
      </footer>
    </>
  );
};

export default App;
