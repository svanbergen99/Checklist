# Overlay – schermlayout `Account identificeren`

Dit document hoort bij het **overlay-deel** van de Compliance Check.

Doel: vastleggen hoe het SAP-scherm `1MedewerkersDesktop > Account identificeren` er in de praktijk uitziet, zodat de compliance-overlay hier rekening mee kan houden zonder de bestaande SAP-bediening te blokkeren.

## Referentiebeelden

Er zijn twee schermtoestanden aangeleverd op 7 september 2026:

1. **1908 × 1003 px** – linker navigatiepaneel uitgeklapt.
2. **1915 × 1072 px** – linker navigatiepaneel ingeklapt.

De screenshots zelf bevatten bedrijfsinterne scherminformatie en worden daarom niet als publieke afbeelding in deze repository opgeslagen. De relevante layout is hieronder wel volledig als structuur vastgelegd.

---

## 1. Browserlaag

Boven het SAP-scherm staat de normale Edge-browserinterface.

Van boven naar beneden:

- tabbladbalk;
- adresbalk;
- favorieten-/snelkoppelingenbalk;
- daarna begint de SAP-pagina.

De overlay moet daarom niet uitgaan van `y = 0` als begin van de SAP-werkruimte.

---

## 2. SAP-hoofdkop

Bovenaan de SAP-pagina staat:

- SAP-logo links;
- titel **1MedewerkersDesktop**;
- rechts de acties:
  - Delen;
  - Personaliseren;
  - Systeemmeldingen;
  - Afmelden.

Daaronder staat een brede werk-/sessiebalk met meerdere invoervakken en knoppen, waaronder:

- **Nieuwe sessie**;
- **Annuleren**;
- **Bewaarde zoekopdrachten**;
- zoek-/startbediening aan de rechterkant.

---

## 3. Paginaheader `Account identificeren`

Onder de sessiebalk staat de paginatitel:

**Account identificeren**

Rechts van deze header staan kleine SAP-navigatie-/statusiconen.

---

## 4. Linker navigatiepaneel

Het scherm kent twee toestanden.

### A. Navigatie uitgeklapt

Ongeveer 215–220 px breed links van het hoofdformulier.

Zichtbare onderdelen:

- Extra klantgegevens
- Werkvoorraad
- Postbus zoeken
- Zoeken toekomstpolis
- Contactgerelateerde gegev.
- Start externe link
  - Brein
  - Artikel 1MDW
  - Kortingsoverzicht
  - StreamServe Retouch

### B. Navigatie ingeklapt

Het navigatiepaneel verdwijnt vrijwel volledig en wordt een smalle verticale rand/uitklapknop links.

Hierdoor schuift het hoofdformulier vrijwel naar de volledige schermbreedte.

**Belangrijk voor de overlay:** beide toestanden moeten als geldig worden beschouwd. De overlay mag niet aannemen dat het hoofdformulier altijd op dezelfde x-positie begint.

---

## 5. Tabbladen van `Account identificeren`

Direct boven het zoekformulier staan drie tabbladen:

- Details
- **Persoon**
- Polisnr/Kenteken

De aangeleverde schermen tonen het tabblad **Persoon** als actieve werkcontext.

---

## 6. Zoekformulier – linker/middelste kolom

### Bovenregel

- verplicht veld **Merk**;
- huidige zichtbare waarde: `03 Centraal Beheer - Direct`;
- rechts daarvan veld **Kanaal**.

### Zoekopties

- checkbox **Zoek op oud adres**;
- checkbox **Zoeken incl. gearchiveerde klanten**.

### Persoons-/adreszoekvelden

- Postcode
- Huisnummer
- Toevoeging
- Achternaam
- Voorletters
- Geboortedatum
- Klantnummer
- keuzelijst **Natuurlijk Persoon ID**

### Actieknoppen onder het formulier

- **Account zoeken**
- **Ongedaan maken**
- **MDG Privéaccount**

---

## 7. Zoekformulier – rechter kolom

