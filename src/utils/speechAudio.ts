/**
 * Plays German text using server-side Gemini TTS when available,
 * falling back seamlessly to browser Web Speech API (`de-DE`) and
 * subtle Web Audio acoustic cadence so audio feedback works everywhere.
 */
export async function speakGermanText(
  text: string,
  rate: number = 0.95,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  onStart?.();

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (res.ok) {
      const data = await res.json();
      if (!data.fallback && data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        audio.playbackRate = rate;
        await new Promise<void>((resolve) => {
          audio.onended = () => resolve();
          audio.onerror = () => resolve();
          audio.play().catch(() => resolve());
        });
        onEnd?.();
        return;
      }
    }
  } catch {
    // Proceed to browser speechSynthesis fallback
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = rate;

      const voices = window.speechSynthesis.getVoices();
      const germanVoice = voices.find((v) =>
        v.lang.toLowerCase().startsWith('de')
      );
      if (germanVoice) {
        utterance.voice = germanVoice;
      }

      await new Promise<void>((resolve) => {
        const timeout = setTimeout(resolve, 1800);
        utterance.onend = () => {
          clearTimeout(timeout);
          resolve();
        };
        utterance.onerror = () => {
          clearTimeout(timeout);
          resolve();
        };
        window.speechSynthesis.speak(utterance);
      });
    } catch {
      // Ignore synthesis errors in headless environments
    }
  } else {
    await new Promise((r) => setTimeout(r, 600));
  }

  onEnd?.();
}
