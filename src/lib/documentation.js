export const DOCUMENTATION_LABELS = {
  contents: "In this guide",
  quickStart: "A reliable starting point",
  fieldNotes: "Studio notes",
};

export const TOOL_DOCUMENTATION = {
  delay: {
    slug: "delay-reverb",
    eyebrow: "Field guide · 6 min",
    title: "Make time-based effects serve the groove",
    intro:
      "Tempo sync is most useful when it turns a technical value into a musical decision. Use the calculator to establish a grid, then shape depth, motion, and clarity while the full mix is playing.",
    quickStart: [
      {
        title: "Match the session tempo",
        body: "Enter the exact BPM from your DAW. If the song contains tempo automation, calculate values for each important section.",
      },
      {
        title: "Choose a rhythmic role",
        body: "Normal notes feel grounded, dotted notes create forward syncopation, and triplets add a rolling or shuffled response.",
      },
      {
        title: "Set the value, then listen",
        body: "Copy the milliseconds or Hertz into the plug-in. Adjust the send, feedback, filtering, and decay in context—not in solo.",
      },
    ],
    liveTitle: "What the current tempo means",
    liveDescription:
      "The example below follows the BPM control above. It shows the relationship between a beat, a syncopated delay, and a compact room target.",
    liveLabels: {
      beat: "Quarter note",
      dotted: "Dotted eighth",
      preDelay: "Small-room pre-delay",
      decay: "Small-room decay",
    },
    chapters: [
      {
        kicker: "The musical grid",
        title: "Normal, dotted, and triplet values",
        paragraphs: [
          "A quarter note lasts one beat. Every other subdivision is derived from that beat length, so the same rhythmic relationship survives at any tempo.",
          "Dotted values are 1.5 times the normal duration. Triplet values are two-thirds of it. That simple change moves the repeat away from the straight grid and changes the perceived momentum without changing BPM.",
        ],
        formula: "quarter-note ms = 60,000 ÷ BPM",
        bullets: [
          "Normal 1/4 or 1/8: stable echoes, slap layers, and predictable rhythmic reinforcement.",
          "Dotted 1/8: a classic off-beat pattern that stays active between quarter-note pulses.",
          "Triplet 1/8 or 1/4: rolling repeats that suit swing, shuffle, and three-against-two movement.",
          "Hertz: useful for tempo-syncing LFO rate, tremolo, auto-pan, chorus, or filter modulation.",
        ],
      },
      {
        kicker: "Reverb anatomy",
        title: "Pre-delay, decay, and total time",
        paragraphs: [
          "Pre-delay is the gap between the dry sound and the start of the reverb. A little separation can protect a vocal consonant, snare transient, or lead attack while still placing it in a space.",
          "The suggested total is a musical target aligned to a note value. auroLab subtracts pre-delay from that target to produce the decay value shown in the table.",
        ],
        formula: "decay = tempo-aligned total − pre-delay",
        bullets: [
          "Short pre-delay blends the source into the room and can push it farther back.",
          "Longer pre-delay keeps the dry source forward, but too much can sound like a separate echo.",
          "RT60 traditionally describes a 60 dB decay in an acoustic space. Plug-in decay controls do not always map to RT60 in exactly the same way.",
        ],
      },
      {
        kicker: "Starting recipes",
        title: "Translate the table into a mix decision",
        paragraphs: [
          "For a lead vocal, try a very short subdivision for pre-delay and a half-note or whole-note tail. Raise the pre-delay if the words lose definition; shorten the tail or filter the return if phrases overlap.",
          "For drums, a quarter-note ambience can add size without filling every gap. Let a snare tail approach the next backbeat, then pull it slightly shorter so the groove can breathe.",
        ],
        bullets: [
          "Width: offset left and right delays by related note values rather than duplicating the same tap.",
          "Movement: automate feedback or send level at phrase endings instead of leaving a dense delay running constantly.",
          "Depth: keep the dry signal clear and darker, quieter repeats behind it; brighter repeats tend to feel closer.",
          "Cohesion: one shared room send can place several instruments in the same imagined space.",
        ],
      },
      {
        kicker: "Troubleshooting",
        title: "When a mathematically correct value sounds wrong",
        paragraphs: [
          "Tempo alignment does not guarantee a clean arrangement. The source envelope, playing density, feedback, stereo placement, and spectral balance all change how long an effect feels.",
        ],
        bullets: [
          "Muddy or crowded: lower the send, shorten decay, reduce feedback, and high-pass the wet return.",
          "Detached from the source: shorten pre-delay or choose a smaller subdivision.",
          "Too static: combine related subdivisions, pan taps, or automate only the last word or hit.",
          "Too obvious: darken the repeats, lower feedback, or move from dotted/triplet timing to a straight value.",
          "Still not working: turn sync off and adjust by ear. Musical intent outranks the grid.",
        ],
      },
    ],
    fieldNotes: [
      { label: "Start subtle", text: "Level usually reveals the right timing faster than adding more repeats." },
      { label: "Judge in context", text: "A beautiful soloed tail can mask the next phrase once the arrangement returns." },
      { label: "Print the choice", text: "Commit or automate the effect once it supports the section; avoid endless preset browsing." },
    ],
  },

  metronome: {
    slug: "metronome",
    eyebrow: "Practice guide · 4 min",
    title: "Build time you can feel, not just follow",
    intro:
      "A metronome is a reference, not a performance. Use the click to expose rushed attacks, dragging releases, and unstable subdivisions, then make the reference progressively less intrusive.",
    quickStart: [
      {
        title: "Choose a realistic tempo",
        body: "Start slow enough to hear every attack clearly. Clean repetitions at 70 BPM are more useful than tense repetitions at 120 BPM.",
      },
      {
        title: "Set the bar",
        body: "Choose the number of quarter-note beats. The brighter first click marks the downbeat and the numbered lights show your position.",
      },
      {
        title: "Reduce dependence",
        body: "After the pulse feels stable, lower the click or let it represent larger beats so your internal subdivisions carry more of the work.",
      },
    ],
    chapters: [
      {
        kicker: "Reading the tool",
        title: "Pulse, bar, and downbeat",
        paragraphs: [
          "BPM counts quarter-note beats per minute. The Beats control groups those pulses into a bar, and beat 1 receives a higher accent so you can orient the phrase without watching the screen.",
          "The visual indicator is helpful for orientation; the audio click should remain the primary timing reference because screen refresh and audio output follow different paths.",
        ],
        formula: "seconds per beat = 60 ÷ BPM",
      },
      {
        kicker: "Practice design",
        title: "Three drills that improve internal time",
        bullets: [
          "Tempo ladder: play a short passage perfectly three times, then add 2–4 BPM. Step back as soon as articulation changes.",
          "Subdivision shift: keep one BPM while moving between quarter notes, eighths, triplets, and sixteenths.",
          "Sparse click: halve the displayed BPM and feel each click as beats 2 and 4, or as the start of a larger phrase.",
          "Record and review: the waveform often reveals rushing and dragging more honestly than it feels while performing.",
        ],
      },
      {
        kicker: "Accuracy",
        title: "Why the click uses the audio clock",
        paragraphs: [
          "auroLab schedules clicks slightly ahead on the Web Audio clock. That keeps the sound steadier than triggering every click directly from a visual timer, whose callbacks can be delayed by browser work.",
          "The interface can still feel offset when a device adds output latency. Bluetooth headphones are a common example: the pulse may remain even while arriving later than the screen animation.",
        ],
      },
      {
        kicker: "Session workflow",
        title: "Use the controls without breaking focus",
        bullets: [
          "Space starts or pauses; Escape stops and returns the beat display to rest.",
          "Arrow keys or +/− change BPM by one. Hold Shift for jumps of ten.",
          "Tap estimates a new tempo from your physical pulse without leaving this section.",
          "Keep volume only loud enough to locate the beat. An overpowering click hides your own timing and dynamics.",
        ],
      },
    ],
    fieldNotes: [
      { label: "Relax first", text: "If tension rises, lower the tempo before repeating the mistake into muscle memory." },
      { label: "Count aloud", text: "Naming subdivisions connects the physical motion to a dependable internal grid." },
      { label: "Leave space", text: "Practise rests and note endings—the click tests silence as much as attack timing." },
    ],
  },

  tap: {
    slug: "tap-tempo",
    eyebrow: "Measurement guide · 4 min",
    title: "Turn a physical pulse into a dependable tempo",
    intro:
      "Tap Tempo measures the time between your taps. A longer, steadier series gives the estimator enough context to reject accidental hits and distinguish your intended pulse.",
    quickStart: [
      {
        title: "Find the strongest pulse",
        body: "Follow the kick, snare, strumming pattern, or another repeating event. Do not switch references halfway through.",
      },
      {
        title: "Tap 8–16 times",
        body: "Use the button, T, or Space at a relaxed and consistent intensity. Ignore the first reading and let it settle.",
      },
      {
        title: "Resolve the octave",
        body: "If the result feels twice or half the expected tempo, use ÷2 or ×2. Both readings can describe the same underlying pulse.",
      },
    ],
    chapters: [
      {
        kicker: "Under the hood",
        title: "How the tempo is calculated",
        paragraphs: [
          "Each pair of taps creates an interval in milliseconds. auroLab converts the representative interval to BPM and updates the result as more taps arrive.",
          "The estimator uses the median and median absolute deviation to reject unusually early or late intervals before averaging. That makes one imperfect tap less destructive without pretending that a loose series is stable.",
        ],
        formula: "BPM = 60,000 ÷ representative interval in ms",
      },
      {
        kicker: "Better input",
        title: "Tap like a measurement instrument",
        bullets: [
          "Listen for two or three beats before the first tap so your hand already knows the pulse.",
          "Use one finger or one key and keep the motion small; large gestures add timing variation.",
          "For music with a weak intro, measure a chorus or drum-led section instead.",
          "Restart after a tempo change. Blending two sections produces an average that may describe neither one.",
        ],
      },
      {
        kicker: "Interpretation",
        title: "Half-time, double-time, and stability",
        paragraphs: [
          "A groove can be heard at multiple metrical levels. A 70 BPM half-time pulse and a 140 BPM double-time pulse share the same broad spacing, so a tap tool cannot decide which notation your project needs.",
          "Stability describes consistency between accepted intervals, not confidence that the chosen metrical level is correct. A very stable 70 BPM can still need the ×2 button for a 140 BPM session.",
        ],
      },
      {
        kicker: "Controls",
        title: "Auto reset and feedback sound",
        paragraphs: [
          "Auto reset starts a fresh series after a long pause, preventing an old measurement from contaminating a new one. Choose a longer reset time for slow music or when you naturally leave more space.",
          "The feedback sound confirms each registered tap but is optional. Turn it off when it competes with the audio you are measuring.",
        ],
      },
    ],
    fieldNotes: [
      { label: "Wait for context", text: "One interval is only a guess; several consistent intervals form a useful measurement." },
      { label: "Watch the trend", text: "A drifting BPM often means the source itself breathes or your tapping reference is changing." },
      { label: "Verify in the DAW", text: "Place grid markers against transients before committing a fixed-tempo recording." },
    ],
  },

  detector: {
    slug: "bpm-key-detector",
    eyebrow: "Analysis guide · 6 min",
    title: "Read an estimate like an engineer",
    intro:
      "Automatic analysis is a fast second opinion, not an authority. Use the main result, confidence, alternatives, and chroma together—and verify the decision against the music before changing a session or harmonic mix.",
    quickStart: [
      {
        title: "Choose a representative file",
        body: "Use a clean, full-length export or a section with clear rhythm and harmony. Long silence and noisy intros weaken the evidence.",
      },
      {
        title: "Read beyond the headline",
        body: "Compare confidence and alternatives. A close alternative is a signal to verify half/double tempo or a relative/parallel key.",
      },
      {
        title: "Confirm musically",
        body: "Count against a metronome, align transients to a grid, and play the proposed tonic and scale over a stable section.",
      },
    ],
    chapters: [
      {
        kicker: "Privacy & processing",
        title: "Your audio stays in this browser",
        paragraphs: [
          "The selected file is decoded with Web Audio and analyzed in memory on your device. auroLab does not upload the file for BPM or key analysis.",
          "Large or highly compressed files can take longer to decode. Browser codec support varies, so converting an unsupported source to WAV can be the most reliable fallback.",
        ],
      },
      {
        kicker: "Tempo estimate",
        title: "From transients to BPM candidates",
        paragraphs: [
          "The analyzer mixes the file to mono, tracks short-term energy changes, and identifies likely transients. Intervals between strong events vote in a tempo histogram between 60 and 200 BPM.",
          "This approach works best when the rhythm produces clear onsets. Pads, rubato performances, extreme syncopation, and tracks with changing tempo may produce several plausible candidates.",
        ],
        bullets: [
          "Half/double errors are normal: 75 and 150 BPM can explain related accent patterns.",
          "Alternatives are useful evidence, not failed answers. Test them against bar lines in the DAW.",
          "Low confidence means the leading candidate did not separate clearly from the next choices.",
        ],
      },
      {
        kicker: "Key estimate",
        title: "Chroma, tonal profiles, and Camelot",
        paragraphs: [
          "Pitch energy is folded into 12 chroma classes from C to B. The resulting distribution is compared with major and minor tonal profiles; the closest profile becomes the estimated key.",
          "The chroma chart shows evidence across the whole track, not a chord transcription. Camelot notation translates the detected key into a compact code commonly used to compare harmonically related tracks.",
        ],
        bullets: [
          "Major and relative minor share many notes, so ambiguous songs can score closely in both.",
          "Modal, atonal, heavily detuned, or key-changing material may not fit a single major/minor label.",
          "A dominant bass note or long intro can bias the global chroma. Recheck a harmonically stable section when possible.",
        ],
      },
      {
        kicker: "Decision quality",
        title: "What confidence does and does not mean",
        paragraphs: [
          "Confidence is the separation between the best internal score and competing scores. It is useful for comparing this analyzer’s candidates, but it is not a calibrated probability that the label is correct.",
          "Treat a strong result as permission to verify quickly, not to skip verification. For mastering, DJ preparation, sample clearance, or musicological work, confirm with a DAW grid and an instrument or a second analysis method.",
        ],
      },
    ],
    fieldNotes: [
      { label: "Use clean evidence", text: "Percussive sections help tempo; sustained, harmonically stable sections help key." },
      { label: "Check alternatives", text: "The runner-up often reveals half-time or a closely related tonal center." },
      { label: "Trust your test", text: "If the proposed tonic clashes consistently, the label is not useful—whatever the score says." },
    ],
  },
};