Rechts in dezelfde formulierzone staan:

- E-mail
- Telefoon
- Straat
- Plaats

Deze velden liggen ongeveer in het midden/rechterdeel van het scherm en mogen bij gebruik van een zwevende overlay niet structureel worden afgedekt.

---

## 8. Resultaatlijst

Onder de zoekknoppen staat de sectie:

**Resultaatlijst**

Daaronder staat een brede SAP-tabel met onder andere kolommen voor:

- Bekend
- Acties
- Win...
- Volledige naam
- Geboorted...
- Overlijdensd...
- Straat
- Huisnum...
- Toevoeg...
- Postcode
- Plaats
- Telefoon
- Klantnu...
- Account-ID
- Archi...

Rechts boven de tabel staat een **Filter**-veld.

De tabel beslaat vrijwel de volledige beschikbare breedte van het hoofdvenster.

---

## 9. Bevestigde partners

Onder de resultaatlijst staat een tweede sectie:

**Bevestigde partners**

Met een tweede brede tabel met onder andere:

- Acties
- Klant
- BP nummer
- Geboortedatum
- Postcode
- Plaats
- Straat

Ook deze sectie heeft rechts een **Filter**-veld.

---

## 10. Onderkant van het scherm

Onderaan is de SAP-statusbalk zichtbaar en daaronder de Windows-taakbalk.

De beschikbare verticale ruimte voor SAP is daarom kleiner dan de totale schermhoogte.

---

## 11. Overlay-regels voor deze schermlayout

Voor het bestaande Compliance Check overlay-systeem gelden op dit scherm de volgende uitgangspunten:

1. De overlay blijft een **los zwevend venster** boven SAP en maakt geen onderdeel uit van de SAP-DOM.
2. De overlay mag geen SAP-elementen aanpassen of onderscheppen.
3. Zowel de toestand **linkermenu open** als **linkermenu dicht** moet bruikbaar blijven.
4. De medewerker moet tijdens de overlay altijd de volgende delen van SAP kunnen blijven zien/gebruiken:
   - persoonsgegevens-/zoekvelden;
   - `Account zoeken`;
   - resultaatlijst;
   - klant-/accountresultaten;
   - relevante contactvelden rechts.
5. Het overlayvenster moet verplaatsbaar blijven zodat de medewerker het zelf naast de op dat moment gebruikte SAP-zone kan zetten.
6. De Compliance Check blijft leidend voor checklist/logica; deze layoutbeschrijving is alleen de **schermcontext voor de overlay**.

---

## 12. Visuele hoofdindeling

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Edge: tabs / adresbalk / favorieten                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ SAP 1MedewerkersDesktop                       Delen ... Afmelden             │
├─────────────────────────────────────────────────────────────────────────────┤
│ Nieuwe sessie / Annuleren / sessie- en zoekbalk                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ Account identificeren                                                      │
├───────────────┬─────────────────────────────────────────────────────────────┤
│ linker menu   │ Details | Persoon | Polisnr/Kenteken                        │
│ open/dicht    │                                                             │
│               │ Merk                          Kanaal                         │
│               │ Zoekopties                                                   │
│               │ Postcode / huisnr / naam / geboorte     E-mail / telefoon   │
│               │ Klantnummer / Natuurlijk Persoon ID     Straat / plaats     │
│               │                                                             │
│               │ Account zoeken | Ongedaan maken | MDG Privéaccount          │
│               │                                                             │
│               │ Resultaatlijst + filter                                    │
│               │ ─────────────────────────────────────────────────────────   │
│               │                                                             │
│               │ Bevestigde partners + filter                               │
│               │ ─────────────────────────────────────────────────────────   │
├───────────────┴─────────────────────────────────────────────────────────────┤
│ SAP-statusbalk                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ Windows-taakbalk                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

Deze beschrijving is de vaste schermreferentie voor verdere wijzigingen aan `overlay.js`, `overlay-frame.html`, `overlay-frame.css` en `overlay-frame.js`.