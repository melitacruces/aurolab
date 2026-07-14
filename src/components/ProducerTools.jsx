import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  faFileAudio,
  faGaugeHigh,
  faHouse,
  faPause,
  faPlay,
  faRotateRight,
  faStopwatch,
  faUpload,
  faVolumeHigh,
  faWaveSquare,
} from "@fortawesome/free-solid-svg-icons";
import {
  NOTE_ROWS,
  averageTapBpm,
  beatMs,
  buildReverbRows,
  clampBpm,
  formatHz,
  formatMs,
  noteTiming,
  tapTempoStats,
} from "../lib/musicMath";
import { COPY } from "../lib/translations";
import { DOCUMENTATION_LABELS, TOOL_DOCUMENTATION } from "../lib/documentation";
import { getSectionFromPath, getSeoRoute, SEO_ROUTES } from "../lib/seo";
import { toTitleCase } from "../lib/textFormat";

const QUICK_BPM = [72, 90, 100, 120, 128, 140, 174];
const CHROMA_LABELS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const BEAT_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 12].map((value) => ({ value, label: `${value}/4` }));
const RESET_OPTIONS = [2, 3, 5, 8].map((value) => ({ value, label: `${value}s` }));
const SECTION_META = [
  { id: "home", icon: faHouse, path: SEO_ROUTES.home.path },
  { id: "delay-reverb", icon: faWaveSquare, path: SEO_ROUTES["delay-reverb"].path },
  { id: "metronome", icon: faStopwatch, path: SEO_ROUTES.metronome.path },
  { id: "tap-tempo", icon: faGaugeHigh, path: SEO_ROUTES["tap-tempo"].path },
  { id: "detector", icon: faFileAudio, path: SEO_ROUTES.detector.path },
];
const SOCIAL_LINKS = [
  { name: "Web", handle: "dhreian.com", href: "https://dhreian.com", icon: "website" },
  { name: "X", handle: "@dhreian", href: "https://x.com/dhreian", icon: "x" },
  { name: "Instagram", handle: "@dhreian", href: "https://instagram.com/dhreian", icon: "instagram" },
  { name: "TikTok", handle: "@dhreian.com", href: "https://www.tiktok.com/@dhreian.com", icon: "tiktok" },
];

function Icon({ icon, className = "" }) {
  const [width, height, , , pathData] = icon.icon;
  const paths = Array.isArray(pathData) ? pathData : [pathData];

  return (
    <svg
      className={className ? `icon ${className}` : "icon"}
      viewBox={`0 0 ${width} ${height}`}
      width="1.25em"
      height="1em"
      aria-hidden="true"
      focusable="false"
    >
      {paths.map((path, index) => (
        <path key={index} fill="currentColor" d={path} />
      ))}
    </svg>
  );
}

function SocialIcon({ name }) {
  if (name === "website") {
    return (
      <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15.3 15.3 0 0 1 0 18M12 3a15.3 15.3 0 0 0 0 18" />
      </svg>
    );
  }

  if (name === "instagram") {
    return (
      <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle className="social-icon-dot" cx="17.4" cy="6.7" r="1" />
      </svg>
    );
  }

  if (name === "x") {
    return (
      <svg className="social-icon social-icon-x" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M18.24 2.25h3.31l-7.23 8.26 8.51 11.24h-6.66l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" />
      </svg>
    );
  }

  if (name === "tiktok") {
    return (
      <svg className="social-icon social-icon-tiktok" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12.53.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.72-.02-.5-.03-1-.01-1.48.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07Z" />
      </svg>
    );
  }

  return (
    <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.28-.36 6.72-1.61 6.72-7a5.44 5.44 0 0 0-1.45-3.73A5.07 5.07 0 0 0 19.13.32S18 0 15 1.67a13.38 13.38 0 0 0-7 0C5 0 3.87.32 3.87.32a5.07 5.07 0 0 0-.14 3.45A5.44 5.44 0 0 0 2.28 7.5c0 5.42 3.44 6.67 6.72 7A4.8 4.8 0 0 0 8 18v4" />
      <path d="M8 19c-3 .9-3-1.5-4-2" />
    </svg>
  );
}

