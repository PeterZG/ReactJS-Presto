import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthShell ({ children, mode }) {
  return (
    <main className="auth-shell">
      <section className="auth-story" aria-label="About Presto">
        <Link to="/login" className="brand-lockup" aria-label="Presto home">
          <span className="brand-symbol">p</span>presto
        </Link>
        <div className="auth-story-content">
          <span className="eyebrow">YOUR PRESENTATION STUDIO</span>
          <h1>
            Make room
            <br />
            for your
            <br />
            <em>next big idea.</em>
          </h1>
          <p>
            A clean canvas. The right tools. Everything you need to turn a
            thought into a presentation worth sharing.
          </p>
          <div className="auth-artwork" aria-hidden="true">
            <div className="art-slide art-slide-back">
              <span>IDEA NO. 01</span>
              <i />
            </div>
            <div className="art-slide art-slide-front">
              <span>THE NEXT CHAPTER</span>
              <strong>
                Think
                <br />
                bigger.
              </strong>
              <b>↗</b>
              <small>PRESTO / YOUR IDEAS, PRESENTED.</small>
            </div>
            <div className="art-caption">
              <span className="status-dot" /> BUILT FOR YOUR NEXT CHAPTER
            </div>
          </div>
        </div>
        <div className="auth-story-footer">
          <span>Ideas deserve a great stage.</span>
          <span>01 — ∞</span>
        </div>
      </section>
      <section className="auth-form-panel">
        <div className="auth-panel-top">
          <span>WELCOME TO YOUR STUDIO</span>
          <span>{mode === 'register' ? '02 / JOIN' : '01 / SIGN IN'}</span>
        </div>
        {children}
        <p className="auth-footnote">
          Create, shape, and present. All in one place.
        </p>
      </section>
    </main>
  );
}
