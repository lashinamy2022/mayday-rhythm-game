import math
import random
import struct
import wave
from pathlib import Path

SAMPLE_RATE = 44100


def save_wav(filename, audio):
    clipped = [max(-1.0, min(1.0, sample)) for sample in audio]
    audio_int16 = [int(sample * 32767) for sample in clipped]
    with wave.open(str(filename), "wb") as wf:
      wf.setnchannels(1)
      wf.setsampwidth(2)
      wf.setframerate(SAMPLE_RATE)
      wf.writeframes(b"".join(struct.pack("<h", sample) for sample in audio_int16))


def whistle_sound(freq=2200, duration=0.25, volume=0.6):
    n = int(duration * SAMPLE_RATE)
    attack = max(1, int(0.01 * SAMPLE_RATE))
    phase = 0.0
    sound = []

    for i in range(n):
        t = i / SAMPLE_RATE
        vibrato = 30 * math.sin(2 * math.pi * 18 * t)
        current_freq = freq + vibrato
        phase += 2 * math.pi * current_freq / SAMPLE_RATE

        tone = math.sin(phase)
        overtone = 0.35 * math.sin(2 * phase)
        noise = 0.08 * (random.random() * 2 - 1)

        if i < attack:
            env = i / attack
        else:
            env = 1.0
        env *= math.exp(-2.5 * t)

        sound.append(volume * (tone + overtone + noise) * env)

    return sound


def place_sound(track, sound, start_sec):
    start = int(start_sec * SAMPLE_RATE)
    end = min(len(track), start + len(sound))
    for i in range(start, end):
        track[i] += sound[i - start]


def main():
    total_duration = 4.0
    track = [0.0] * int(total_duration * SAMPLE_RATE)

    # Five-five-two-five feel, ending with two tighter calls.
    pattern_times = [
        0.0,
        0.35,
        0.7,
        1.05,
        1.4,
        1.9,
        2.25,
        2.6,
        2.95,
        3.3,
        3.65,
        3.85,
    ]

    for i, start in enumerate(pattern_times):
        duration = 0.18 if i not in {10, 11} else 0.12
        freq = 2200 if i % 2 == 0 else 2350
        sound = whistle_sound(freq=freq, duration=duration)
        place_sound(track, sound, start)

    output_path = Path(
        "/Users/yangyang/Documents/Bella-Projects/mayday-rhythm-game/public/audio/generated-whistle.wav"
    )
    output_path.parent.mkdir(parents=True, exist_ok=True)
    save_wav(output_path, track)
    print(f"Saved {output_path}")


if __name__ == "__main__":
    main()
