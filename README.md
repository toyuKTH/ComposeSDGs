## 1. Data status

Principles for Selecting Sub-Dataset:
1. Better in percentage format
2. Positive semantics sub-indicators were chosen, meaning higher valure higher performance
3. As less missing data as possible

| SDG | Indicator (short description) | Series code |
|-----|-------------------------------|-------------|
| SDG 1 | Indicator 1.3.1 – Proportion of population covered by at least one social protection benefit, by sex (%) | **SI_COV_BENFTS** |
| SDG 2 | Indicator 2.4.1 – Progress toward productive and sustainable agriculture, trend score | **AG_LND_SUST_PRXTS** |
| SDG 3 | Indicator 3.8.1 – Universal health coverage (UHC) service coverage index | **SH_ACS_UNHC** |
| SDG 4 | Indicator 4.1.2 – Completion rate, by sex, location, wealth quintile and education level (%) | **SE_TOT_CPLR** |
| SDG 5 | Indicator 5.5.1 – Proportion of seats held by women in national parliaments (% of total number of seats) | **SG_GEN_PARL** |
| SDG 6 | Indicator 6.2.1 – Proportion of population with basic handwashing facilities on premises, by urban/rural (%) | **SH_SAN_HNDWSH** |
| SDG 7 | Indicator 7.1.1 – Proportion of population with access to electricity, by urban/rural (%) | **EG_ACS_ELEC** |
| SDG 8 | Indicator 8.10.2 – Proportion of adults (15+ ) with an account at a financial institution or mobile-money-service provider, by sex (%) | **FB_BNK_ACCSS** |
| SDG 9 | Indicator 9.2.2 – Manufacturing employment as a proportion of total employment (%) | **SL_TLF_MANF** |
| SDG 10 | Indicator 10.4.1 – Labour share of GDP (%) | **SL_EMP_GTOTL** |
| SDG 11 | Indicator 11.2.1 – Proportion of population that has convenient access to public transport (%) | **SP_TRN_PUBL** |
| SDG 12 | Indicator 12.5.1 – Proportion of municipal waste recycled (%) | **EN_MWT_RCYR** |
| SDG 13 | Indicator 11.b.2 / 13.1.3 – Proportion of local governments that adopt and implement local disaster risk reduction strategies (%) | **SG_DSR_SILS** |
| SDG 14 | Indicator 14.4.1 – Proportion of fish stocks within biologically sustainable levels (%) | **ER_H2O_FWTL** |
| SDG 15 | Indicator 15.1.1 – Forest area as a proportion of total land area (%) | **AG_LND_FRST** |
| SDG 16 | Indicator 16.1.4 – Proportion of population that feel safe walking alone around the area they live after dark (%) | **VC_SNS_WALN_DRK** |
| SDG 17 | Indicator 17.1.1 – Total government revenue (budgetary central government) as a proportion of GDP (%) | **GR_G14_GDP** |

This demo is **not using real SDG API data yet**.  
- The API-related file (`apidata.py`) has been written, but the real remote call takes too long.
- The current interface is driven by **fake data** so that everything can be tested.
- When the real data is ready, it can be switched to real data without changing the mapping logic.

---

## 2. Sound engine

All sounds are generated in the browser using **Web Audio API** .  
Reference: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

- 17 different timbre of 17 SDGs (horrible to hear for now, no time to improve...)
- map SDG id → timbre (in `notemapping.js`)



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
