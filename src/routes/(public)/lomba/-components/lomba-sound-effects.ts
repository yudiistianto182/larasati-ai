/**
 * Procedural Web Audio API Sound Synthesizer for Lomba Circuit
 * Zero-latency, realistic tactile sound effects without external audio files.
 */

let sharedAudioCtx: AudioContext | null = null;

export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedAudioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

/**
 * 1. CTA Button Click Sound
 * Crisp, tactile, mechanical click with gold subtle resonance
 */
export function playCtaClickSound() {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // A. High click transient (snappy click)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1200, now);
    osc1.frequency.exponentialRampToValueAtTime(320, now + 0.04);

    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // B. Low body thump
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(240, now);
    osc2.frequency.exponentialRampToValueAtTime(60, now + 0.06);

    gain2.gain.setValueAtTime(0.4, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    // C. Micro noise crackle
    const bufferSize = Math.floor(ctx.sampleRate * 0.015); // 15ms noise
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 3500;
    filter.Q.value = 2.0;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.05);
    osc2.start(now);
    osc2.stop(now + 0.07);
    whiteNoise.start(now);
    whiteNoise.stop(now + 0.02);
  } catch {
    // Graceful fallback
  }
}

/**
 * 2. 3-Second Pre-Conversation Countdown Tick Sound
 * Crisp audio ticks for 3, 2, 1 and readiness bell
 */
export function playCountdownTickSound(count: number) {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (count > 1) {
      // Short energetic tick (880Hz / A5 for 3 and 2)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.06);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } else if (count === 1) {
      // Higher readiness alert beep (1320Hz / E6)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1320, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.09);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.11);
    } else {
      // Golden Start Bell Chime (1760Hz / A6 + 2200Hz)
      const freqs = [1760, 2200];
      freqs.forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.26);
      });
    }
  } catch {
    // Graceful fallback
  }
}

/**
 * 3. Step Reordering Tactile Tick Sound
 * Snappy, mechanical swap tick with slight pitch modulation when moving up/down/dragging
 */
export function playReorderTickSound(direction: "up" | "down" | "swap" = "swap") {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const baseFreq = direction === "up" ? 960 : direction === "down" ? 720 : 840;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, now + 0.05);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Subtle snappy click transient
    const oscClick = ctx.createOscillator();
    const gainClick = ctx.createGain();
    oscClick.type = "triangle";
    oscClick.frequency.setValueAtTime(1450, now);
    oscClick.frequency.exponentialRampToValueAtTime(220, now + 0.03);

    gainClick.gain.setValueAtTime(0.25, now);
    gainClick.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    oscClick.connect(gainClick);
    gainClick.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
    oscClick.start(now);
    oscClick.stop(now + 0.04);
  } catch {
    // Graceful fallback
  }
}

/**
 * 4. Next Stase / Transition Success Chime
 * Harmonious uplifting golden dual-chime
 */
export function playTransitionChime() {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Major Gold Chime)
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.06);

      gain.gain.setValueAtTime(0.18, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.36);
    });
  } catch {}
}

let activeFanfareTimer: number | null = null;
let activeFanfareOscillators: OscillatorNode[] = [];

/**
 * 5. Celebratory Victory Fanfare Synthesizer (Loops 8 times, then transitions)
 * Lively, triumphant trumpet/brass arpeggio chords with sparkling confetti overtones.
 */
