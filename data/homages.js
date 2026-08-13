/* wristhomage — HOMAGE_DATA
 *
 * Every homage is a real, currently-sold product. Rows carrying `verified` have had
 * their model number and specs checked against a FIRST-PARTY source (the brand's own
 * store) on that date — secondary listicles gave two different wrong model numbers
 * during the 2026-08-12 audit, so they are not sufficient. Rows carrying
 * `priceSource`/`priceDate` had priceUSD read from that seller on that day, and
 * `priceFrom` means the seller quotes a range and this is the base configuration.
 * Everything else is an unsourced approximate street price and should be treated as
 * unverified — the same audit found those understated by up to 46%.
 * fidelity (0-100) follows the published rubric at /rubric: dial + handset,
 * bezel, case shape/proportions, movement class, and spec parity (size, WR,
 * crystal). It is a design-closeness score, NOT a quality score and NOT a claim
 * that anything is a copy. "homage" only — never replica/clone/fake.
 *
 * amazon:true  -> house is sold on Amazon (finder tags the buy link, wristhomage-20)
 * direct       -> optional honest note, e.g. "usually cheaper direct on AliExpress"
 */
window.HOMAGE_DATA = {
  originals: [
    {
      id: "rolex-submariner", name: "Submariner", house: "Rolex", ref: "126610LN",
      priceUSD: 10100, type: "dive", size_mm: 41, wr_m: 300,
      movement: "Automatic (Rolex 3235)",
      cues: ["dive", "rotating bezel", "oyster bracelet", "mercedes hands", "date"],
      homages: [
        { name: "SD1954", house: "Steeldive", priceUSD: 135, size_mm: 41, wr_m: 300, movement: "Automatic (Seiko NH35)", fidelity: 80, amazon: true, verified: "2026-08-12", note: "modern Submariner case dimensions with a flat black no-date dial that reads as a quasi-tribute to the Comex Subs; ceramic bezel, sapphire, and the same 300m as its SD1953 stablemate" },
        { name: "8926OB", house: "Invicta", priceUSD: 180, size_mm: 40, wr_m: 200, movement: "Automatic (Seiko NH35A)", fidelity: 80, priceSource: "invictastores.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "the classic entry Sub homage — coin-edge bezel, cyclops date and a workhorse Seiko NH35A, which Invicta catalogs under its own IM-A-005 designation; Invicta's own store charges well above the street price this watch is famous for, so Amazon is usually the cheaper route" },
        { name: "Ocean One 39 nova black", house: "Steinhart", priceUSD: 718, size_mm: 39, wr_m: 300, movement: "Automatic (Sellita SW200-1 Elaboré)", fidelity: 92, priceSource: "steinhartwatches.de", priceDate: "2026-08-13", amazon: false, verified: "2026-08-13", note: "the enthusiast benchmark — Swiss Sellita movement, ceramic bezel, proportions the community rates closest to the real thing; priced from Steinhart's own store excluding German VAT, which they deduct for buyers outside the EU (about $854 including it), before shipping and import duty" },
        { name: "SN004-G", house: "San Martin", priceUSD: 238, size_mm: 38, wr_m: 200, movement: "Automatic (Seiko NH35)", fidelity: 85, priceSource: "sanmartinwatches.com", priceDate: "2026-08-13", amazon: true, direct: true, verified: "2026-08-13", note: "sharp finishing for the money and a well-cut ceramic bezel, though at 38mm it wears three millimetres under the original; the PT5000 and Swiss-class options are separate references, and San Martin's own store had every SN004 variant sold out at our last check" },
        { name: "SD1953", house: "Steeldive", priceUSD: 118, size_mm: 40.5, wr_m: 300, movement: "Automatic (Seiko NH35)", fidelity: 83, priceSource: "steeldive.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "genuine 300m diver with a ceramic 120-click bezel and a Seiko auto, at 40.5mm against the original's 41 — a lot of watch per dollar; dial and bracelet variants swing the price either side of this" },
        { name: "SRPE74", house: "Seiko", priceUSD: 450, size_mm: 42.5, wr_m: 100, movement: "Automatic (Seiko 4R36)", fidelity: 58, priceSource: "seikowatches.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "not a Sub copy — the spiritual budget diver the community reaches for instead, with its own identity and an in-house auto; note this reference is gold-tone throughout, so for the steel version of the same idea look to Seiko's SRPD series" },
        { name: "AD2078", house: "Addiesdive", priceUSD: 139, size_mm: 41, wr_m: 200, movement: "Automatic (Seiko NH35 / Miyota 8215)", fidelity: 77, priceSource: "addiesdivewatches.com", priceDate: "2026-08-13", amazon: true, direct: true, verified: "2026-08-13", note: "a popular budget Sub homage at the original's 41mm — ceramic bezel, sapphire with the cyclops, 200m and a Seiko-class auto; carried on Amazon, often cheaper direct" }
      ]
    },
    {
      id: "rolex-gmt-master-ii", name: "GMT-Master II", house: "Rolex", ref: "126710BLRO",
      priceUSD: 10700, type: "gmt", size_mm: 40, wr_m: 100,
      movement: "Automatic GMT (Rolex 3285)",
      cues: ["gmt", "24h bezel", "pepsi", "jubilee bracelet", "true gmt"],
      homages: [
        { name: "PD-1662", house: "Pagani Design", priceUSD: 122, size_mm: 40, wr_m: 100, movement: "Automatic GMT (Pearl DG5833)", fidelity: 82, priceSource: "paganidesign.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "the homage that made Pagani famous — a true independently-set GMT hand with a ceramic Pepsi bezel and jubilee, at the original's 40mm; note the movement is a Pearl DG5833, not the Seiko NH34 the internet often claims — Pagani sells the NH34 version as a separate model at about $320" },
        { name: "SN0134-G1", house: "San Martin", priceUSD: 329, size_mm: 40, wr_m: 200, movement: "Automatic GMT (Seiko NH34)", fidelity: 87, priceSource: "sanmartinwatches.com", priceDate: "2026-08-13", amazon: true, direct: true, verified: "2026-08-13", note: "the in-stock member of San Martin's SN005 GMT family — tighter finishing than the budget set, a red-and-blue sapphire bezel and the original's exact 40mm; the canonical SN005-B-1S is the same watch at about $308 but is routinely sold out" },
        { name: "Ocean One GMT BLUE-RED", house: "Steinhart", priceUSD: 582, size_mm: 42, wr_m: 300, movement: "Automatic GMT (Sellita SW330-2 Elaboré)", fidelity: 86, priceSource: "steinhartwatches.de", priceDate: "2026-08-13", amazon: false, verified: "2026-08-13", note: "Swiss true-GMT movement and dive-grade water resistance; a step up in movement over the Seiko-based field. Priced excluding German VAT, which Steinhart deducts outside the EU (about $693 including it); a ceramic-bezel version costs more" },
        { name: "AD2050", house: "Addiesdive", priceUSD: 79, size_mm: 40, wr_m: 200, movement: "Quartz GMT (Ronda 515)", fidelity: 68, priceSource: "addiesdivewatches.com", priceDate: "2026-08-13", amazon: true, direct: true, verified: "2026-08-13", note: "the cheapest way to a genuine independently-set 24-hour hand, at the original's 40mm with a 200m rating — but it is a Swiss quartz movement, not an automatic, and the Pepsi colourway was sold out on Addiesdive's own store at our last check" }
      ]
    },
    {
      id: "rolex-daytona", name: "Daytona", house: "Rolex", ref: "126500LN",
      priceUSD: 15100, type: "chronograph", size_mm: 40, wr_m: 100,
      movement: "Automatic chronograph (Rolex 4131)",
      cues: ["chronograph", "tachymeter bezel", "panda dial", "three subdials"],
      homages: [
        { name: "PD-1664", house: "Pagani Design", priceUSD: 104, size_mm: 40, wr_m: 100, movement: "Meca-quartz (Seiko VK63)", fidelity: 82, priceSource: "paganidesign.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "panda dial and tachymeter bezel with a snappy meca-quartz chrono — the seconds hand sweeps, the pushers feel mechanical, and it costs almost nothing; Pagani's own catalog files it in the Daytona family and it matches the original's 40mm exactly" },
        { name: "SN0116", house: "San Martin", priceUSD: 360, size_mm: 39.5, wr_m: 100, movement: "Meca-quartz (Seiko VK64)", fidelity: 83, amazon: true, direct: true, verified: "2026-08-12", note: "San Martin's panda chronograph: cleaner dial printing and a better bracelet than the budget tier, on a ceramic chronograph bezel; still meca-quartz, not an automatic chronograph" },
        { name: "S465", house: "Sugess", priceUSD: 219, size_mm: 38, wr_m: 50, movement: "Mechanical chronograph (Seagull ST19)", fidelity: 76, priceSource: "sugesswatch.com", priceDate: "2026-08-13", amazon: true, direct: true, verified: "2026-08-13", note: "for purists who want a hand-wound column-wheel chronograph instead of quartz — swan-neck regulator, blued screws and an exhibition caseback; it is a vintage-chronograph shape at 38mm rather than a line-for-line modern Daytona" }
      ]
    },
    {
      id: "rolex-datejust", name: "Datejust", house: "Rolex", ref: "126234",
      priceUSD: 8200, type: "everyday", size_mm: 36, wr_m: 100,
      movement: "Automatic (Rolex 3235)",
      cues: ["fluted bezel", "jubilee bracelet", "cyclops date", "everyday dress"],
      homages: [
        { name: "PD-1645", house: "Pagani Design", priceUSD: 125, size_mm: 42, wr_m: 100, movement: "Automatic", fidelity: 72, priceSource: "paganidesign.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "fluted bezel in two finishes, jubilee bracelet and cyclops date with sapphire and a 100m rating — but the case is a full 42mm against the original's 36mm, and no homage recovers six millimetres of proportion" },
        { name: "C8053", house: "Cadisen", priceUSD: 80, size_mm: 38, wr_m: 50, movement: "Automatic (Miyota 8215)", fidelity: 76, priceSource: "cadisenwatch.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "Cadisen's own catalog titles this one Datejust — fluted-look bezel, cyclops date and sapphire at 38mm, a size closer to the original than the Pagani's 40; the cheapest way into the look with dial and gold combinations the budget tier rarely offers" },
        { name: "SN0058-G-X", house: "San Martin", priceFrom: true, priceUSD: 326, size_mm: 36.5, wr_m: 100, movement: "Automatic (PT5000 / SW200)", fidelity: 85, priceSource: "sanmartinwatches.com", priceDate: "2026-08-12", amazon: true, direct: true, verified: "2026-08-12", note: "the one that nails the proportions the original is known for — 36.5mm and 11.9mm thin, on a five-link bracelet, with a carved bezel rather than a stamped one; a Swiss-class PT5000 or SW200 rather than the Seiko autos the budget tier runs" },
      ]
    },
    {
      id: "rolex-day-date", name: "Day-Date 36", house: "Rolex", ref: "128238",
      priceUSD: 41000, type: "dress", size_mm: 36, wr_m: 100,
      movement: "Automatic day-date (Rolex 3255)",
      cues: ["president bracelet", "fluted bezel", "day display", "cyclops date", "gold dress"],
      homages: [
        { name: "PD-1752", house: "Pagani Design", priceUSD: 148, size_mm: 36, wr_m: 100, movement: "Automatic day-date (Seagull ST16)", fidelity: 82, priceSource: "paganidesign.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "the one that keeps the 36mm President proportions — fluted bezel, president-style bracelet, day and date under sapphire, on a Seagull ST16 with a 100m rating" },
        { name: "PD-1783", house: "Pagani Design", priceUSD: 178, size_mm: 40, wr_m: 100, movement: "Automatic day-date (Seiko NH36A)", fidelity: 78, priceSource: "paganidesign.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "the modern 40mm take with a proper NH36A day-date auto and a 100m rating; wears larger and sportier than the classic 36" },
        { name: "C8185", house: "Cadisen", priceUSD: 104, size_mm: 40, wr_m: 100, movement: "Automatic day-date (Miyota 8285)", fidelity: 74, priceSource: "cadisenwatch.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "Cadisen's presidential-style day-date on a genuine Miyota 8285, with a dial range the segment is famous for — full gold, meteorite white and Tiffany blue — plus sapphire and a 100m rating at 40mm" },
        { name: "RA-AA0C01B", house: "Orient", priceUSD: 245, size_mm: 41.9, wr_m: 50, movement: "Automatic (Orient F6922)", fidelity: 55, priceSource: "orientwatchusa.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "not a President copy — the honest budget day-date automatic the community reaches for since the old Orient President left the catalog; own identity, an in-house auto and an exhibition caseback, filed by Orient itself under Contemporary rather than its diver line" }
      ]
    },
    {
      id: "rolex-oyster-perpetual", name: "Oyster Perpetual 41", house: "Rolex", ref: "124300",
      priceUSD: 6500, type: "everyday", size_mm: 41, wr_m: 100,
      movement: "Automatic (Rolex 3230)",
      cues: ["time-only", "bright lacquer dial", "oyster bracelet", "no date"],
      homages: [
        { name: "PD-1690", house: "Pagani Design", priceUSD: 152, size_mm: 40, wr_m: 200, movement: "Automatic (Miyota 8215)", fidelity: 86, priceSource: "paganidesign.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "the turquoise-dial favourite that rode the Tiffany-OP craze — clean time-only dial, a real 200m rating and a Miyota 8215 auto, at 40mm against the original's 41; out of stock on Pagani's own store at our last check, so Amazon may be the only route" },
        { name: "SRPE53", house: "Seiko", priceUSD: 315, size_mm: 40, wr_m: 100, movement: "Automatic (Seiko 4R36)", fidelity: 52, priceSource: "seikowatches.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "not an OP copy — the budget sunray-dial automatic the community cross-shops instead; own identity, an in-house auto and a fixed bezel, trading on the same dial-colour appeal the Oyster Perpetual does" }
      ]
    },
    {
      id: "rolex-explorer", name: "Explorer", house: "Rolex", ref: "124270",
      priceUSD: 7700, type: "field", size_mm: 36, wr_m: 100,
      movement: "Automatic (Rolex 3230)",
      cues: ["3-6-9 dial", "oyster bracelet", "field", "no date"],
      homages: [
        { name: "PD-1751", house: "Pagani Design", priceUSD: 180, size_mm: 36, wr_m: 200, movement: "Automatic (Seiko NH35)", fidelity: 76, priceSource: "paganidesign.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "a clean 36mm three-hander with sapphire and a genuine 200m rating for around a hundred dollars; Pagani markets it as a Ranger homage rather than an Explorer one, and the 3-6-9 dial language serves both — read it as the shape rather than a line-for-line copy; out of stock on Pagani's own store at our last check" },
        { name: "SN021-G", house: "San Martin", priceFrom: true, priceUSD: 299, size_mm: 36, wr_m: 100, movement: "Automatic (PT5000 / SW200)", fidelity: 86, priceSource: "sanmartinwatches.com", priceDate: "2026-08-12", amazon: true, direct: true, verified: "2026-08-12", note: "the community default for a 36mm Explorer: a Swiss-class PT5000 or SW200 rather than a Seiko auto, top-hat sapphire with AR, and 11mm thick so it wears like the original rather than a modern reissue" },
        { name: "S4056", house: "Baltany", priceUSD: 220, size_mm: 36, wr_m: 200, movement: "Automatic (Seiko NH38)", fidelity: 76, priceSource: "baltany.com", priceDate: "2026-08-13", amazon: true, direct: true, verified: "2026-08-13", note: "a vintage-leaning 36mm that matches the original's case size exactly, with double its water resistance and a domed crystal; Baltany also sells a retro sibling, the S4066AB, at much the same money" }
      ]
    },
    {
      id: "omega-speedmaster", name: "Speedmaster Moonwatch", house: "Omega", ref: "310.30.42",
      priceUSD: 7000, type: "chronograph", size_mm: 42, wr_m: 50,
      movement: "Manual chronograph (Omega 3861)",
      cues: ["chronograph", "tachymeter", "black dial", "moonwatch", "manual wind"],
      homages: [
        { name: "PD-1701", house: "Pagani Design", priceUSD: 136, size_mm: 40, wr_m: 100, movement: "Meca-quartz (Seiko VK63)", fidelity: 80, priceSource: "paganidesign.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "the one unambiguous Moonwatch homage in the budget tier — Pagani's own catalog files it as a nod to the Speedmaster, with the stepped dial, three registers and a moulded tachymeter bezel; 40mm against the original's 42 and double its water resistance, but a meca-quartz hybrid rather than a hand-wound chronograph" },
        { name: "SN0103-G-JS", house: "San Martin", priceUSD: 349, size_mm: 38.5, wr_m: 100, movement: "Manual chronograph (Seagull ST1901)", fidelity: 72, priceSource: "sanmartinwatches.com", priceDate: "2026-08-13", amazon: true, direct: true, verified: "2026-08-13", note: "a genuine hand-wound column-wheel chronograph and the best build here — but read the layout before buying: San Martin calls it the SM57 and it is bicompax with straight lugs, following the 1957 Speedmaster ancestor rather than the three-register Moonwatch, which is why it scores below the cheaper Pagani against this reference" }
      ]
    },
    {
      id: "omega-seamaster-300m", name: "Seamaster Diver 300M", house: "Omega", ref: "210.30.42",
      priceUSD: 5600, type: "dive", size_mm: 42, wr_m: 300,
      movement: "Automatic (Omega 8800)",
      cues: ["dive", "wave dial", "skeleton hands", "helium valve", "rotating bezel"],
      homages: [
        { name: "SD1957", house: "Steeldive", priceUSD: 128, size_mm: 42, wr_m: 300, movement: "Automatic (Seiko NH35 / NH36)", fidelity: 78, priceSource: "steeldive.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "the budget route into the wave-dial Bond diver: 42mm exactly like the original and the only homage here matching its full 300m rating, with sapphire and a Seiko auto. Widely sold as a 1957 vintage piece, which it is not — the model number follows Steeldive's launch-year naming, not the watch it follows" },
        { name: "PD-1685", house: "Pagani Design", priceUSD: 174, size_mm: 42, wr_m: 200, movement: "Automatic (Seiko NH35A)", fidelity: 80, priceSource: "paganidesign.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "the genuine article in this field: a real wave-textured dial, ceramic bezel and curved sapphire, at exactly the original's 42mm and double its rated depth" },
      ]
    },
    {
      id: "patek-nautilus", name: "Nautilus", house: "Patek Philippe", ref: "5711/1A",
      priceUSD: 35000, type: "integrated", size_mm: 40, wr_m: 120,
      movement: "Automatic (Patek 26-330)",
      cues: ["integrated bracelet", "porthole case", "horizontal-groove dial", "luxury sport"],
      homages: [
        { name: "PD-1728", house: "Pagani Design", priceUSD: 130, size_mm: 40, wr_m: 100, movement: "Automatic (Seagull ST6)", fidelity: 80, priceSource: "paganidesign.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "the porthole case, ears and grooved dial in steel with an integrated bracelet — the reason Pagani sells out; wears close to the original's 40mm" },
        { name: "SN076-G", house: "San Martin", priceFrom: true, priceUSD: 299, size_mm: 42, wr_m: 200, movement: "Automatic (PT5000 / SW200)", fidelity: 82, priceSource: "sanmartinwatches.com", priceDate: "2026-08-12", amazon: true, direct: true, verified: "2026-08-12", note: "the case finishing and bracelet taper the budget versions miss, on a Swiss-class PT5000 or SW200 rather than a Seiko auto, with a genuine 200m rating; it wears 42mm against the original's 40mm, which is the one thing it does not get right" },
        { name: "S466 Heritage", house: "Sugess", priceUSD: 259, size_mm: 38.5, wr_m: 50, movement: "Automatic (Miyota 9015)", fidelity: 75, priceSource: "sugesswatch.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "the porthole octagonal case and integrated bracelet on a genuine hi-beat Miyota 9015, in a 9mm case that respects the original's slimness; the day display and enamel or MOP dial options stray from the 5711's horizontal grooves, and 50m is well short of the original's 120m" },
        { name: "Automatic 1983 E-Line", house: "Timex", priceUSD: 279, size_mm: 34, wr_m: 50, movement: "Automatic (Miyota 8215)", fidelity: 60, priceSource: "timex.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "not a Nautilus copy — a revival of Timex's own 1983 TV-dial design that lands in the same rounded-porthole territory, from a mainstream brand with a real warranty; 34mm and an acrylic crystal, so treat it as the character buy" },
      ]
    },
    {
      id: "ap-royal-oak", name: "Royal Oak", house: "Audemars Piguet", ref: "15500ST",
      priceUSD: 35000, type: "integrated", size_mm: 41, wr_m: 50,
      movement: "Automatic (AP 4302)",
      cues: ["octagonal bezel", "tapisserie dial", "integrated bracelet", "exposed screws"],
      homages: [
        { name: "PD-1673", house: "Pagani Design", priceUSD: 144, size_mm: 40, wr_m: 100, movement: "Automatic (Seiko NH35)", fidelity: 78, priceSource: "paganidesign.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "octagonal bezel with the exposed screws and a tapisserie-style dial; the pattern is stamped rather than machined but the silhouette reads instantly; sapphire crystal at this price is unusual" },
        { name: "SN013-G", house: "San Martin", priceUSD: 375, size_mm: 38.5, wr_m: 100, movement: "Automatic (Miyota 9015)", fidelity: 83, priceSource: "sanmartinwatches.com", priceDate: "2026-08-12", amazon: true, direct: true, verified: "2026-08-12", note: "the closest bracelet integration in the field and a 9.5mm case that actually wears like the original; San Martin calls the bezel a Royal Oak/Nautilus hybrid rather than a straight copy, and at 38.5mm it is the smallest here" },
        { name: "C8180", house: "Cadisen", priceUSD: 87, size_mm: 42, wr_m: 100, movement: "Automatic (Seiko NH35A)", fidelity: 75, priceSource: "cadisenwatch.com", priceDate: "2026-08-12", amazon: true, verified: "2026-08-12", note: "the cheapest way into the octagonal-bezel look with a real Seiko automatic and an exhibition caseback; wears a full 42mm against the original's 41mm and the stamped waffle dial is a step behind Pagani's finishing, but 100m of water resistance is double what the original offers" }
      ]
    },
    {
      id: "tudor-black-bay", name: "Black Bay 58", house: "Tudor", ref: "79030N",
      priceUSD: 3900, type: "dive", size_mm: 39, wr_m: 200,
      movement: "Automatic (Tudor MT5402)",
      cues: ["dive", "snowflake hands", "gilt dial", "vintage diver", "domed crystal"],
      homages: [
        { name: "SN008-G", house: "San Martin", priceFrom: true, priceUSD: 326, size_mm: 40, wr_m: 200, movement: "Automatic (PT5000 / SW200)", fidelity: 85, priceSource: "sanmartinwatches.com", priceDate: "2026-08-13", amazon: true, direct: true, verified: "2026-08-13", note: "snowflake hands and a gilt dial that track the BB58 closely, on a Swiss-class movement; it wears 40mm against the original's 39, and the cheaper Seiko-powered version is a separate reference, the SN008-G-B" },
      ]
    },
    {
      id: "blancpain-fifty-fathoms", name: "Fifty Fathoms", house: "Blancpain", ref: "5015",
      priceUSD: 16000, type: "dive", size_mm: 45, wr_m: 300,
      movement: "Automatic (Blancpain 1315)",
      cues: ["dive", "domed sapphire bezel", "vintage diver", "large case"],
      homages: [
        { name: "SD1952", house: "Steeldive", priceUSD: 138, size_mm: 41, wr_m: 300, movement: "Automatic (Seiko NH35)", fidelity: 79, priceSource: "steeldive.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "budget route to the Fifty Fathoms look with a sapphire bezel insert and a real 300m rating — Steeldive names it a Fifty Fathoms homage on its own product page, the only first-party attribution in this field; at 41mm it wears far smaller than the original's 45" }
      ]
    },
    {
      id: "cartier-tank", name: "Tank Must", house: "Cartier", ref: "WSTA0041",
      priceUSD: 3200, type: "dress", size_mm: 34, wr_m: 30,
      movement: "Quartz / automatic",
      cues: ["rectangular case", "roman numerals", "blued hands", "dress", "leather strap"],
      homages: [
        { name: "TW2Y88200 (1976 Lexington Reissue)", house: "Timex", priceUSD: 149, size_mm: 21, wr_m: 30, movement: "Quartz", fidelity: 55, priceSource: "timex.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "not a Tank copy, but Timex's genuinely rectangular roman-numeral dress watch — a slim reissue case on a croc-grain strap; it is narrower than the Tank Must and was out of stock on Timex's own store at our last check. The round Marlin, usually recommended for this slot, is not a rectangular watch at all" },
        { name: "MTP-B190D-1BV", house: "Casio", priceUSD: 110, size_mm: 31.5, wr_m: 50, movement: "Quartz (Casio 5361)", fidelity: 58, priceSource: "casio.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "a spiritual budget stand-in for the roman-numeral dress look, on a steel bracelet with 50m of water resistance — more than the Cartier offers; its own design rather than a homage in the strict sense, and it only reached the US market in 2026, so stock comes and goes" }
      ]
    },
    {
      id: "iwc-big-pilot", name: "Big Pilot", house: "IWC", ref: "IW501001",
      priceUSD: 15000, type: "pilot", size_mm: 43, wr_m: 60,
      movement: "Automatic (IWC 52110)",
      cues: ["pilot", "onion crown", "triangle at 12", "flieger dial", "large case"],
      homages: [
        { name: "SD1940", house: "Steeldive", priceUSD: 130, size_mm: 39, wr_m: 200, movement: "Automatic (Seiko NH35)", fidelity: 72, amazon: true, verified: "2026-08-12", note: "strictly a Mark XVIII homage rather than a Big Pilot one — 39mm where the Big Pilot is 46mm, so it is the flieger dial language at a wearable size rather than the oversized original; sapphire and a real 200m rating" },
        { name: "SN095-G-DA", house: "San Martin", priceUSD: 218, size_mm: 44.5, wr_m: 100, movement: "Automatic (YN55A)", fidelity: 82, priceSource: "sanmartinwatches.com", priceDate: "2026-08-13", amazon: true, direct: true, verified: "2026-08-13", note: "the oversized onion crown and 3D Arabic numerals at a properly large 44.5mm — the only watch here that does not shrink the design to fit a normal wrist, and one of the few San Martins actually in stock" },
      ]
    },
    {
      id: "cartier-santos", name: "Santos", house: "Cartier", ref: "WSSA0009",
      priceUSD: 7500, type: "dress", size_mm: 40, wr_m: 100,
      movement: "Automatic (Cartier 1847 MC)",
      cues: ["square case", "exposed screws", "roman numerals", "integrated bracelet", "dress-sport"],
      homages: [
        { name: "SP0037A1", house: "Specht & Söhne", priceUSD: 278, size_mm: 37, wr_m: 50, movement: "Automatic (Miyota 8215)", fidelity: 81, priceSource: "spechtandsohnewatches.com", priceDate: "2026-08-13", amazon: false, direct: true, verified: "2026-08-13", note: "the closest square in the field — exposed bezel screws, roman dial and a screwed integrated bracelet on a workhorse Miyota automatic; it wears 37mm against the large Santos's 39.8mm and carries half the water resistance. Sold direct only — beware lookalike domains the brand itself flags as scams" },
        { name: "SP0011Q3", house: "Specht & Söhne", priceUSD: 134, size_mm: 34, wr_m: 50, movement: "Quartz (Seiko VH31)", fidelity: 62, priceSource: "spechtandsohnewatches.com", priceDate: "2026-08-13", amazon: false, direct: true, verified: "2026-08-13", note: "the smooth-bezel square — really a Santos-Dumont homage rather than the screwed-bezel modern watch: 8.6mm thin with a sweeping VH31 quartz, the dressier take; the brand's mid-range automatic squares sell out often" }
      ]
    },
    {
      id: "tudor-pelagos", name: "Pelagos", house: "Tudor", ref: "25600TN",
      priceUSD: 5000, type: "dive", size_mm: 42, wr_m: 500,
      movement: "Automatic (Tudor MT5612)",
      cues: ["titanium", "ceramic bezel", "snowflake hands", "500m dive", "square markers"],
      homages: [
        { name: "EXD-40", house: "Watchdives", priceUSD: 139, size_mm: 40, wr_m: 200, movement: "Quartz (Seiko VH31 sweep)", fidelity: 71, priceSource: "watchdives.com", priceDate: "2026-08-13", amazon: true, direct: true, verified: "2026-08-13", note: "grade-2 titanium with a 200m rating and sapphire for well under the field — but it is a VH31 sweep-second quartz, not an automatic, which is the honest gap against a Pelagos; also sold as the 38mm EXD-38" },
        { name: "SN0111-T-A1", house: "San Martin", priceFrom: true, priceUSD: 389, size_mm: 40, wr_m: 300, movement: "Automatic (PT5000 / SW200)", fidelity: 85, priceSource: "sanmartinwatches.com", priceDate: "2026-08-13", amazon: true, direct: true, verified: "2026-08-13", note: "grade-5 titanium with a helium escape valve and ceramic bezel, matching the original's 300m — the closest affordable Pelagos, though it wears 40mm against the original's 42 and there is no Seiko-powered version" }
      ]
    },
    {
      id: "rolex-explorer-ii", name: "Explorer II", house: "Rolex", ref: "226570",
      priceUSD: 9350, type: "gmt", size_mm: 42, wr_m: 100,
      movement: "Automatic GMT (Rolex 3285)",
      cues: ["24h fixed bezel", "orange gmt hand", "steve mcqueen", "tool gmt", "no cyclops"],
      homages: [
        { name: "TW2W53000 (Expedition Pioneer Titanium GMT)", house: "Timex", priceUSD: 629, size_mm: 41, wr_m: 200, movement: "Automatic GMT (Seiko NH34)", fidelity: 76, priceSource: "timex.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "titanium case, a real Seiko GMT movement and a sapphire crystal, from a mainstream brand with a warranty network; Timex has retired the Expedition North name for this piece but the reference carries across, and it is one of the few watches here actually in stock" },
        { name: "WD16570 V2 Pioneer", house: "Watchdives", priceUSD: 229, size_mm: 37, wr_m: 100, movement: "Automatic GMT (Seiko NH34)", fidelity: 81, priceSource: "watchdives.com", priceDate: "2026-08-13", amazon: true, direct: true, verified: "2026-08-13", note: "named straight after the 16570 reference and the closest dial in the field — enamel polar-white with the orange GMT hand, fixed 24h steel bezel and sapphire; it wears a compact 37mm against the original's 42mm, which is the one big honest gap" },
        { name: "PD-1693", house: "Pagani Design", priceUSD: 148, size_mm: 42, wr_m: 200, movement: "Automatic GMT (Seiko NH34)", fidelity: 77, priceSource: "paganidesign.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "the freccione orange 24-hour hand and fixed bezel at a fraction of the money, with sapphire and a real 200m rating; it wears 42mm, a size up on the modern original and two on the vintage one it echoes; out of stock on Pagani's own store at our last check" },
        { name: "SN0054-G-C2", house: "San Martin", priceFrom: true, priceUSD: 309, size_mm: 39, wr_m: 100, movement: "Automatic GMT (Seiko NH34)", fidelity: 75, priceSource: "sanmartinwatches.com", priceDate: "2026-08-13", amazon: true, direct: true, verified: "2026-08-13", note: "the watch the community means by a San Martin Explorer II — honestly a hybrid: fixed steel bezel, matte white or black dial and a true NH34 GMT, but Tudor-style snowflake hands and 39mm where the original is 42mm" },
        { name: "S6073AB", house: "Baltany", priceUSD: 283, size_mm: 39, wr_m: 200, movement: "Automatic GMT (Seiko NH34)", fidelity: 73, priceSource: "baltany.com", priceDate: "2026-08-13", amazon: true, direct: true, verified: "2026-08-13", note: "Baltany's only fixed-bezel GMT — the orange-hand tool-GMT look in a vintage-leaning 39mm case; periodically sells out direct, so check both stores" },
        { name: "SSK023 (Seiko 5 Field GMT)", house: "Seiko", priceUSD: 450, size_mm: 39.4, wr_m: 100, movement: "Automatic GMT (Seiko 4R34)", fidelity: 64, priceSource: "seikowatches.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "not a copy — the spiritual fixed-24h-bezel alternative from a real watchmaking house, with an in-house GMT caliber and its own red-hand dial identity; the polar-dial SSK059 sibling is a limited release that comes and goes" }
      ]
    },
    {
      id: "rolex-yacht-master", name: "Yacht-Master", house: "Rolex", ref: "126622",
      priceUSD: 12000, type: "dive", size_mm: 40, wr_m: 100,
      movement: "Automatic (Rolex 3235)",
      cues: ["bidirectional bezel", "sunburst dial", "oyster bracelet", "dressy diver", "raised bezel numerals"],
      homages: [
        { name: "PD-1651", house: "Pagani Design", priceUSD: 122, size_mm: 40, wr_m: 100, movement: "Automatic (Seiko NH35)", fidelity: 82, priceSource: "paganidesign.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "one of the visually closest Yacht-Master homages — bidirectional bezel, sunburst dial, oyster bracelet — with a Seiko auto for well under a hundred; out of stock on Pagani's own store at our last check" },
        { name: "C8210", house: "Cadisen", priceUSD: 105, size_mm: 40, wr_m: 100, movement: "Automatic (Seiko NH35A)", fidelity: 70, priceSource: "cadisenwatch.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "Cadisen's own catalog titles it Yacht-Master — a dressy rotating-bezel diver at the original's 40mm with sapphire and lume; its own dial colours rather than a strict copy, but the flavour is there" }
      ]
    },
    {
      id: "seiko-62mas", name: "62MAS (SPB reissue)", house: "Seiko", ref: "SPB143",
      priceUSD: 1200, type: "dive", size_mm: 40, wr_m: 200,
      movement: "Automatic (Seiko 6R35)",
      cues: ["vintage diver", "no crown guard", "wide bezel", "62mas", "grey or gilt dial"],
      homages: [
        { name: "SN007-G-V3", house: "San Martin", priceUSD: 238, size_mm: 40, wr_m: 200, movement: "Automatic (Seiko NH35 / NH36)", fidelity: 86, priceSource: "sanmartinwatches.com", priceDate: "2026-08-13", amazon: true, direct: true, verified: "2026-08-13", note: "the go-to 62MAS homage — 40mm, sapphire with AR coating, 200m, and finishing that punches well above the price; the 37mm SN007-G-X1 is usually the one in stock" },
        { name: "WD1965 V2", house: "Watchdives", priceUSD: 119, size_mm: 37, wr_m: 200, movement: "Quartz (Seiko VH31 sweep)", fidelity: 72, priceSource: "watchdives.com", priceDate: "2026-08-13", amazon: true, direct: true, verified: "2026-08-13", note: "the vintage-diver silhouette with a domed sapphire and a real 200m rating at the lowest price here; two honest caveats — it is a VH31 sweep-second quartz rather than an automatic, and the case is 37mm against the reissue's 40mm" }
      ]
    }
  ]
};
