import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
import { analyzeAudioFile } from "../lib/audioAnalysis";
import { COPY } from "../lib/translations";

const QUICK_BPM = [72, 90, 100, 120, 128, 140, 174];
const CHROMA_LABELS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const SECTION_META = [
  { id: "home", icon: faHouse },
  { id: "delay-reverb", icon: faWaveSquare },
  { id: "metronome", icon: faStopwatch },
  { id: "tap-tempo", icon: faGaugeHigh },
  { id: "detector", icon: faFileAudio },
];

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

export default function ProducerTools() {
  const audioSupported = useWebAudioSupport();
  const [activeSection, setActiveSection] = useState("home");
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
    document.title = copy.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", copy.meta.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", copy.meta.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", copy.meta.description);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", copy.meta.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", copy.meta.description);
  }, [copy]);

  useEffect(() => {
    const syncSectionFromUrl = () => {
      const sectionId = window.location.hash.replace("#", "");
      if (SECTION_META.some((section) => section.id === sectionId)) {
        setActiveSection(sectionId);
      } else {
        setActiveSection("home");
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

  const openSection = useCallback((sectionId) => {
    setActiveSection(sectionId);

    if (typeof window === "undefined") return;
    const nextUrl =
      sectionId === "home"
        ? `${window.location.pathname}${window.location.search}`
        : `${window.location.pathname}${window.location.search}#${sectionId}`;
    window.history.pushState({ sectionId }, "", nextUrl);
  }, []);

  return (
    <main className="app-shell">
      <aside className="side-panel" aria-label={copy.sidebar.navigation}>
        <button type="button" className="brand-lockup" onClick={() => openSection("home")}>
          <div>
            <h1>auroLab</h1>
            <p className="creator-credit">
              {copy.sidebar.developedBy} <strong>dhreian</strong>
            </p>
          </div>
        </button>

        <nav className="tool-nav">
          {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={section.id === activeSection ? "is-active" : ""}
                onClick={() => openSection(section.id)}
                aria-current={section.id === activeSection ? "page" : undefined}
                aria-label={section.label}
              >
                <FontAwesomeIcon icon={section.icon} />
                <span>{section.label}</span>
              </button>
          ))}
        </nav>
      </aside>

      <div className="workspace">
        <SectionFrame isActive={activeSection === "home"}>
          <HomeSection
            isActive
            onOpenSection={openSection}
            sections={sections}
            copy={copy}
          />
        </SectionFrame>
        <SectionFrame isActive={activeSection === "delay-reverb"}>
          <DelayReverbCalculator isActive copy={copy} />
        </SectionFrame>
        <SectionFrame isActive={activeSection === "metronome"}>
          <Metronome audioSupported={audioSupported} isActive copy={copy} />
        </SectionFrame>
        <SectionFrame isActive={activeSection === "tap-tempo"}>
          <TapTempo audioSupported={audioSupported} isActive copy={copy} />
        </SectionFrame>
        <SectionFrame isActive={activeSection === "detector"}>
          <AudioDetector audioSupported={audioSupported} isActive copy={copy} />
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
  return (
    <section id="home" className="home-view app-view" hidden={!isActive} aria-labelledby="home-title">
      <div className="home-hero">
        <div className="home-copy">
          <p className="eyebrow">{text.eyebrow}</p>
          <h2 id="home-title">{text.title}</h2>
          <p>{text.description}</p>
        </div>

      </div>

      <div id="home-tools" className="home-tools">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text.toolsEyebrow}</p>
            <h3>{text.toolsTitle}</h3>
          </div>
        </div>

        <div className="tool-card-grid">
          {toolOverview.map((tool, index) => {
            return (
              <button key={tool.id} type="button" className="tool-card" onClick={() => onOpenSection(tool.id)}>
                <span className="tool-card-topline">
                  <span className="tool-card-icon">
                    <FontAwesomeIcon icon={tool.icon} />
                  </span>
                  <span className="tool-card-number">0{index + 1}</span>
                </span>
                <span className="tool-card-kicker">{tool.eyebrow}</span>
                <strong>{tool.title}</strong>
                <p>{tool.description}</p>
              </button>
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

  return (
    <section id="delay-reverb" className="tool-panel app-view" hidden={!isActive}>
      <PanelTitle
        eyebrow={text.eyebrow}
        title={text.title}
        description={text.description}
      />

      <p className="formula-note">
        <code>{text.formula}</code> · <code>Hz = 1000 / ms</code> · {text.dottedFormula} · {text.tripletFormula}
      </p>

      <div className="control-grid">
        <label className="field-block">
          <span>BPM</span>
          <input
            type="number"
            min="30"
            max="300"
            value={bpm}
            onChange={(event) => setBpm(clampBpm(event.target.value))}
          />
        </label>

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
        <h3>{text.reverbTitle}</h3>
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
        <h3>{text.delayTitle}</h3>
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
    <section id="metronome" className="tool-panel app-view" hidden={!isActive}>
      <PanelTitle
        eyebrow={text.eyebrow}
        title={text.title}
        description={text.description}
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
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
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

      <div className="control-grid">
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
        <label className="field-block">
          <span>BPM</span>
          <input
            type="number"
            min="30"
            max="300"
            value={bpm}
            onChange={(event) => setBpm(clampBpm(event.target.value))}
          />
        </label>
        <label className="field-block">
          <span>{text.beats}</span>
          <select value={beatsPerBar} onChange={(event) => setBeatsPerBar(Number(event.target.value))}>
            {[2, 3, 4, 5, 6, 7, 8, 12].map((value) => (
              <option key={value} value={value}>
                {value}/4
              </option>
            ))}
          </select>
        </label>
        <label className="range-block volume-control">
          <span>
            <FontAwesomeIcon icon={faVolumeHigh} />
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
            <FontAwesomeIcon icon={faRotateRight} />
            {text.reset}
          </button>
        </div>
      </div>

      {(audioMessage || audioSupported === false) && (
        <p className="support-message">{audioMessage ? text[audioMessage] : text.visualSupport}</p>
      )}

      <div className="control-grid">
        <Metric label={text.taps} value={String(taps.length)} />
        <div className="stability-meter" aria-live="polite">
          <span>{text.stability}</span>
          <div className="stability-value">{taps.length >= 2 ? `${Math.round(stability * 100)}%` : "--"}</div>
          <div className="stability-track">
            <div className="stability-fill" style={{ width: `${Math.round(stability * 100)}%` }} />
          </div>
        </div>
        <label className="field-block">
          <span>{text.autoReset}</span>
          <select value={resetAfter} onChange={(event) => setResetAfter(Number(event.target.value))}>
            {[2, 3, 5, 8].map((value) => (
              <option key={value} value={value}>
                {value}s
              </option>
            ))}
          </select>
        </label>
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
    <section id="detector" className="tool-panel app-view" hidden={!isActive}>
      <PanelTitle
        eyebrow={text.eyebrow}
        title={text.title}
        description={text.description}
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
        <FontAwesomeIcon icon={faUpload} className="drop-zone-icon" />
        <div>
          <strong>{file ? file.name : text.drop}</strong>
          <span>{file ? `${formatFileSize(file.size)} · ${file.type || "audio"}` : text.chooseHint}</span>
        </div>
        <button type="button" className="secondary-button" onClick={() => inputRef.current?.click()} disabled={isAnalyzing || audioSupported === false}>
          {text.chooseAudio}
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
    </section>
  );
}

function PanelTitle({ eyebrow, title, description, titleId }) {
  return (
    <header className="panel-title">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
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
