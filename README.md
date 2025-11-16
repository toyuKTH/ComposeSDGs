## 1. Data status

Principles for Selecting Sub-Dataset:
1. Better in percentage format
2. Positive semantics sub-indicators were chosen, meaning higher valure higher performance
3. As less missing data as possible

Hover over the sdg, information would be shown in tooltip, and 5sdgs can be changed in the NewScript.js file.

This demo is **not using real SDG API data yet**.  
- The API-related file (`apidata.py`) has been written, but the real remote call takes too long.
- The current interface is driven by **fake data** so that everything can be tested.
- When the real data is ready, it can be switched to real data without changing the mapping logic.

---

## 2. Sound Design
The sound engine is built on the **Web Audio API**, 
Reference: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
with **Tone.js** used as a high-level wrapper for sample playback and pitch handling.
Reference: https://tonejs.github.io/
Sample-based SDGs (1, 6, 7, 10, 15) are played through Tone.js, while others use Web Audio–based synthesis for now. See `notemapping.js`

---

## 3. Scale / Value-to-Note Mapping

 **two modes** and the mode can be switched:

- **C Major** (default)
- **C Minor** 


SDG values are first mapped into 10 fixed bands:

| Value range | Staff class |
|-------------|-------------|
| 0–10        | `note-value-0-10` |
| 11–20       | `note-value-11-20` |
| 21–30       | `note-value-21-30` |
| 31–40       | `note-value-31-40` |
| 41–50       | `note-value-41-50` |
| 51–60       | `note-value-51-60` |
| 61–70       | `note-value-61-70` |
| 71–80       | `note-value-71-80` |
| 81–90       | `note-value-81-90` |
| 91–100      | `note-value-91-100` |


### C Major (currentMode = "major")

| Value range | Note | Freq (Hz) |
|-------------|------|-----------|
| 0–10        | C4   | 261.63 |
| 11–20       | D4   | 293.66 |
| 21–30       | E4   | 329.63 |
| 31–40       | F4   | 349.23 |
| 41–50       | G4   | 392.00 |
| 51–60       | A4   | 440.00 |
| 61–70       | B4   | 493.88 |
| 71–80       | C5   | 523.25 |
| 81–90       | D5   | 587.33 |
| 91–100      | E5   | 659.25 |

### C Minor (currentMode = "minor")

In minor mode, the **same 10 bands** are used, but scale degrees **3, 6, 7** are flattened

| Value range | Note (minor) | Freq (Hz) |
|-------------|--------------|-----------|
| 0–10        | C4           | 261.63 |
| 11–20       | D4           | 293.66 |
| 21–30       | **Eb4**      | 311.13 |
| 31–40       | F4           | 349.23 |
| 41–50       | G4           | 392.00 |
| 51–60       | **Ab4**      | 415.30 |
| 61–70       | **Bb4**      | 466.16 |
| 71–80       | C5           | 523.25 |
| 81–90       | D5           | 587.33 |
| 91–100      | **Eb5**      | 622.25 |

The key signature is also updated to show **B♭, E♭, A♭** when minor mode is active. 