export function playCelebratoryFanfare(onComplete?: () => void, loopCount = 8): () => void {
  stopCelebratoryFanfare();

  try {
    const ctx = getSharedAudioContext();
    if (!ctx) {
      onComplete?.();
      return () => {};
    }

    const startTime = ctx.currentTime + 0.05;
    const loopDuration = 0.78; // ~0.78s per fanfare cycle, total ~6.24s for 8 loops

    // Melody patterns for each loop iteration (Major, Subdominant, Dominant, Resolution)
    const patterns = [
      // 1-2: Triumphant C Major opening
      [
        { time: 0.0, freqs: [523.25, 659.25, 783.99], dur: 0.16, type: "sawtooth" as OscillatorType, vol: 0.18 },
        { time: 0.18, freqs: [659.25, 783.99, 1046.5], dur: 0.16, type: "sawtooth" as OscillatorType, vol: 0.2 },
        { time: 0.36, freqs: [783.99, 1046.5, 1318.5], dur: 0.16, type: "sawtooth" as OscillatorType, vol: 0.22 },
        { time: 0.54, freqs: [1046.5, 1318.5, 1567.98], dur: 0.22, type: "triangle" as OscillatorType, vol: 0.25 },
      ],
      // 3-4: F Major celebratory lift
      [
        { time: 0.0, freqs: [587.33, 698.46, 880.0], dur: 0.16, type: "sawtooth" as OscillatorType, vol: 0.18 },
        { time: 0.18, freqs: [698.46, 880.0, 1174.66], dur: 0.16, type: "sawtooth" as OscillatorType, vol: 0.2 },
        { time: 0.36, freqs: [880.0, 1174.66, 1396.91], dur: 0.16, type: "sawtooth" as OscillatorType, vol: 0.22 },
        { time: 0.54, freqs: [1174.66, 1396.91, 1760.0], dur: 0.22, type: "triangle" as OscillatorType, vol: 0.25 },
      ],
      // 5-6: High C Major flourish with bell sparkles
      [
        { time: 0.0, freqs: [659.25, 783.99, 1046.5], dur: 0.16, type: "sawtooth" as OscillatorType, vol: 0.18 },
        { time: 0.18, freqs: [783.99, 1046.5, 1318.5], dur: 0.16, type: "sawtooth" as OscillatorType, vol: 0.22 },
        { time: 0.36, freqs: [1046.5, 1318.5, 1567.98], dur: 0.16, type: "sawtooth" as OscillatorType, vol: 0.24 },
        { time: 0.54, freqs: [1318.5, 1567.98, 2093.0], dur: 0.22, type: "triangle" as OscillatorType, vol: 0.26 },
      ],
      // 7: G Dominant build-up
      [
        { time: 0.0, freqs: [783.99, 987.77, 1174.66], dur: 0.16, type: "sawtooth" as OscillatorType, vol: 0.2 },
        { time: 0.18, freqs: [987.77, 1174.66, 1567.98], dur: 0.16, type: "sawtooth" as OscillatorType, vol: 0.22 },
        { time: 0.36, freqs: [1174.66, 1567.98, 1975.53], dur: 0.16, type: "sawtooth" as OscillatorType, vol: 0.25 },
        { time: 0.54, freqs: [1567.98, 1975.53, 2349.32], dur: 0.22, type: "triangle" as OscillatorType, vol: 0.28 },
      ],
      // 8: Grand Finale Resolution Chime
      [
        { time: 0.0, freqs: [523.25, 659.25, 783.99, 1046.5], dur: 0.22, type: "triangle" as OscillatorType, vol: 0.25 },
        { time: 0.22, freqs: [659.25, 783.99, 1046.5, 1318.5], dur: 0.22, type: "triangle" as OscillatorType, vol: 0.28 },
        { time: 0.44, freqs: [523.25, 783.99, 1046.5, 1567.98, 2093.0], dur: 0.55, type: "sine" as OscillatorType, vol: 0.32 },
      ],
    ];

    for (let loopIdx = 0; loopIdx < loopCount; loopIdx++) {
      const loopStart = startTime + loopIdx * loopDuration;
      const patternIdx =
        loopIdx === loopCount - 1
          ? 4
          : loopIdx === 6
            ? 3
            : loopIdx >= 4
              ? 2
              : loopIdx >= 2
                ? 1
                : 0;

      const currentPattern = patterns[patternIdx];

      currentPattern.forEach((note) => {
        const noteStart = loopStart + note.time;

        // Brass filter
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2800, noteStart);
        filter.frequency.exponentialRampToValueAtTime(1400, noteStart + note.dur);
        filter.Q.value = 3.0;

        const mainGain = ctx.createGain();
        mainGain.gain.setValueAtTime(0.001, noteStart);
        mainGain.gain.linearRampToValueAtTime(note.vol, noteStart + 0.02);
        mainGain.gain.exponentialRampToValueAtTime(0.001, noteStart + note.dur);

        filter.connect(mainGain);
        mainGain.connect(ctx.destination);

        note.freqs.forEach((freq) => {
          const osc = ctx.createOscillator();
          osc.type = note.type;
          osc.frequency.setValueAtTime(freq, noteStart);

          // Subtle brass vibrato on longer notes
          if (note.dur > 0.3) {
            osc.frequency.linearRampToValueAtTime(freq * 1.006, noteStart + note.dur * 0.5);
            osc.frequency.linearRampToValueAtTime(freq, noteStart + note.dur);
          }

          osc.connect(filter);
          osc.start(noteStart);
          osc.stop(noteStart + note.dur + 0.02);
          activeFanfareOscillators.push(osc);
        });

        // Add Sparkling Confetti Bell Overtones on each note
        const sparkleOsc = ctx.createOscillator();
        const sparkleGain = ctx.createGain();
        sparkleOsc.type = "sine";
        sparkleOsc.frequency.setValueAtTime(note.freqs[note.freqs.length - 1] * 2, noteStart);

        sparkleGain.gain.setValueAtTime(0.08, noteStart);
        sparkleGain.gain.exponentialRampToValueAtTime(0.001, noteStart + note.dur * 0.8);

        sparkleOsc.connect(sparkleGain);
        sparkleGain.connect(ctx.destination);

        sparkleOsc.start(noteStart);
        sparkleOsc.stop(noteStart + note.dur);
        activeFanfareOscillators.push(sparkleOsc);
      });
    }

    const totalDurationMs = (loopCount * loopDuration + 0.5) * 1000;
    activeFanfareTimer = window.setTimeout(() => {
      activeFanfareTimer = null;
      onComplete?.();
    }, totalDurationMs);

    return () => {
      stopCelebratoryFanfare();
    };
  } catch {
    onComplete?.();
    return () => {};
  }
}

export function stopCelebratoryFanfare() {
  if (activeFanfareTimer !== null) {
    clearTimeout(activeFanfareTimer);
    activeFanfareTimer = null;
  }
  if (activeFanfareOscillators.length > 0) {
    activeFanfareOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    activeFanfareOscillators = [];
  }
}