function CustomSelect({ value, options, onChange, label }) {
  const listboxId = useId();
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuPosition, setMenuPosition] = useState(null);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => Object.is(option.value, value)),
  );
  const selectedOption = options[selectedIndex];

  const openMenu = (nextIndex = selectedIndex) => {
    setActiveIndex(nextIndex);
    setIsOpen(true);
  };

  const closeMenu = (restoreFocus = false) => {
    setIsOpen(false);
    if (restoreFocus) window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const selectOption = (index) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    closeMenu(true);
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const gap = 7;
      const viewportMargin = 10;
      const estimatedHeight = Math.min(options.length * 42 + 12, 232);
      const roomBelow = window.innerHeight - rect.bottom - viewportMargin;
      const opensUp = roomBelow < estimatedHeight && rect.top > roomBelow;
      const top = opensUp
        ? Math.max(viewportMargin, rect.top - estimatedHeight - gap)
        : Math.min(rect.bottom + gap, window.innerHeight - estimatedHeight - viewportMargin);

      setMenuPosition({
        left: Math.max(viewportMargin, rect.left),
        top,
        width: Math.min(rect.width, window.innerWidth - viewportMargin * 2),
        opensUp,
      });
    };

    const handlePointerDown = (event) => {
      if (triggerRef.current?.contains(event.target) || listRef.current?.contains(event.target)) return;
      closeMenu();
    };

    updatePosition();
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", updatePosition);
    document.addEventListener("scroll", updatePosition, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, options.length]);

  const handleKeyDown = (event) => {
    event.stopPropagation();

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      if (!isOpen) {
        openMenu(selectedIndex);
      } else {
        setActiveIndex((current) => (current + direction + options.length) % options.length);
      }
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      if (!isOpen) openMenu(event.key === "Home" ? 0 : options.length - 1);
      else setActiveIndex(event.key === "Home" ? 0 : options.length - 1);
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && isOpen) {
      event.preventDefault();
      selectOption(activeIndex);
      return;
    }

    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      closeMenu(true);
      return;
    }

    if (event.key === "Tab") {
      closeMenu();
      return;
    }

    if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      const query = event.key.toLocaleLowerCase();
      const match = options.findIndex((option, index) => {
        if (index === activeIndex) return false;
        return option.label.toLocaleLowerCase().startsWith(query);
      });
      if (match >= 0) {
        event.preventDefault();
        if (!isOpen) openMenu(match);
        else setActiveIndex(match);
      }
    }
  };

  return (
    <div className={isOpen ? "custom-select is-open" : "custom-select"}>
      <button
        ref={triggerRef}
        type="button"
        className="custom-select-trigger"
        role="combobox"
        aria-label={label}
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-activedescendant={isOpen ? `${listboxId}-option-${activeIndex}` : undefined}
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        onKeyDown={handleKeyDown}
      >
        <span>{selectedOption?.label}</span>
        <span className="custom-select-chevron" aria-hidden="true">
          <svg viewBox="0 0 12 8" focusable="false">
            <path d="m1 1.5 5 5 5-5" />
          </svg>
        </span>
      </button>

      {isOpen && menuPosition &&
        createPortal(
          <div
            ref={listRef}
            id={listboxId}
            className={`custom-select-menu${menuPosition.opensUp ? " opens-up" : ""}`}
            role="listbox"
            aria-label={label}
            style={{ left: menuPosition.left, top: menuPosition.top, width: menuPosition.width }}
          >
            {options.map((option, index) => {
              const isSelected = Object.is(option.value, value);
              return (
                <div
                  id={`${listboxId}-option-${index}`}
                  key={option.value}
                  className={`custom-select-option${isSelected ? " is-selected" : ""}${activeIndex === index ? " is-active" : ""}`}
                  role="option"
                  aria-selected={isSelected}
                  onPointerEnter={() => setActiveIndex(index)}
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(index)}
                >
                  <span>{option.label}</span>
                  <span className="custom-select-check" aria-hidden="true">
                    <svg viewBox="0 0 12 10" focusable="false">
                      <path d="m1 5 3 3 7-7" />
                    </svg>
                  </span>
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}

function NumberInput({ value, min, max, step = 1, onChange, label }) {
  const numericValue = Number(value);

  const changeBy = (direction) => {
    const nextValue = Math.min(max, Math.max(min, numericValue + direction * step));
    onChange(nextValue);
  };

  return (
    <div className="number-control">
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
      />
      <span className="number-stepper">
        <button
          type="button"
          className="number-step-button"
          aria-label={`Increase ${label}`}
          disabled={numericValue >= max}
          onClick={() => changeBy(1)}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <svg viewBox="0 0 10 6" aria-hidden="true" focusable="false">
            <path d="m1 5 4-4 4 4" />
          </svg>
        </button>
        <button
          type="button"
          className="number-step-button"
          aria-label={`Decrease ${label}`}
          disabled={numericValue <= min}
          onClick={() => changeBy(-1)}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <svg viewBox="0 0 10 6" aria-hidden="true" focusable="false">
            <path d="m1 1 4 4 4-4" />
          </svg>
        </button>
      </span>
    </div>
  );
}

function getAudioContextClass() {
  if (typeof window === "undefined") return null;
  return window.AudioContext || window.webkitAudioContext || null;
}

function browserNow() {
  if (typeof performance !== "undefined" && typeof performance.now === "function") return performance.now();
  return Date.now();
}

function waitFor(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function blurFocusedRange() {
  const activeElement = document.activeElement;
  if (activeElement instanceof HTMLInputElement && activeElement.type === "range") {
    activeElement.blur();
  }
}

async function resumeAudioContext(context) {
  if (context.state !== "suspended" || typeof context.resume !== "function") return context;

  await Promise.race([context.resume(), waitFor(350)]);
  return context.state === "suspended" ? null : context;
}

function useWebAudioSupport() {
  const [audioSupported, setAudioSupported] = useState(null);

  useEffect(() => {
    setAudioSupported(Boolean(getAudioContextClass()));
  }, []);

  return audioSupported;
}

export default function ProducerTools({ initialSection = "home" }) {
  const audioSupported = useWebAudioSupport();
  const [activeSection, setActiveSection] = useState(initialSection);
  const copy = COPY;
  const sections = SECTION_META.map((section) => ({ ...section, ...copy.sections[section.id] }));

  useEffect(() => {
    window.addEventListener("pointerup", blurFocusedRange);
    window.addEventListener("pointercancel", blurFocusedRange);
    return () => {
      window.removeEventListener("pointerup", blurFocusedRange);
      window.removeEventListener("pointercancel", blurFocusedRange);
    };
  }, []);

  useEffect(() => {
    const page = getSeoRoute(activeSection);
    const canonicalElement = document.querySelector('link[rel="canonical"]');
    const canonicalOrigin = canonicalElement?.href
      ? new URL(canonicalElement.href).origin
      : window.location.origin;
    const canonicalUrl = new URL(page.path, canonicalOrigin).href;

    document.title = page.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", page.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", page.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", page.description);
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", canonicalUrl);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", page.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", page.description);
    canonicalElement?.setAttribute("href", canonicalUrl);
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((link) => {
      link.setAttribute("href", canonicalUrl);
    });
  }, [activeSection]);

  useEffect(() => {
    const syncSectionFromUrl = () => {
      const hashSection = window.location.hash.replace("#", "");
      const sectionId = SECTION_META.some((section) => section.id === hashSection)
        ? hashSection
        : getSectionFromPath(window.location.pathname);
      setActiveSection(sectionId);

      if (hashSection && sectionId === hashSection) {
        const cleanUrl = `${getSeoRoute(sectionId).path}${window.location.search}`;
        window.history.replaceState({ sectionId }, "", cleanUrl);
      }
    };

    syncSectionFromUrl();
    window.addEventListener("hashchange", syncSectionFromUrl);
    window.addEventListener("popstate", syncSectionFromUrl);
    return () => {
      window.removeEventListener("hashchange", syncSectionFromUrl);
      window.removeEventListener("popstate", syncSectionFromUrl);
    };
  }, []);

  const openSection = useCallback((sectionId, event) => {
    if (
      event &&
      (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    ) {
      return;
    }

    event?.preventDefault();
    setActiveSection(sectionId);

    if (typeof window === "undefined") return;
    const nextUrl = `${getSeoRoute(sectionId).path}${window.location.search}`;
    window.history.pushState({ sectionId }, "", nextUrl);
  }, []);

  return (
    <main className="app-shell">
      <aside className="side-panel" aria-label={copy.sidebar.navigation}>
        <a className="brand-lockup" href={SEO_ROUTES.home.path} onClick={(event) => openSection("home", event)}>
          <div>
            <span className="brand-name">auroLab</span>
            <p className="creator-credit">
              {copy.sidebar.developedBy} <strong>dhreian</strong>
            </p>
          </div>
        </a>

        <nav className="tool-nav">
          {sections.map((section) => (
              <a
                key={section.id}
                className={`tool-nav-link${section.id === activeSection ? " is-active" : ""}`}
                href={section.path}
                onClick={(event) => openSection(section.id, event)}
                aria-current={section.id === activeSection ? "page" : undefined}
                aria-label={toTitleCase(section.label)}
              >
                <Icon icon={section.icon} />
                <span>{toTitleCase(section.label)}</span>
              </a>
          ))}
        </nav>

        <div className="social-links">
          <nav className="social-links-list" aria-label={copy.sidebar.socialNavigation}>
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                className="social-link"
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${social.name}: ${social.handle}`}
                title={`${social.name}: ${social.handle}`}
              >
                <SocialIcon name={social.icon} />
              </a>
            ))}
          </nav>
        </div>
      </aside>

      <div className="workspace">
        <SectionFrame isActive={activeSection === "home"}>
          <HomeSection
            isActive={activeSection === "home"}
            onOpenSection={openSection}
            sections={sections}
            copy={copy}
          />
        </SectionFrame>
        <SectionFrame isActive={activeSection === "delay-reverb"}>
          <DelayReverbCalculator isActive={activeSection === "delay-reverb"} copy={copy} />
        </SectionFrame>
        <SectionFrame isActive={activeSection === "metronome"}>
          <Metronome audioSupported={audioSupported} isActive={activeSection === "metronome"} copy={copy} />
        </SectionFrame>
        <SectionFrame isActive={activeSection === "tap-tempo"}>
          <TapTempo audioSupported={audioSupported} isActive={activeSection === "tap-tempo"} copy={copy} />
        </SectionFrame>
        <SectionFrame isActive={activeSection === "detector"}>
          <AudioDetector audioSupported={audioSupported} isActive={activeSection === "detector"} copy={copy} />
        </SectionFrame>
      </div>
    </main>
  );
}

function SectionFrame({ isActive, children }) {
  return (
    <div className="view-frame" hidden={!isActive}>
      {children}
    </div>
  );
}

function HomeSection({ isActive, onOpenSection, sections, copy }) {
  const text = copy.home;
  const toolOverview = sections.filter((section) => section.id !== "home");
  const TitleTag = isActive ? "h1" : "h2";
  return (
    <section id="home" className="home-view app-view" hidden={!isActive} aria-labelledby="home-title">
      <div className="home-hero">
        <div className="home-copy">
          <p className="eyebrow">{text.eyebrow}</p>
          <TitleTag id="home-title">{toTitleCase(text.title)}</TitleTag>
          <p>{text.description}</p>
        </div>

      </div>

      <div id="home-tools" className="home-tools">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text.toolsEyebrow}</p>
            <h2>{toTitleCase(text.toolsTitle)}</h2>
          </div>
        </div>

        <div className="tool-card-grid">
          {toolOverview.map((tool, index) => {
            return (
              <a
                key={tool.id}
                className="tool-card"
                href={tool.path}
                onClick={(event) => onOpenSection(tool.id, event)}
              >
                <span className="tool-card-topline">
                  <span className="tool-card-icon">
                    <Icon icon={tool.icon} />
                  </span>
                  <span className="tool-card-number">0{index + 1}</span>
                </span>
                <span className="tool-card-kicker">{tool.eyebrow}</span>
                <strong>{toTitleCase(tool.title)}</strong>
                <p>{tool.description}</p>
              </a>
            );
          })}
        </div>
      </div>

    </section>
  );
}

function DelayReverbCalculator({ isActive, copy }) {
  const text = copy.delay;
  const [bpm, setBpm] = useState(120);
  const reverbRows = useMemo(() => buildReverbRows(bpm), [bpm]);
  const oneBeat = beatMs(bpm);
  const smallRoom = reverbRows.find((row) => row.id === "smallRoom");

  return (
    <section
      id="delay-reverb"
      className="tool-panel app-view"
      hidden={!isActive}
      aria-labelledby="delay-reverb-title"
    >
      <PanelTitle
        eyebrow={text.eyebrow}
        title={text.title}
        description={text.description}
        titleId="delay-reverb-title"
        isActive={isActive}
      />

      <p className="formula-note">
        <code>{text.formula}</code> · <code>Hz = 1000 / ms</code> · {text.dottedFormula} · {text.tripletFormula}
      </p>

      <div className="control-grid calculator-controls">
        <div className="field-block">
          <span>BPM</span>
          <NumberInput
            label="BPM"
            min="30"
            max="300"
            value={bpm}
            onChange={(nextValue) => setBpm(clampBpm(nextValue))}
          />
        </div>

        <label className="range-block">
          <span>{text.tempo}</span>
          <input
            type="range"
            min="30"
            max="300"
            value={bpm}
            onChange={(event) => setBpm(clampBpm(event.target.value))}
          />
        </label>

        <div className="quick-row" aria-label={text.quickTempos}>
          {QUICK_BPM.map((tempo) => (
            <button key={tempo} type="button" onClick={() => setBpm(tempo)} className={tempo === bpm ? "is-active" : ""}>
              {tempo}
            </button>
          ))}
        </div>
      </div>

      <div className="metric-grid">
        <Metric label={text.beat} value={formatMs(oneBeat)} />
        <Metric label={text.bar} value={formatMs(oneBeat * 4)} />
        <Metric label={text.dottedEighth} value={formatMs(noteTiming(NOTE_ROWS[3], bpm, "dotted").ms)} />
        <Metric label={text.quarterTriplet} value={formatMs(noteTiming(NOTE_ROWS[2], bpm, "triplet").ms)} />
      </div>

      <div className="delay-reverb-tables">
      <div className="table-wrap" tabIndex="0" role="region" aria-label={text.reverbTableLabel}>
        <h3>{toTitleCase(text.reverbTitle)}</h3>
        <table>
          <thead>
            <tr>
              <th>{text.columns.space}</th>
              <th>{text.columns.reference}</th>
              <th>{text.columns.preDelay}</th>
              <th>{text.columns.decay}</th>
              <th>{text.columns.total}</th>
            </tr>
          </thead>
          <tbody>
            {reverbRows.map((row) => (
              <tr key={row.id}>
                <td data-label={text.columns.space}>{text.reverbs[row.id].name}</td>
                <td data-label={text.columns.reference}>{text.reverbs[row.id].size}</td>
                <td data-label={text.columns.preDelay}>{formatMs(row.preDelay)}</td>
                <td data-label={text.columns.decay}>{formatMs(row.decay)}</td>
                <td data-label={text.columns.total}>{formatMs(row.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-wrap" tabIndex="0" role="region" aria-label={text.delayTableLabel}>
        <h3>{toTitleCase(text.delayTitle)}</h3>
        <table>
          <thead>
            <tr>
              <th>{text.columns.note}</th>
              <th>{text.columns.normal}</th>
              <th>{text.columns.dotted}</th>
              <th>{text.columns.triplet}</th>
            </tr>
          </thead>
          <tbody>
            {NOTE_ROWS.map((row) => {
              const normal = noteTiming(row, bpm);
              const dotted = noteTiming(row, bpm, "dotted");
              const triplet = noteTiming(row, bpm, "triplet");

              return (
                <tr key={row.label}>
                  <td data-label={text.columns.note}>
                    <strong>{row.label}</strong>
                    <span>{text.notes[row.label]}</span>
                  </td>
                  <td data-label={text.columns.normal}>{formatTiming(normal)}</td>
                  <td data-label={text.columns.dotted}>{formatTiming(dotted)}</td>
                  <td data-label={text.columns.triplet}>{formatTiming(triplet)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </div>

      <ToolDocumentation
        doc={TOOL_DOCUMENTATION.delay}
        liveExample={
          <section className="doc-live-card" aria-labelledby="delay-live-title">
            <div className="doc-live-copy">
              <p className="eyebrow">Live example · {bpm} BPM</p>
              <h3 id="delay-live-title">{toTitleCase(TOOL_DOCUMENTATION.delay.liveTitle)}</h3>
              <p>{TOOL_DOCUMENTATION.delay.liveDescription}</p>
            </div>
            <div className="doc-live-values">
              <Metric label={TOOL_DOCUMENTATION.delay.liveLabels.beat} value={formatMs(oneBeat)} />
              <Metric
                label={TOOL_DOCUMENTATION.delay.liveLabels.dotted}
                value={formatMs(noteTiming(NOTE_ROWS[3], bpm, "dotted").ms)}
              />
              <Metric
                label={TOOL_DOCUMENTATION.delay.liveLabels.preDelay}
                value={formatMs(smallRoom?.preDelay)}
              />
              <Metric
                label={TOOL_DOCUMENTATION.delay.liveLabels.decay}
                value={formatMs(smallRoom?.decay)}
              />
            </div>
          </section>
        }
      />
    </section>
  );
}

function Metronome({ audioSupported, isActive, copy }) {
  const text = copy.metronome;
  const [bpm, setBpm] = useState(120);
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const [volume, setVolume] = useState(0.75);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeBeat, setActiveBeat] = useState(-1);
  const [audioMessage, setAudioMessage] = useState(false);
  const audioContextRef = useRef(null);
  const timerRef = useRef(null);
  const nextNoteTimeRef = useRef(0);
  const nextVisualBeatRef = useRef(0);
  const beatIndexRef = useRef(0);
  const playModeRef = useRef("visual");
  const playTokenRef = useRef(0);
  const bpmRef = useRef(bpm);
  const beatsPerBarRef = useRef(beatsPerBar);
  const volumeRef = useRef(volume);
  const tapHistoryRef = useRef([]);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    beatsPerBarRef.current = beatsPerBar;
  }, [beatsPerBar]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  const ensureAudioContext = useCallback(async () => {
    const AudioContextClass = getAudioContextClass();
    if (!AudioContextClass) return null;

    try {
      if (!audioContextRef.current) audioContextRef.current = new AudioContextClass();
      return await resumeAudioContext(audioContextRef.current);
    } catch {
      return null;
    }
  }, []);

  const scheduleVisualBeat = useCallback((delayMs, beat) => {
    const playToken = playTokenRef.current;
    window.setTimeout(() => {
      if (playTokenRef.current !== playToken) return;
      setActiveBeat(beat);
    }, Math.max(0, delayMs));
  }, []);

  const scheduleClick = useCallback((time, beat) => {
    const context = audioContextRef.current;
    if (!context) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const accent = beat === 0;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(accent ? 1180 : 820, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volumeRef.current), time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.06);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(time);
    oscillator.stop(time + 0.065);

    scheduleVisualBeat((time - context.currentTime) * 1000, beat);
  }, [scheduleVisualBeat]);

  const scheduler = useCallback(() => {
    if (playModeRef.current === "audio") {
      const context = audioContextRef.current;
      if (!context) return;

      while (nextNoteTimeRef.current < context.currentTime + 0.12) {
        const beat = beatIndexRef.current;
        scheduleClick(nextNoteTimeRef.current, beat);
        nextNoteTimeRef.current += 60 / bpmRef.current;
        beatIndexRef.current = (beat + 1) % beatsPerBarRef.current;
      }

      return;
    }

    const now = browserNow();

    while (nextVisualBeatRef.current < now + 120) {
      const beat = beatIndexRef.current;
      scheduleVisualBeat(nextVisualBeatRef.current - now, beat);
      nextVisualBeatRef.current += (60 / bpmRef.current) * 1000;
      beatIndexRef.current = (beat + 1) % beatsPerBarRef.current;
    }
  }, [scheduleClick, scheduleVisualBeat]);

  const stop = useCallback(() => {
    playTokenRef.current += 1;
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setActiveBeat(-1);
  }, []);

  const start = useCallback(() => {
    if (timerRef.current) return;
    playTokenRef.current += 1;
    const startToken = playTokenRef.current;

    beatIndexRef.current = 0;
    playModeRef.current = "visual";
    nextVisualBeatRef.current = browserNow() + 60;
    setIsPlaying(true);
    setAudioMessage(audioSupported === false);
    scheduler();
    timerRef.current = window.setInterval(scheduler, 25);

    ensureAudioContext()
      .then((context) => {
        if (playTokenRef.current !== startToken || !timerRef.current) return;
        if (!context) {
          setAudioMessage(true);
          return;
        }

        playModeRef.current = "audio";
        nextNoteTimeRef.current = context.currentTime + 0.06;
        setAudioMessage(false);
      })
      .catch(() => {
        if (playTokenRef.current === startToken && timerRef.current) {
          setAudioMessage(true);
        }
      });
  }, [audioSupported, ensureAudioContext, scheduler]);

  const toggle = useCallback(() => {
    if (isPlaying) stop();
    else start();
  }, [isPlaying, start, stop]);

  useEffect(() => stop, [stop]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const tagName = event.target?.tagName?.toLowerCase();
      if (["input", "select", "textarea"].includes(tagName)) return;

      if (event.code === "Space") {
        event.preventDefault();
        toggle();
      }
      if (event.key === "Enter") start();
      if (event.key === "Escape") stop();
      if (event.key === "+" || event.key === "=" || event.key === "ArrowUp") {
        setBpm((current) => clampBpm(current + (event.shiftKey ? 10 : 1)));
      }
      if (event.key === "-" || event.key === "_" || event.key === "ArrowDown") {
        setBpm((current) => clampBpm(current - (event.shiftKey ? 10 : 1)));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [start, stop, toggle]);

  const handleTapTempo = () => {
    const now = browserNow();
    const current = tapHistoryRef.current;
    const next = current.length && now - current[current.length - 1] > 2200 ? [now] : [...current, now].slice(-12);
    tapHistoryRef.current = next;
    const tappedBpm = averageTapBpm(next);
    if (tappedBpm) setBpm(clampBpm(tappedBpm));
  };

  return (
    <section
      id="metronome"
      className="tool-panel app-view"
      hidden={!isActive}
      aria-labelledby="metronome-title"
    >
      <PanelTitle
        eyebrow={text.eyebrow}
        title={text.title}
        description={text.description}
        titleId="metronome-title"
        isActive={isActive}
      />

      <p className="formula-note">
        <code>{text.formula}</code> · {text.formulaNote}
      </p>

      <div className="metronome-board">
        <div className="tempo-display" aria-live="polite">
          <span>{bpm}</span>
          <small>BPM</small>
        </div>

        <div className="transport-row">
          <button type="button" className="transport-button" onClick={toggle} aria-label={isPlaying ? text.pause : text.play}>
            <Icon icon={isPlaying ? faPause : faPlay} />
          </button>
          <button type="button" onClick={handleTapTempo} className="secondary-button">
            {text.tap}
          </button>
          <button type="button" onClick={stop} className="secondary-button">
            {text.stop}
          </button>
        </div>

        <div className="beat-row" aria-label={text.beatIndicator}>
          {Array.from({ length: beatsPerBar }, (_, index) => (
            <span key={index} className={activeBeat === index ? "beat-dot is-on" : "beat-dot"}>
              {index + 1}
            </span>
          ))}
        </div>
      </div>

      {(audioMessage || audioSupported === false) && (
        <p className="support-message">{audioMessage ? text.visualWarning : text.visualSupport}</p>
      )}

      <div className="control-grid metronome-controls">
        <label className="range-block">
          <span>{text.tempo}</span>
          <input
            type="range"
            min="30"
            max="300"
            value={bpm}
            onChange={(event) => setBpm(clampBpm(event.target.value))}
          />
        </label>
        <div className="field-block">
          <span>BPM</span>
          <NumberInput
            label="BPM"
            min="30"
            max="300"
            value={bpm}
            onChange={(nextValue) => setBpm(clampBpm(nextValue))}
          />
        </div>
        <div className="field-block">
          <span>{text.beats}</span>
          <CustomSelect
            value={beatsPerBar}
            options={BEAT_OPTIONS}
            onChange={setBeatsPerBar}
            label={text.beats}
          />
        </div>
        <label className="range-block volume-control">
          <span>
            <Icon icon={faVolumeHigh} />
            {text.volume}
          </span>
          <input type="range" min="0.05" max="1" step="0.01" value={volume} onChange={(event) => setVolume(Number(event.target.value))} />
        </label>
      </div>

      <div className="shortcut-strip">
        <kbd>{text.shortcuts.spaceKey}</kbd> {text.shortcuts.space}
        <kbd>+</kbd>/<kbd>-</kbd> BPM
        <kbd>{text.shortcuts.shiftKey}</kbd> {text.shortcuts.shift}
        <kbd>{text.shortcuts.escapeKey}</kbd> {text.shortcuts.escape}
      </div>

      <ToolDocumentation doc={TOOL_DOCUMENTATION.metronome} />
    </section>
  );
}

function TapTempo({ audioSupported, isActive, copy }) {
  const text = copy.tap;
  const [taps, setTaps] = useState([]);
  const [bpm, setBpm] = useState(0);
  const [stability, setStability] = useState(0);
  const [resetAfter, setResetAfter] = useState(3);
  const [soundOn, setSoundOn] = useState(true);
  const [audioMessage, setAudioMessage] = useState("");
  const contextRef = useRef(null);

  const playFeedback = useCallback(() => {
    if (!soundOn) return;

    const AudioContextClass = getAudioContextClass();
    if (!AudioContextClass) {
      setAudioMessage("noAudio");
      return;
    }

    try {
      if (!contextRef.current) contextRef.current = new AudioContextClass();
      const context = contextRef.current;
      if (context.state === "suspended") context.resume?.().catch(() => {});
      const time = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(760, time);
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.35, time + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(time);
      oscillator.stop(time + 0.05);
      setAudioMessage("");
    } catch {
      setAudioMessage("soundError");
    }
  }, [soundOn]);

  const registerTap = useCallback(() => {
    const now = browserNow();
    playFeedback();
    setTaps((current) => {
      const next = current.length && now - current[current.length - 1] > resetAfter * 1000 ? [now] : [...current, now].slice(-24);
      const stats = tapTempoStats(next);
      setBpm(stats.bpm);
      setStability(stats.stability);
      return next;
    });
  }, [playFeedback, resetAfter]);

  const reset = useCallback(() => {
    setTaps([]);
    setBpm(0);
    setStability(0);
  }, []);

  useEffect(() => {
    return () => {
      contextRef.current?.close?.();
    };
  }, []);

  const adjustedBpm = bpm ? Math.round(bpm * 10) / 10 : 0;

  return (
    <section
      id="tap-tempo"
      className="tool-panel tap-panel app-view"
      hidden={!isActive}
      aria-labelledby="tap-tempo-title"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.code === "Space" || event.key.toLowerCase() === "t") {
          event.preventDefault();
          registerTap();
        }
        if (event.key === "Escape") reset();
      }}
    >
      <PanelTitle
        eyebrow={text.eyebrow}
        title={text.title}
        description={text.description}
        titleId="tap-tempo-title"
        isActive={isActive}
      />

      <p className="formula-note">
        <code>{text.formula}</code> · {text.formulaNote}
      </p>

      <div className="tap-layout">
        <button type="button" className="tap-button" onClick={registerTap}>
          {text.tapButton}
        </button>

        <div className="tap-readout" aria-live="polite">
          <span>{adjustedBpm || "--"}</span>
          <small>BPM</small>
        </div>

        <div className="tap-actions">
          <button type="button" onClick={() => setBpm((current) => current / 2)}>
            /2
          </button>
          <button type="button" onClick={() => setBpm((current) => current * 2)}>
            x2
          </button>
          <button type="button" onClick={reset}>
            <Icon icon={faRotateRight} />
            {text.reset}
          </button>
        </div>
      </div>

      {(audioMessage || audioSupported === false) && (
        <p className="support-message">{audioMessage ? text[audioMessage] : text.visualSupport}</p>
      )}

      <div className="control-grid tap-controls">
        <Metric label={text.taps} value={String(taps.length)} />
        <div className="stability-meter" aria-live="polite">
          <span>{text.stability}</span>
          <div className="stability-value">{taps.length >= 2 ? `${Math.round(stability * 100)}%` : "--"}</div>
          <div className="stability-track">
            <div className="stability-fill" style={{ width: `${Math.round(stability * 100)}%` }} />
          </div>
        </div>
        <div className="field-block">
          <span>{text.autoReset}</span>
          <CustomSelect
            value={resetAfter}
            options={RESET_OPTIONS}
            onChange={setResetAfter}
            label={text.autoReset}
          />
        </div>
        <label className="toggle-pill">
          <input
            type="checkbox"
            checked={soundOn && audioSupported !== false}
            disabled={audioSupported === false}
            onChange={(event) => setSoundOn(event.target.checked)}
          />
          {audioSupported === false ? text.visualTap : text.tapSound}
        </label>
      </div>

      <ToolDocumentation doc={TOOL_DOCUMENTATION.tap} />
    </section>
  );
}

function AudioDetector({ audioSupported, isActive, copy }) {
  const text = copy.detector;
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (nextFile) => {
    if (!nextFile) return;
    if (audioSupported === false) {
      setError("unsupported");
      setStatus("");
      return;
    }

    if (!isAudioFile(nextFile)) {
      setError("invalidFile");
      setStatus("");
      return;
    }

    setFile(nextFile);
    setResult(null);
    setError("");
    setIsAnalyzing(true);

    try {
      const { analyzeAudioFile } = await import("../lib/audioAnalysis");
      const analysis = await analyzeAudioFile(nextFile, setStatus);
      setResult(analysis);
      setStatus("complete");
    } catch {
      setError("analysis");
      setStatus("");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section
      id="detector"
      className="tool-panel app-view"
      hidden={!isActive}
      aria-labelledby="bpm-key-detector-title"
    >
      <PanelTitle
        eyebrow={text.eyebrow}
        title={text.title}
        description={text.description}
        titleId="bpm-key-detector-title"
        isActive={isActive}
      />

      <p className="formula-note">{text.formula}</p>

      <div
        className={`${isDragging ? "drop-zone is-dragging" : "drop-zone"}${audioSupported === false ? " is-disabled" : ""}`}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFile(event.dataTransfer.files?.[0]);
        }}
      >
        <Icon icon={faUpload} className="drop-zone-icon" />
        <div>
          <strong>{file ? file.name : toTitleCase(text.drop)}</strong>
          <span>{file ? `${formatFileSize(file.size)} · ${file.type || "audio"}` : text.chooseHint}</span>
        </div>
        <button type="button" className="secondary-button" onClick={() => inputRef.current?.click()} disabled={isAnalyzing || audioSupported === false}>
          {toTitleCase(text.chooseAudio)}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          onChange={(event) => handleFile(event.target.files?.[0])}
          hidden
        />
      </div>

      {audioSupported === false && (
        <p className="support-message">{text.disabled}</p>
      )}

      {status && (
        <div className={isAnalyzing ? "analysis-status is-loading" : "analysis-status"}>
          <span />
          {text.progress[status]}
        </div>
      )}

      {error && <p className="error-message">{text.errors[error]}</p>}

      {result && (
        <div className="analysis-results">
          <Metric label={text.detectedBpm} value={result.bpm.value ? String(result.bpm.value) : text.unclearMasculine} />
          <Metric label={text.bpmConfidence} value={`${Math.round(result.bpm.confidence * 100)}%`} />
          <Metric label={text.estimatedKey} value={formatKeyName(result.key, text) || text.unclearFeminine} />
          <Metric label={text.keyConfidence} value={`${Math.round(result.key.confidence * 100)}%`} />

          {result.key.tonic != null && result.key.camelot && (
            <div className="key-badge" aria-label={text.camelotLabel}>
              <span className="camelot-chip">{result.key.camelot}</span>
              <div>
                <strong>{formatKeyName(result.key, text)}</strong>
                <span>{text.camelotCode}</span>
              </div>
            </div>
          )}

          <div className="result-line">
            <strong>{text.bpmAlternatives}</strong>
            <span>{result.bpm.alternatives.length ? result.bpm.alternatives.join(", ") : text.noAlternatives}</span>
          </div>
          <div className="result-line">
            <strong>{text.keyAlternatives}</strong>
            <span>
              {result.key.alternatives.length
                ? result.key.alternatives.map((key) => formatKeyName(key, text)).join(", ")
                : text.noAlternatives}
            </span>
          </div>
          <div className="chroma-chart" aria-label={text.noteEnergy}>
            {result.key.chroma.map((value, index) => (
              <div key={CHROMA_LABELS[index]} className={index === result.key.peak ? "chroma-bar is-peak" : "chroma-bar"}>
                <span style={{ height: `${Math.max(5, value * 420)}px` }} />
                <small>{CHROMA_LABELS[index]}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      <ToolDocumentation doc={TOOL_DOCUMENTATION.detector} />
    </section>
  );
}

function ToolDocumentation({ doc, liveExample = null }) {
  const titleId = `${doc.slug}-guide-title`;
  const quickStartId = `${doc.slug}-quick-start-title`;
  const notesId = `${doc.slug}-field-notes-title`;

  return (
    <article className="tool-docs" aria-labelledby={titleId}>
      <header className="docs-hero">
        <div className="docs-hero-copy">
          <p className="eyebrow">{doc.eyebrow}</p>
          <h2 id={titleId}>{toTitleCase(doc.title)}</h2>
          <p>{doc.intro}</p>
        </div>

        <aside className="docs-contents" aria-label={DOCUMENTATION_LABELS.contents}>
          <span>{DOCUMENTATION_LABELS.contents}</span>
          <ol>
            {doc.chapters.map((chapter, index) => (
              <li key={chapter.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {toTitleCase(chapter.title)}
              </li>
            ))}
          </ol>
        </aside>
      </header>

      <section className="docs-quickstart" aria-labelledby={quickStartId}>
        <div className="docs-section-heading">
          <p className="eyebrow">Quick start</p>
          <h3 id={quickStartId}>{toTitleCase(DOCUMENTATION_LABELS.quickStart)}</h3>
        </div>
        <ol className="docs-steps">
          {doc.quickStart.map((step, index) => (
            <li key={step.title}>
              <span className="docs-step-number">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{toTitleCase(step.title)}</strong>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {liveExample}

      <div className="docs-chapter-grid">
        {doc.chapters.map((chapter, index) => (
          <section className="docs-chapter" key={chapter.title}>
            <div className="docs-chapter-topline">
              <p className="eyebrow">{chapter.kicker}</p>
              <span>{String(index + 1).padStart(2, "0")}</span>
            </div>
            <h3>{toTitleCase(chapter.title)}</h3>
            {chapter.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {chapter.formula && <code className="docs-formula">{chapter.formula}</code>}
            {chapter.bullets && (
              <ul>
                {chapter.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            )}
          </section>
        ))}
      </div>

      <section className="docs-field-notes" aria-labelledby={notesId}>
        <div className="docs-section-heading">
          <p className="eyebrow">Keep in mind</p>
          <h3 id={notesId}>{toTitleCase(DOCUMENTATION_LABELS.fieldNotes)}</h3>
        </div>
        <div className="docs-note-grid">
          {doc.fieldNotes.map((note) => (
            <div key={note.label}>
              <strong>{toTitleCase(note.label)}</strong>
              <p>{note.text}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}

function PanelTitle({ eyebrow, title, description, titleId, isActive }) {
  const TitleTag = isActive ? "h1" : "h2";

  return (
    <header className="panel-title">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <TitleTag id={titleId}>{toTitleCase(title)}</TitleTag>
        <p>{description}</p>
      </div>
    </header>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatTiming(timing) {
  return (
    <>
      <strong>{formatMs(timing.ms)}</strong>
      <span>{formatHz(timing.hz)}</span>
    </>
  );
}

function formatKeyName(key, text) {
  if (key?.tonic == null || !key.mode) return "";
  return `${CHROMA_LABELS[key.tonic]} ${text.modes[key.mode]}`;
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAudioFile(file) {
  if (file.type?.startsWith("audio/")) return true;
  return /\.(aac|aif|aiff|flac|m4a|mp3|ogg|opus|wav|webm)$/i.test(file.name);
}
