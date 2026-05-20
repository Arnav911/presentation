"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Templates", href: "#templates" },
  { label: "Pricing", href: "#pricing" },
];

const HERO_TABS = [
  { label: "Sales proposal", img: "/custom_slide_sales.png" },
  { label: "Pitch deck", img: "/custom_slide_pitch.png" },
  { label: "Business update", img: "/custom_slide_update.png" },
  { label: "Research report", img: "/custom_slide_research.png" },
  { label: "Product showcase", img: "/custom_slide_product.png" },
];

const COMPANY_LOGOS = [
  "OpenAI", "Apple", "Figma", "Notion", "Vercel", "HubSpot", "TikTok", "Stanford"
];

const FEATURES = [
  {
    icon: "↗",
    title: "Start from anywhere",
    desc: "Paste raw notes, outlines, meeting docs, or existing decks. The app pulls everything into a single presentation.",
  },
  {
    icon: "✦",
    title: "Generate impressive slides",
    desc: "Go from raw ideas to polished presentations in a click. Generate stellar, on-brand slides with professional diagrams and visuals.",
  },
  {
    icon: "✎",
    title: "Edit with AI",
    desc: "Simply instruct AI to refine and iterate. Our engine is built on a multi-model system giving you full flexibility.",
  },
  {
    icon: "⇪",
    title: "Export to any format",
    desc: "Present and guide audience attention effectively. Export to PPT, PDF, or publish online.",
  },
];

const BUSINESS_FEATURES = [
  {
    icon: "↗",
    title: "Visualize with charts",
    desc: "Visualize data, charts, graphs, metrics and tables easily. Embed your data sources directly.",
  },
  {
    icon: "⊞",
    title: "Bring your brand in a click",
    desc: "Easily set up your brand fonts, colors and visual rules so every slide is always consistent.",
  },
  {
    icon: "⬇",
    title: "Export to PPT",
    desc: "Export your presentation straight to PPT and continue editing there.",
  },
  {
    icon: "◻",
    title: "Customizability",
    desc: "Full control over layouts and visuals without breaking brand rules.",
  },
  {
    icon: "⊙",
    title: "Multi-model support",
    desc: "Use OpenAI, Gemini, Anthropic or Ollama depending on your preference and budget.",
  },
  {
    icon: "⚿",
    title: "Privacy first",
    desc: "Your content stays private and protected with enterprise-grade security.",
  },
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [prevTab, setPrevTab] = useState(0);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-rotate hero tabs
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPrevTab(activeTab);
      setActiveTab((t) => (t + 1) % HERO_TABS.length);
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleTabClick = (i: number) => {
    setPrevTab(activeTab);
    setActiveTab(i);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setPrevTab(i);
      setActiveTab((t) => (t + 1) % HERO_TABS.length);
    }, 4000);
  };

  return (
    <div className="landing-root">
      {/* Announcement Bar */}
      {announcementVisible && (
        <div className="announcement-bar">
          <div className="announcement-inner">
            <p>✦ Presentation AI is now in Beta. Try it today.</p>
            <button
              className="announcement-close"
              onClick={() => setAnnouncementVisible(false)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`lp-header ${scrolled ? "lp-header-scrolled" : ""}`}>
        <div className="lp-container lp-header-inner">
          <div className="lp-logo">
            <a href="/" className="flex items-center">
              <span className="font-bold text-2xl tracking-tighter text-black">Logo</span>
            </a>
          </div>
          <nav className="lp-nav">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="lp-nav-link">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="lp-header-actions">
            <Link href="/dashboard" className="lp-btn-ghost">Login</Link>
            <Link href="/dashboard" className="lp-btn-solid">Start for free</Link>
          </div>
          <button className="lp-mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            <span className="mobile-menu-icon">☰</span>
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="lp-mobile-menu">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="lp-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </a>
            ))}
            <Link href="/dashboard" className="lp-mobile-link" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            <Link href="/dashboard" className="lp-btn-solid lp-mobile-cta">Start for free</Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="lp-hero" id="hero">
        <div className="lp-hero-bg-grid"></div>
        <div className="lp-container lp-hero-grid">
          <div className="lp-hero-left">
            <h1 className="lp-hero-title">
              AI presentations.<br />
              <span className="lp-hero-title-accent">Without the slop.</span>
            </h1>
            <p className="lp-hero-desc">
              Our platform is the premier AI presentation generator for teams making business-critical decks — giving you AI superpowers without sacrificing flexibility and taste.
            </p>
            <div className="lp-hero-ctas">
              <Link href="/dashboard" className="lp-btn-solid lp-btn-lg">Start for free</Link>
            </div>
            <p className="lp-hero-trust">Multi-model AI · Professional · Fast</p>
          </div>
          <div className="lp-hero-right">
            <div className="lp-hero-preview-wrapper">
              <div className="lp-hero-preview-card">
                {HERO_TABS.map((tab, i) => {
                  let translateY = "100%"; // default lower
                  let zIndex = 1;
                  let opacity = 0;

                  if (i === activeTab) {
                    translateY = "0%";
                    zIndex = 2;
                    opacity = 1;
                  } else if (i === prevTab) {
                    translateY = activeTab > prevTab ? "-100%" : "100%";
                    // Exception for wraparound
                    if (prevTab === HERO_TABS.length - 1 && activeTab === 0) translateY = "-100%";
                    if (prevTab === 0 && activeTab === HERO_TABS.length - 1) translateY = "100%";

                    zIndex = 1;
                    opacity = 1; // Keep visible while sliding out
                  } else if (i > activeTab) {
                    translateY = "100%";
                  } else {
                    translateY = "-100%";
                  }

                  // Force animation direction for wrap-around
                  if (activeTab === 0 && prevTab === HERO_TABS.length - 1 && i === 0) translateY = "0%";
                  if (activeTab === HERO_TABS.length - 1 && prevTab === 0 && i === HERO_TABS.length - 1) translateY = "0%";

                  return (
                    <div
                      key={i}
                      className="lp-hero-slide"
                      style={{
                        transform: `translateY(${translateY})`,
                        zIndex,
                        opacity: i === activeTab || i === prevTab ? 1 : 0,
                        transition: "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.6s ease"
                      }}
                    >
                      <Image
                        src={tab.img}
                        alt={tab.label}
                        fill
                        style={{ objectFit: "cover", borderRadius: "8px" }}
                        priority={i === 0}
                      />
                    </div>
                  );
                })}
              </div>
              {/* Pagination dots */}
              <div className="lp-hero-dots">
                {HERO_TABS.map((_, i) => (
                  <button
                    key={i}
                    className={`lp-hero-dot ${i === activeTab ? "lp-hero-dot-active" : ""}`}
                    onClick={() => handleTabClick(i)}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
            <div className="lp-hero-tabs">
              {HERO_TABS.map((tab, i) => (
                <button
                  key={i}
                  className={`lp-hero-tab ${i === activeTab ? "lp-hero-tab-active" : ""}`}
                  onClick={() => handleTabClick(i)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Logo Marquee */}
      <section className="lp-logos">
        <div className="lp-container">
          <p className="lp-logos-label">Trusted by teams at</p>
          <div className="lp-logos-marquee">
            <div className="lp-logos-track">
              {[...COMPANY_LOGOS, ...COMPANY_LOGOS].map((name, i) => (
                <div key={i} className="lp-logo-item">{name}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="lp-features" id="features">
        <div className="lp-container">
          <div className="lp-features-grid">
            <div className="lp-features-preview">
              <Image
                src="/feature-ai-edit.png"
                alt="Edit with AI"
                width={620}
                height={460}
                style={{ width: "100%", height: "auto", borderRadius: "12px", boxShadow: "0 16px 48px rgba(0,0,0,0.12)" }}
              />
            </div>
            <div className="lp-features-list">
              {FEATURES.map((f, i) => (
                <div key={i} className="lp-feature-item">
                  <div className="lp-feature-icon">{f.icon}</div>
                  <div>
                    <h3 className="lp-feature-title">{f.title}</h3>
                    <p className="lp-feature-desc">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Built for Serious Business */}
      <section className="lp-business" id="business">
        <div className="lp-container">
          <div className="lp-business-header">
            <h2 className="lp-section-title">Built for serious work.</h2>
            <p className="lp-section-subtitle">
              Our platform is designed for professional teams. Our powerful engine supports the world's leading AI models — no vendor lock-in.
            </p>
          </div>
          <div className="lp-business-grid">
            {BUSINESS_FEATURES.map((f, i) => (
              <div key={i} className="lp-business-card">
                <div className="lp-business-icon">{f.icon}</div>
                <h3 className="lp-business-title">{f.title}</h3>
                <p className="lp-business-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="lp-cta-banner">
        <div className="lp-container lp-cta-inner">
          <div>
            <h2 className="lp-cta-title">Your reputation is on the slide.</h2>
            <p className="lp-cta-desc">
              Create presentations that make people think "who made this?" — in the good way.
            </p>
          </div>
          <div className="lp-cta-actions">
            <Link href="/dashboard" className="lp-btn-solid lp-btn-lg lp-btn-white">Start for free</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <div className="lp-footer-brand">
            <span className="font-bold text-xl tracking-tighter text-black opacity-70 mb-3 block">Logo</span>
            <p className="lp-footer-tagline">AI presentation generator.</p>
          </div>
          <div className="lp-footer-links">
            <div className="lp-footer-col">
              <span className="lp-footer-col-title">Product</span>
              <a href="#features">Features</a>
              <a href="#templates">Templates</a>
            </div>
            <div className="lp-footer-col">
              <span className="lp-footer-col-title">Use cases</span>
              <a href="#">Sales decks</a>
              <a href="#">Pitch decks</a>
              <a href="#">Business reports</a>
            </div>
            <div className="lp-footer-col">
              <span className="lp-footer-col-title">Company</span>
              <a href="#">About</a>
              <a href="#">Blog</a>
              <Link href="/dashboard">Login</Link>
            </div>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <p>© 2026 Presentation AI.</p>
        </div>
      </footer>

      <style jsx global>{`
        /* ---- RESET & BASE ---- */
        .landing-root {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #f3f3f1;
          color: #050505;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ---- ANNOUNCEMENT ---- */
        .announcement-bar {
          background: #050505;
          color: #fff;
          font-size: 13px;
          text-align: center;
          padding: 10px 16px;
          position: relative;
          z-index: 100;
        }
        .announcement-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
        }
        .announcement-inner a {
          color: #a3e635;
          text-decoration: none;
          font-weight: 600;
        }
        .announcement-close {
          background: none;
          border: none;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          font-size: 14px;
          padding: 0 4px;
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
        }

        /* ---- HEADER ---- */
        .lp-header {
          position: sticky;
          top: 0;
          background: rgba(243,243,241,0.95);
          backdrop-filter: blur(12px);
          z-index: 99;
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .lp-header-scrolled {
          border-bottom-color: rgba(5,5,5,0.08);
          box-shadow: 0 1px 0 rgba(5,5,5,0.06);
        }
        .lp-header-inner {
          display: flex;
          align-items: center;
          height: 58px;
          gap: 32px;
        }
        .lp-logo {
          flex-shrink: 0;
        }
        .lp-nav {
          display: flex;
          align-items: center;
          gap: 28px;
          flex: 1;
        }
        .lp-nav-link {
          font-size: 14px;
          color: #333;
          text-decoration: none;
          transition: color 0.15s;
          font-weight: 450;
        }
        .lp-nav-link:hover { color: #050505; }
        .lp-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: auto;
        }
        .lp-mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 20px;
          margin-left: auto;
        }
        .lp-mobile-menu {
          border-top: 1px solid rgba(5,5,5,0.08);
          background: #f3f3f1;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .lp-mobile-link {
          font-size: 15px;
          color: #333;
          text-decoration: none;
          padding: 4px 0;
        }
        .lp-mobile-cta {
          text-align: center;
          margin-top: 4px;
        }

        /* ---- BUTTONS ---- */
        .lp-btn-solid {
          background: #050505;
          color: #fff;
          border: none;
          padding: 9px 18px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 550;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background 0.15s, transform 0.1s;
        }
        .lp-btn-solid:hover { background: #222; transform: translateY(-1px); }
        .lp-btn-ghost {
          background: transparent;
          color: #333;
          border: 1px solid rgba(5,5,5,0.15);
          padding: 9px 18px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 450;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background 0.15s, border-color 0.15s;
        }
        .lp-btn-ghost:hover { background: rgba(5,5,5,0.05); border-color: rgba(5,5,5,0.25); }
        .lp-btn-lg { padding: 13px 26px; font-size: 15px; border-radius: 7px; }
        .lp-btn-white { background: #fff; color: #050505; }
        .lp-btn-white:hover { background: #f5f5f5; }
        .lp-btn-border-white { border-color: rgba(255,255,255,0.3); color: #fff; }
        .lp-btn-border-white:hover { background: rgba(255,255,255,0.1); }

        /* ---- CONTAINER ---- */
        .lp-container {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 32px;
        }

        /* ---- HERO ---- */
        .lp-hero {
          position: relative;
          padding: 80px 0 60px;
          overflow: hidden;
        }
        .lp-hero-bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(5,5,5,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(5,5,5,0.06) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.4) 70%, transparent 100%);
        }
        .lp-hero-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 0.9fr 1.4fr;
          gap: 72px;
          align-items: center;
        }
        .lp-hero-title {
          font-size: clamp(36px, 5vw, 58px);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin: 0 0 18px;
        }
        .lp-hero-title-accent {
          color: #050505;
          opacity: 0.55;
        }
        .lp-hero-desc {
          font-size: 16px;
          line-height: 1.65;
          color: #555;
          margin-bottom: 32px;
          max-width: 420px;
        }
        .lp-hero-ctas {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }
        .lp-hero-trust {
          font-size: 12px;
          color: #888;
          margin: 0;
        }

        /* Hero Preview */
        .lp-hero-preview-wrapper {
          position: relative;
        }
        .lp-hero-preview-card {
          position: relative;
          width: 100%;
          aspect-ratio: 16/10;
          border-radius: 12px;
          overflow: hidden;
          background: #f3f3f1;
          box-shadow: 0 4px 6px rgba(0,0,0,0.04), 0 32px 80px rgba(0,0,0,0.12);
          border: 1px solid rgba(5,5,5,0.05);
        }
        .lp-hero-slide {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          will-change: transform;
        }
        .lp-hero-dots {
          display: flex;
          gap: 6px;
          justify-content: center;
          margin-top: 14px;
        }
        .lp-hero-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(5,5,5,0.2);
          border: none;
          cursor: pointer;
          transition: background 0.2s, width 0.2s;
          padding: 0;
        }
        .lp-hero-dot-active {
          background: #050505;
          width: 20px;
          border-radius: 3px;
        }
        .lp-hero-tabs {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
          margin-top: 16px;
          justify-content: center;
        }
        .lp-hero-tab {
          background: none;
          border: none;
          font-size: 13px;
          color: #888;
          padding: 5px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: color 0.15s, background 0.15s;
          font-weight: 450;
        }
        .lp-hero-tab:hover { color: #333; background: rgba(5,5,5,0.05); }
        .lp-hero-tab-active {
          color: #050505 !important;
          font-weight: 600;
          background: rgba(5,5,5,0.06) !important;
        }

        /* ---- LOGOS ---- */
        .lp-logos {
          padding: 48px 0;
          border-top: 1px solid rgba(5,5,5,0.08);
          border-bottom: 1px solid rgba(5,5,5,0.08);
          background: rgba(255,255,255,0.5);
          overflow: hidden;
        }
        .lp-logos-label {
          text-align: center;
          font-size: 12px;
          color: #aaa;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 28px;
          font-weight: 500;
        }
        .lp-logos-marquee {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
          mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }
        .lp-logos-track {
          display: flex;
          gap: 0;
          animation: marquee 20s linear infinite;
        }
        .lp-logo-item {
          flex-shrink: 0;
          padding: 4px 40px;
          font-size: 14px;
          font-weight: 600;
          color: #bbb;
          letter-spacing: -0.01em;
          border-right: 1px solid rgba(5,5,5,0.08);
          white-space: nowrap;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        /* ---- FEATURES ---- */
        .lp-features {
          padding: 100px 0;
        }
        .lp-features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .lp-features-list {
          display: flex;
          flex-direction: column;
          gap: 36px;
        }
        .lp-feature-item {
          display: flex;
          gap: 18px;
          align-items: flex-start;
          cursor: default;
          transition: opacity 0.15s;
        }
        .lp-feature-item:hover { opacity: 0.8; }
        .lp-feature-icon {
          font-size: 18px;
          width: 36px;
          height: 36px;
          background: rgba(5,5,5,0.06);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #333;
        }
        .lp-feature-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 6px;
          color: #050505;
        }
        .lp-feature-desc {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
          margin: 0;
        }

        /* ---- BUSINESS / SECTION TITLES ---- */
        .lp-section-title {
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 700;
          letter-spacing: -0.03em;
          margin: 0 0 16px;
        }
        .lp-section-subtitle {
          font-size: 16px;
          color: #666;
          line-height: 1.65;
          max-width: 560px;
        }
        .lp-business {
          padding: 100px 0;
          background: rgba(255,255,255,0.6);
          border-top: 1px solid rgba(5,5,5,0.08);
          border-bottom: 1px solid rgba(5,5,5,0.08);
        }
        .lp-business-header {
          display: flex;
          gap: 60px;
          align-items: flex-start;
          margin-bottom: 60px;
          flex-wrap: wrap;
        }
        .lp-business-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          border: 1px solid rgba(5,5,5,0.08);
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
        }
        .lp-business-card {
          padding: 32px 28px;
          border-right: 1px solid rgba(5,5,5,0.08);
          border-bottom: 1px solid rgba(5,5,5,0.08);
          transition: background 0.15s;
        }
        .lp-business-card:hover { background: rgba(5,5,5,0.02); }
        .lp-business-card:nth-child(3n) { border-right: none; }
        .lp-business-card:nth-child(4),
        .lp-business-card:nth-child(5),
        .lp-business-card:nth-child(6) { border-bottom: none; }
        .lp-business-icon {
          font-size: 18px;
          color: #555;
          margin-bottom: 14px;
        }
        .lp-business-title {
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 8px;
          color: #050505;
        }
        .lp-business-desc {
          font-size: 13px;
          color: #777;
          line-height: 1.6;
          margin: 0;
        }

        /* ---- CTA BANNER ---- */
        .lp-cta-banner {
          background: #050505;
          padding: 88px 0;
        }
        .lp-cta-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
          flex-wrap: wrap;
        }
        .lp-cta-title {
          font-size: clamp(24px, 3.5vw, 38px);
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.03em;
          margin: 0 0 12px;
        }
        .lp-cta-desc {
          font-size: 16px;
          color: rgba(255,255,255,0.55);
          margin: 0;
          line-height: 1.6;
        }
        .lp-cta-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          flex-shrink: 0;
        }

        /* ---- FOOTER ---- */
        .lp-footer {
          background: #fff;
          border-top: 1px solid rgba(5,5,5,0.08);
          padding: 60px 0 0;
        }
        .lp-footer-inner {
          display: flex;
          gap: 80px;
          flex-wrap: wrap;
          margin-bottom: 48px;
        }
        .lp-footer-brand {
          flex: 1;
          min-width: 200px;
        }
        .lp-footer-tagline {
          font-size: 13px;
          color: #aaa;
          margin: 12px 0 0;
        }
        .lp-footer-links {
          display: flex;
          gap: 60px;
          flex-wrap: wrap;
        }
        .lp-footer-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 120px;
        }
        .lp-footer-col-title {
          font-size: 12px;
          font-weight: 600;
          color: #aaa;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }
        .lp-footer-col a {
          font-size: 13px;
          color: #555;
          text-decoration: none;
          transition: color 0.15s;
        }
        .lp-footer-col a:hover { color: #050505; }
        .lp-footer-bottom {
          border-top: 1px solid rgba(5,5,5,0.08);
          padding: 20px 32px;
          max-width: 1180px;
          margin: 0 auto;
        }
        .lp-footer-bottom p {
          font-size: 12px;
          color: #bbb;
          margin: 0;
        }

        /* ---- RESPONSIVE ---- */
        @media (max-width: 900px) {
          .lp-hero-grid {
            grid-template-columns: 1fr;
            gap: 48px;
          }
          .lp-hero-right { order: -1; }
          .lp-features-grid {
            grid-template-columns: 1fr;
            gap: 48px;
          }
          .lp-business-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .lp-business-card:nth-child(3n) { border-right: 1px solid rgba(5,5,5,0.08); }
          .lp-business-card:nth-child(2n) { border-right: none; }
          .lp-business-card:nth-child(5),
          .lp-business-card:nth-child(6) { border-bottom: none; }
          .lp-business-card:nth-child(4) { border-bottom: 1px solid rgba(5,5,5,0.08); }
        }
        @media (max-width: 640px) {
          .lp-container { padding: 0 20px; }
          .lp-nav { display: none; }
          .lp-header-actions { display: none; }
          .lp-mobile-menu-btn { display: block; }
          .lp-hero { padding: 48px 0 40px; }
          .lp-hero-tabs { gap: 2px; }
          .lp-hero-tab { font-size: 12px; padding: 4px 8px; }
          .lp-business-grid { grid-template-columns: 1fr; }
          .lp-business-card:nth-child(n) { border-right: none; border-bottom: 1px solid rgba(5,5,5,0.08); }
          .lp-business-card:last-child { border-bottom: none; }
          .lp-cta-inner { flex-direction: column; }
          .lp-business-header { flex-direction: column; gap: 20px; }
          .lp-footer-inner { gap: 40px; }
          .lp-footer-links { gap: 32px; }
        }
      `}</style>
    </div>
  );
}
