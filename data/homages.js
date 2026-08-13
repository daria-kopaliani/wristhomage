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
        { name: "Pro Diver 8926OB", house: "Invicta", priceUSD: 95, size_mm: 40, wr_m: 200, movement: "Automatic (Seiko NH35-class)", fidelity: 80, amazon: true, note: "the classic entry Sub homage — coin-edge bezel, cyclops date, a workhorse Seiko-style auto for under a hundred dollars" },
        { name: "Ocean One 39", house: "Steinhart", priceUSD: 520, size_mm: 39, wr_m: 300, movement: "Automatic (Sellita SW200)", fidelity: 92, amazon: false, note: "the enthusiast benchmark — Swiss Sellita movement, ceramic bezel, proportions the community rates closest to the real thing" },
        { name: "SN0004-G", house: "San Martin", priceUSD: 260, size_mm: 40, wr_m: 200, movement: "Automatic (NH35 / PT5000 option)", fidelity: 88, amazon: true, direct: true, note: "sharp finishing for the money and a well-cut ceramic bezel; usually cheaper direct than through resellers" },
        { name: "SD1953", house: "Steeldive", priceUSD: 130, size_mm: 41, wr_m: 300, movement: "Automatic (Seiko NH35)", fidelity: 83, amazon: true, note: "genuine 300m diver with a ceramic bezel and Seiko auto — a lot of watch per dollar" },
        { name: "SRPE control (Seiko 5 dive)", house: "Seiko", priceUSD: 250, size_mm: 42.5, wr_m: 100, movement: "Automatic (Seiko 4R36)", fidelity: 58, amazon: true, note: "not a Sub copy — a spiritual budget diver the community reaches for instead; own identity, in-house auto" },
        { name: "AD2044 Diver", house: "Addiesdive", priceUSD: 95, size_mm: 41, wr_m: 200, movement: "Automatic (Seiko NH35)", fidelity: 77, amazon: true, direct: true, note: "a hugely popular budget Sub homage — ceramic bezel, sapphire, 200m and a Seiko auto; carried on Amazon, often cheaper still direct on AliExpress" }
      ]
    },
    {
      id: "rolex-gmt-master-ii", name: "GMT-Master II", house: "Rolex", ref: "126710BLRO",
      priceUSD: 10700, type: "gmt", size_mm: 40, wr_m: 100,
      movement: "Automatic GMT (Rolex 3285)",
      cues: ["gmt", "24h bezel", "pepsi", "jubilee bracelet", "true gmt"],
      homages: [
        { name: "PD-1662 (Pepsi GMT)", house: "Pagani Design", priceUSD: 115, size_mm: 40, wr_m: 100, movement: "Automatic GMT (Seiko NH34)", fidelity: 84, amazon: true, note: "the homage that made Pagani famous — a genuine NH34 GMT with a ceramic Pepsi bezel and jubilee, wildly over-delivering on price" },
        { name: "SN004-G GMT", house: "San Martin", priceUSD: 340, size_mm: 39, wr_m: 200, movement: "Automatic GMT (NH34)", fidelity: 87, amazon: true, direct: true, note: "tighter finishing and a slimmer case than the budget set; community-favourite mid-tier GMT" },
        { name: "Ocean One GMT", house: "Steinhart", priceUSD: 560, size_mm: 42, wr_m: 300, movement: "Automatic GMT (ETA 2893 / SW330)", fidelity: 86, amazon: false, note: "Swiss true-GMT movement and dive-grade WR; a step up in movement over the Seiko-based field" },
        { name: "Pepsi GMT (NH34)", house: "Addiesdive", priceUSD: 110, size_mm: 39, wr_m: 200, movement: "Automatic GMT (Seiko NH34)", fidelity: 80, amazon: true, direct: true, note: "a genuine NH34 GMT with a ceramic Pepsi bezel for around a hundred; carried on Amazon, often cheaper direct" }
      ]
    },
    {
      id: "rolex-daytona", name: "Daytona", house: "Rolex", ref: "126500LN",
      priceUSD: 15100, type: "chronograph", size_mm: 40, wr_m: 100,
      movement: "Automatic chronograph (Rolex 4131)",
      cues: ["chronograph", "tachymeter bezel", "panda dial", "three subdials"],
      homages: [
        { name: "PD-1664 (Chrono)", house: "Pagani Design", priceUSD: 105, size_mm: 40, wr_m: 100, movement: "Meca-quartz (Seiko VK63)", fidelity: 82, amazon: true, note: "panda dial and tachymeter bezel with a snappy meca-quartz chrono — the seconds hand sweeps, the pushers feel mechanical, and it costs almost nothing" },
        { name: "SN0116", house: "San Martin", priceUSD: 360, size_mm: 39.5, wr_m: 100, movement: "Meca-quartz (Seiko VK64)", fidelity: 83, amazon: true, direct: true, verified: "2026-08-12", note: "San Martin's panda chronograph: cleaner dial printing and a better bracelet than the budget tier, on a ceramic chronograph bezel; still meca-quartz, not an automatic chronograph" },
        { name: "Sugess Panda Chrono", house: "Sugess", priceUSD: 220, size_mm: 40, wr_m: 50, movement: "Mechanical chronograph (Seagull ST1901)", fidelity: 78, amazon: true, direct: true, note: "for purists who want a hand-wound mechanical column-wheel-style chrono instead of quartz; usually sourced direct" }
      ]
    },
    {
      id: "rolex-datejust", name: "Datejust", house: "Rolex", ref: "126234",
      priceUSD: 8200, type: "everyday", size_mm: 36, wr_m: 100,
      movement: "Automatic (Rolex 3235)",
      cues: ["fluted bezel", "jubilee bracelet", "cyclops date", "everyday dress"],
      homages: [
        { name: "PD-1645", house: "Pagani Design", priceUSD: 90, size_mm: 40, wr_m: 30, movement: "Automatic (Seiko NH35)", fidelity: 79, amazon: true, note: "fluted bezel, jubilee bracelet and cyclops date with a Seiko auto — the go-to affordable Datejust look, though it wears larger at 40mm" },
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
        { name: "PD-1752", house: "Pagani Design", priceUSD: 135, size_mm: 36, wr_m: 30, movement: "Automatic day-date (ST16-class)", fidelity: 82, amazon: true, note: "the one that keeps the 36mm President proportions — fluted bezel, president-style bracelet, day and date under sapphire for around $135" },
        { name: "PD-1783 (DD40)", house: "Pagani Design", priceUSD: 145, size_mm: 40, wr_m: 100, movement: "Automatic (Seiko NH36)", fidelity: 78, amazon: true, note: "the modern 40mm take with a proper NH36 day-date auto and a 100m rating; wears larger and sportier than the classic 36" },
        { name: "C8185", house: "Cadisen", priceUSD: 104, size_mm: 40, wr_m: 100, movement: "Automatic day-date (Miyota 8285)", fidelity: 74, priceSource: "cadisenwatch.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "Cadisen's presidential-style day-date on a genuine Miyota 8285, with a dial range the segment is famous for — full gold, meteorite white and Tiffany blue — plus sapphire and a 100m rating at 40mm" },
        { name: "Contemporary day-date (RA-AA0C)", house: "Orient", priceUSD: 180, size_mm: 42, wr_m: 50, movement: "Automatic (Orient F6922)", fidelity: 55, amazon: true, note: "not a President copy — the honest budget day-date automatic the community reaches for since the old Orient President left the catalog; own identity, in-house auto" }
      ]
    },
    {
      id: "rolex-oyster-perpetual", name: "Oyster Perpetual 41", house: "Rolex", ref: "124300",
      priceUSD: 6500, type: "everyday", size_mm: 41, wr_m: 100,
      movement: "Automatic (Rolex 3230)",
      cues: ["time-only", "bright lacquer dial", "oyster bracelet", "no date"],
      homages: [
        { name: "PD-1690", house: "Pagani Design", priceUSD: 140, size_mm: 38, wr_m: 200, movement: "Automatic (Seiko NH35)", fidelity: 86, amazon: true, note: "the turquoise-dial favourite that rode the Tiffany-OP craze — clean time-only dial, real 200m rating and an NH35 auto for around $140" },
        { name: "5 Sports control (SRPE dress)", house: "Seiko", priceUSD: 250, size_mm: 40, wr_m: 100, movement: "Automatic (Seiko 4R36)", fidelity: 52, amazon: true, note: "not an OP copy — the budget time-and-date automatic the community cross-shops instead; own identity, in-house auto" }
      ]
    },
    {
      id: "rolex-explorer", name: "Explorer", house: "Rolex", ref: "124270",
      priceUSD: 7700, type: "field", size_mm: 36, wr_m: 100,
      movement: "Automatic (Rolex 3230)",
      cues: ["3-6-9 dial", "oyster bracelet", "field", "no date"],
      homages: [
        { name: "PD-1751", house: "Pagani Design", priceUSD: 100, size_mm: 36, wr_m: 200, movement: "Automatic (Seiko NH35)", fidelity: 76, amazon: true, verified: "2026-08-12", note: "a clean 36mm three-hander with sapphire and a genuine 200m rating for around a hundred dollars; Pagani markets it as a Ranger homage rather than an Explorer one, and the 3-6-9 dial language serves both — read it as the shape rather than a line-for-line copy" },
        { name: "SN021-G", house: "San Martin", priceFrom: true, priceUSD: 299, size_mm: 36, wr_m: 100, movement: "Automatic (PT5000 / SW200)", fidelity: 86, priceSource: "sanmartinwatches.com", priceDate: "2026-08-12", amazon: true, direct: true, verified: "2026-08-12", note: "the community default for a 36mm Explorer: a Swiss-class PT5000 or SW200 rather than a Seiko auto, top-hat sapphire with AR, and 11mm thick so it wears like the original rather than a modern reissue" },
        { name: "Baltany Field 36", house: "Baltany", priceUSD: 180, size_mm: 36, wr_m: 100, movement: "Automatic (Seiko NH35)", fidelity: 76, amazon: true, direct: true, note: "vintage-leaning take with a domed crystal; usually cheaper direct on AliExpress" }
      ]
    },
    {
      id: "omega-speedmaster", name: "Speedmaster Moonwatch", house: "Omega", ref: "310.30.42",
      priceUSD: 7000, type: "chronograph", size_mm: 42, wr_m: 50,
      movement: "Manual chronograph (Omega 3861)",
      cues: ["chronograph", "tachymeter", "black dial", "moonwatch", "manual wind"],
      homages: [
        { name: "PD-1963 Moon Chrono", house: "Pagani Design", priceUSD: 110, size_mm: 40, wr_m: 30, movement: "Meca-quartz (Seiko VK63)", fidelity: 80, amazon: true, note: "the Moonwatch look — stepped dial, tachymeter bezel, straight lugs — in a meca-quartz for pocket change; not hand-wound but the dial layout is close" },
        { name: "1963 Chrono", house: "Sugess", priceUSD: 230, size_mm: 40, wr_m: 30, movement: "Mechanical chronograph (Seagull ST1901)", fidelity: 84, amazon: true, direct: true, note: "hand-wound column-wheel-style mechanical chrono — the enthusiast pick when you want the winding ritual, based on the storied Chinese 1963 pilot chrono" },
        { name: "SN0103", house: "San Martin", priceUSD: 370, size_mm: 39.5, wr_m: 100, movement: "Meca-quartz (Seiko VK64)", fidelity: 81, amazon: true, direct: true, note: "best build quality of the affordable Speedy set; sapphire and a solid bracelet, still quartz-hybrid" }
      ]
    },
    {
      id: "omega-seamaster-300m", name: "Seamaster Diver 300M", house: "Omega", ref: "210.30.42",
      priceUSD: 5600, type: "dive", size_mm: 42, wr_m: 300,
      movement: "Automatic (Omega 8800)",
      cues: ["dive", "wave dial", "skeleton hands", "helium valve", "rotating bezel"],
      homages: [
        { name: "PD-1685", house: "Pagani Design", priceUSD: 190, size_mm: 42, wr_m: 200, movement: "Automatic (Seiko NH35A)", fidelity: 80, priceSource: "paganidesign.com", priceDate: "2026-08-12", amazon: true, verified: "2026-08-12", note: "the genuine article in this field: a real wave-textured dial, ceramic bezel and curved sapphire, at exactly the original's 42mm and double its rated depth" },
      ]
    },
    {
      id: "patek-nautilus", name: "Nautilus", house: "Patek Philippe", ref: "5711/1A",
      priceUSD: 35000, type: "integrated", size_mm: 40, wr_m: 120,
      movement: "Automatic (Patek 26-330)",
      cues: ["integrated bracelet", "porthole case", "horizontal-groove dial", "luxury sport"],
      homages: [
        { name: "PD-1728", house: "Pagani Design", priceUSD: 105, size_mm: 40, wr_m: 100, movement: "Automatic (Seagull ST6)", fidelity: 80, amazon: true, verified: "2026-08-12", note: "the porthole case, ears and grooved dial in steel with an integrated bracelet — the reason Pagani sells out; wears close to the original's 40mm" },
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
        { name: "PD-1673", house: "Pagani Design", priceUSD: 158, size_mm: 40, wr_m: 100, movement: "Automatic (Seiko NH35)", fidelity: 78, priceSource: "paganidesign.com", priceDate: "2026-08-12", amazon: true, verified: "2026-08-12", note: "octagonal bezel with the exposed screws and a tapisserie-style dial; the pattern is stamped rather than machined but the silhouette reads instantly; sapphire crystal at this price is unusual" },
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
        { name: "SN008", house: "San Martin", priceUSD: 280, size_mm: 39, wr_m: 200, movement: "Automatic (NH35 / PT5000)", fidelity: 86, amazon: true, direct: true, note: "snowflake hands, gilt dial and a 39mm case that tracks the BB58 closely; a long-time community darling" },
      ]
    },
    {
      id: "blancpain-fifty-fathoms", name: "Fifty Fathoms", house: "Blancpain", ref: "5015",
      priceUSD: 16000, type: "dive", size_mm: 45, wr_m: 300,
      movement: "Automatic (Blancpain 1315)",
      cues: ["dive", "domed sapphire bezel", "vintage diver", "large case"],
      homages: [
        { name: "Fifty Fathoms 43", house: "San Martin", priceUSD: 330, size_mm: 43, wr_m: 200, movement: "Automatic (NH35 / PT5000)", fidelity: 83, amazon: true, direct: true, note: "the domed sapphire bezel and dial furniture are close; sized down a touch from the original's larger case for real wrists" },
        { name: "SD1952 Fathom", house: "Steeldive", priceUSD: 150, size_mm: 43, wr_m: 300, movement: "Automatic (Seiko NH35)", fidelity: 79, amazon: true, note: "budget route to the Fifty Fathoms look with a sapphire bezel insert and 300m WR" }
      ]
    },
    {
      id: "cartier-tank", name: "Tank Must", house: "Cartier", ref: "WSTA0041",
      priceUSD: 3200, type: "dress", size_mm: 34, wr_m: 30,
      movement: "Quartz / automatic",
      cues: ["rectangular case", "roman numerals", "blued hands", "dress", "leather strap"],
      homages: [
        { name: "Marlin 34", house: "Timex", priceUSD: 130, size_mm: 34, wr_m: 30, movement: "Quartz / hand-wind", fidelity: 60, amazon: true, note: "not a Tank copy, but the go-to affordable rectangular/vintage-dress alternative when you want that flavour on a strap" },
        { name: "Rectangular Dress (Roman)", house: "Casio", priceUSD: 45, size_mm: 33, wr_m: 30, movement: "Quartz", fidelity: 55, amazon: true, note: "a spiritual budget stand-in for the roman-numeral dress look; own identity, not a homage in the strict sense" }
      ]
    },
    {
      id: "iwc-big-pilot", name: "Big Pilot", house: "IWC", ref: "IW501001",
      priceUSD: 15000, type: "pilot", size_mm: 43, wr_m: 60,
      movement: "Automatic (IWC 52110)",
      cues: ["pilot", "onion crown", "triangle at 12", "flieger dial", "large case"],
      homages: [
        { name: "SD1940", house: "Steeldive", priceUSD: 130, size_mm: 39, wr_m: 200, movement: "Automatic (Seiko NH35)", fidelity: 72, amazon: true, verified: "2026-08-12", note: "strictly a Mark XVIII homage rather than a Big Pilot one — 39mm where the Big Pilot is 46mm, so it is the flieger dial language at a wearable size rather than the oversized original; sapphire and a real 200m rating" },
        { name: "PD-1703", house: "Pagani Design", priceUSD: 110, size_mm: 42, wr_m: 100, movement: "Automatic (Seiko NH35)", fidelity: 80, amazon: true, note: "the Big Pilot look — oversized onion crown, triangle and dots at 12, clean flieger dial — with a Seiko auto for around a hundred dollars" },
        { name: "Big Pilot 43", house: "San Martin", priceUSD: 330, size_mm: 43, wr_m: 100, movement: "Automatic (PT5000 / Miyota 9015)", fidelity: 85, amazon: true, direct: true, note: "the refined take, with sharper case finishing and a smoother movement; the community's default above the budget tier" },
        { name: "Flieger 40", house: "Baltany", priceUSD: 190, size_mm: 40, wr_m: 100, movement: "Automatic (Seiko NH35)", fidelity: 70, amazon: true, direct: true, note: "a smaller, more wearable flieger in the same spirit rather than a strict Big Pilot copy; usually cheaper direct" }
      ]
    },
    {
      id: "cartier-santos", name: "Santos", house: "Cartier", ref: "WSSA0009",
      priceUSD: 7500, type: "dress", size_mm: 40, wr_m: 100,
      movement: "Automatic (Cartier 1847 MC)",
      cues: ["square case", "exposed screws", "roman numerals", "integrated bracelet", "dress-sport"],
      homages: [
        { name: "SP0037A1", house: "Specht & Söhne", priceUSD: 278, size_mm: 37, wr_m: 50, movement: "Automatic (Miyota 8215)", fidelity: 81, priceSource: "spechtandsohnewatches.com", priceDate: "2026-08-13", amazon: false, direct: true, verified: "2026-08-13", note: "the closest square in the field — exposed bezel screws, roman dial and a screwed integrated bracelet on a workhorse Miyota automatic; it wears 37mm against the large Santos's 39.8mm and carries half the water resistance. Sold direct only — beware lookalike domains the brand itself flags as scams" },
        { name: "PD-1644", house: "Pagani Design", priceUSD: 100, size_mm: 40, wr_m: 30, movement: "Quartz (Japanese)", fidelity: 80, amazon: true, note: "the square bezel with exposed screws, roman-numeral dial and an integrated bracelet; the affordable Santos look, kept slim with a quartz movement" },
        { name: "SP0011Q3", house: "Specht & Söhne", priceUSD: 134, size_mm: 34, wr_m: 50, movement: "Quartz (Seiko VH31)", fidelity: 62, priceSource: "spechtandsohnewatches.com", priceDate: "2026-08-13", amazon: false, direct: true, verified: "2026-08-13", note: "the smooth-bezel square — really a Santos-Dumont homage rather than the screwed-bezel modern watch: 8.6mm thin with a sweeping VH31 quartz, the dressier take; the brand's mid-range automatic squares sell out often" }
      ]
    },
    {
      id: "tudor-pelagos", name: "Pelagos", house: "Tudor", ref: "25600TN",
      priceUSD: 5000, type: "dive", size_mm: 42, wr_m: 500,
      movement: "Automatic (Tudor MT5612)",
      cues: ["titanium", "ceramic bezel", "snowflake hands", "500m dive", "square markers"],
      homages: [
        { name: "EXD Titanium", house: "Watchdives", priceUSD: 150, size_mm: 42, wr_m: 200, movement: "Automatic (Seiko NH35)", fidelity: 82, amazon: true, direct: true, note: "titanium case, ceramic bezel and snowflake hands for $150 — the community's surprise-value Pelagos alternative, sold direct" },
        { name: "Pelagos (titanium)", house: "San Martin", priceUSD: 300, size_mm: 42, wr_m: 300, movement: "Automatic (NH35 / PT5000)", fidelity: 85, amazon: true, direct: true, note: "titanium with a ceramic bezel and better finishing; widely rated the closest affordable Pelagos" }
      ]
    },
    {
      id: "rolex-explorer-ii", name: "Explorer II", house: "Rolex", ref: "226570",
      priceUSD: 9350, type: "gmt", size_mm: 42, wr_m: 100,
      movement: "Automatic GMT (Rolex 3285)",
      cues: ["24h fixed bezel", "orange gmt hand", "steve mcqueen", "tool gmt", "no cyclops"],
      homages: [
        { name: "Expedition North GMT Titanium", house: "Timex", priceUSD: 550, size_mm: 41, wr_m: 200, movement: "Automatic GMT (Seiko NH34)", fidelity: 76, amazon: true, note: "titanium case, a real Seiko GMT movement and a 24h bezel with clear Steve McQueen Explorer II styling; a genuinely good tool GMT, not just a lookalike" },
        { name: "WD16570 V2 Pioneer", house: "Watchdives", priceUSD: 229, size_mm: 37, wr_m: 100, movement: "Automatic GMT (Seiko NH34)", fidelity: 81, priceSource: "watchdives.com", priceDate: "2026-08-13", amazon: true, direct: true, verified: "2026-08-13", note: "named straight after the 16570 reference and the closest dial in the field — enamel polar-white with the orange GMT hand, fixed 24h steel bezel and sapphire; it wears a compact 37mm against the original's 42mm, which is the one big honest gap" },
        { name: "PD-1693", house: "Pagani Design", priceUSD: 90, size_mm: 42, wr_m: 200, movement: "Automatic GMT (Seiko NH34)", fidelity: 77, amazon: true, verified: "2026-08-12", note: "the freccione orange 24-hour hand and fixed bezel at a fraction of the money, with sapphire and a real 200m rating; it wears 42mm, a size up on the modern original and two on the vintage one it echoes" },
        { name: "SN0054-G-C2", house: "San Martin", priceFrom: true, priceUSD: 309, size_mm: 39, wr_m: 100, movement: "Automatic GMT (Seiko NH34)", fidelity: 75, priceSource: "sanmartinwatches.com", priceDate: "2026-08-13", amazon: true, direct: true, verified: "2026-08-13", note: "the watch the community means by a San Martin Explorer II — honestly a hybrid: fixed steel bezel, matte white or black dial and a true NH34 GMT, but Tudor-style snowflake hands and 39mm where the original is 42mm" },
        { name: "S6073AB", house: "Baltany", priceUSD: 283, size_mm: 39, wr_m: 200, movement: "Automatic GMT (Seiko NH34)", fidelity: 73, priceSource: "baltany.com", priceDate: "2026-08-13", amazon: true, direct: true, verified: "2026-08-13", note: "Baltany's only fixed-bezel GMT — the orange-hand tool-GMT look in a vintage-leaning 39mm case; periodically sells out direct, so check both stores" },
        { name: "SSK023 (Seiko 5 Field GMT)", house: "Seiko", priceUSD: 450, size_mm: 39.4, wr_m: 100, movement: "Automatic GMT (Seiko 4R34)", fidelity: 64, priceSource: "seikowatches.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "not a copy — the spiritual fixed-24h-bezel alternative from a real watchmaking house, with an in-house GMT caliber and its own red-hand dial identity; the polar-dial SSK059 sibling is a limited release that comes and goes" }
      ]
    },
    {
      id: "panerai-luminor", name: "Luminor Marina", house: "Panerai", ref: "PAM01312",
      priceUSD: 8500, type: "dive", size_mm: 44, wr_m: 300,
      movement: "Automatic (Panerai P.9010)",
      cues: ["cushion case", "crown-guard lever", "sandwich dial", "large case", "minimalist"],
      homages: [
        { name: "SN041", house: "San Martin", priceUSD: 320, size_mm: 44, wr_m: 200, movement: "Automatic (NH35 / PT5000)", fidelity: 85, amazon: true, direct: true, note: "the sandwich dial and case finishing enthusiasts rate closest; a clear step up in bracelet and lume, sold direct" },
        { name: "Cushion Diver", house: "Addiesdive", priceUSD: 95, size_mm: 44, wr_m: 200, movement: "Automatic (Seiko NH35)", fidelity: 75, amazon: true, direct: true, note: "the value pick — the Luminor silhouette for under a hundred; carried on Amazon, though often cheaper still direct on AliExpress" }
      ]
    },
    {
      id: "omega-seamaster-300-heritage", name: "Seamaster 300 (Heritage)", house: "Omega", ref: "234.30.41",
      priceUSD: 7600, type: "dive", size_mm: 41, wr_m: 300,
      movement: "Automatic (Omega 8912)",
      cues: ["vintage diver", "broad-arrow hands", "no crown guard", "sword seconds", "faux-patina"],
      homages: [
        { name: "Vintage Diver SN011", house: "San Martin", priceUSD: 300, size_mm: 41, wr_m: 200, movement: "Automatic (Seiko NH35)", fidelity: 85, amazon: true, direct: true, note: "a well-judged take on the vintage diver with broad-arrow hands and mostly brushed surfaces; the community favourite, sold direct" },
        { name: "1957 Diver", house: "Steeldive", priceUSD: 150, size_mm: 41, wr_m: 200, movement: "Automatic (Seiko NH35)", fidelity: 80, amazon: true, note: "the vintage Seamaster look with a ceramic bezel over aluminium and no fragile lume pip; a lot of diver for the money" }
      ]
    },
    {
      id: "rolex-yacht-master", name: "Yacht-Master", house: "Rolex", ref: "126622",
      priceUSD: 12000, type: "dive", size_mm: 40, wr_m: 100,
      movement: "Automatic (Rolex 3235)",
      cues: ["bidirectional bezel", "sunburst dial", "oyster bracelet", "dressy diver", "raised bezel numerals"],
      homages: [
        { name: "PD-1651", house: "Pagani Design", priceUSD: 95, size_mm: 40, wr_m: 100, movement: "Automatic (Seiko NH35)", fidelity: 82, amazon: true, verified: "2026-08-12", note: "one of the visually closest Yacht-Master homages — bidirectional bezel, sunburst dial, oyster bracelet — with a Seiko auto for well under a hundred" },
        { name: "C8210", house: "Cadisen", priceUSD: 105, size_mm: 40, wr_m: 100, movement: "Automatic (Seiko NH35A)", fidelity: 70, priceSource: "cadisenwatch.com", priceDate: "2026-08-13", amazon: true, verified: "2026-08-13", note: "Cadisen's own catalog titles it Yacht-Master — a dressy rotating-bezel diver at the original's 40mm with sapphire and lume; its own dial colours rather than a strict copy, but the flavour is there" }
      ]
    },
    {
      id: "seiko-62mas", name: "62MAS (SPB reissue)", house: "Seiko", ref: "SPB143",
      priceUSD: 1200, type: "dive", size_mm: 40, wr_m: 200,
      movement: "Automatic (Seiko 6R35)",
      cues: ["vintage diver", "no crown guard", "wide bezel", "62mas", "grey or gilt dial"],
      homages: [
        { name: "62MAS SN007", house: "San Martin", priceUSD: 180, size_mm: 40, wr_m: 200, movement: "Automatic (Seiko NH35)", fidelity: 86, amazon: true, direct: true, note: "the go-to 62MAS homage — 40mm, sapphire with AR coating, 200m, and finishing that punches well above the price; sold direct" },
        { name: "62MAS Diver", house: "Watchdives", priceUSD: 150, size_mm: 40, wr_m: 200, movement: "Automatic (Seiko NH35)", fidelity: 82, amazon: true, direct: true, note: "the same vintage-diver silhouette at a lower price, sold direct; a frequent value recommendation" }
      ]
    },
    {
      id: "omega-aqua-terra", name: "Aqua Terra", house: "Omega", ref: "220.10.38",
      priceUSD: 6200, type: "everyday", size_mm: 38, wr_m: 150,
      movement: "Automatic (Omega 8800)",
      cues: ["teak-striped dial", "dressy sport", "twisted lugs", "date", "sword hands"],
      homages: [
        { name: "SN0113W", house: "San Martin", priceUSD: 300, size_mm: 38, wr_m: 100, movement: "Automatic (Seiko NH35)", fidelity: 85, amazon: true, direct: true, note: "the teak-striped dial and twisted lugs of the Aqua Terra in a tidy 38mm; a longtime community favourite, sold direct" },
        { name: "Teak Dress 39", house: "Baltany", priceUSD: 185, size_mm: 39, wr_m: 100, movement: "Automatic (Seiko NH35)", fidelity: 74, amazon: true, direct: true, note: "the striped-dial dressy-sport look at a lower price; its own dial identity rather than a strict copy, sold direct" }
      ]
    },
    {
      id: "longines-legend-diver", name: "Legend Diver", house: "Longines", ref: "L3.774",
      priceUSD: 2600, type: "dive", size_mm: 42, wr_m: 300,
      movement: "Automatic (Longines L888)",
      cues: ["super-compressor", "internal rotating bezel", "twin crowns", "vintage diver", "domed crystal"],
      homages: [
        { name: "Legend Diver 39", house: "San Martin", priceUSD: 230, size_mm: 39, wr_m: 200, movement: "Automatic (Seiko NH35)", fidelity: 84, amazon: true, direct: true, note: "the super-compressor look with an internal rotating bezel and twin crowns, in a wearable 39mm; a well-liked homage, sold direct" },
        { name: "Compressor 39", house: "Baltany", priceUSD: 185, size_mm: 39, wr_m: 200, movement: "Automatic (Seiko NH35)", fidelity: 76, amazon: true, direct: true, note: "the twin-crown compressor style at a lower price; its own dial identity rather than a strict copy, sold direct" }
      ]
    },
    {
      id: "iwc-portugieser", name: "Portugieser", house: "IWC", ref: "IW500",
      priceUSD: 8000, type: "dress", size_mm: 40, wr_m: 30,
      movement: "Automatic (IWC 82200)",
      cues: ["arabic numerals", "railroad minute track", "leaf hands", "clean dress", "slim case"],
      homages: [
        { name: "Portugieser 40", house: "San Martin", priceUSD: 200, size_mm: 40, wr_m: 50, movement: "Automatic (NH35 / PT5000)", fidelity: 84, amazon: true, direct: true, note: "the clean Arabic-numeral dial, railroad track and leaf hands; a sharp, well-priced dress homage, sold direct" },
        { name: "Portugieser Chrono", house: "Sugess", priceUSD: 220, size_mm: 41, wr_m: 30, movement: "Mechanical chronograph (Seagull ST19)", fidelity: 79, amazon: true, direct: true, note: "the chronograph take with a hand-wound Seagull movement for the winding ritual; sold direct" }
      ]
    },
    {
      id: "rolex-milgauss", name: "Milgauss", house: "Rolex", ref: "116400GV",
      priceUSD: 9500, type: "everyday", size_mm: 40, wr_m: 100,
      movement: "Automatic (Rolex 3131, antimagnetic)",
      cues: ["lightning-bolt seconds", "green sapphire", "orange accents", "antimagnetic", "smooth bezel"],
      homages: [
        { name: "Lightning 40", house: "San Martin", priceUSD: 300, size_mm: 40, wr_m: 100, movement: "Automatic (Seiko NH35)", fidelity: 82, amazon: true, direct: true, note: "the lightning-bolt seconds hand, orange accents and green-tinted crystal edge that make the Milgauss instantly recognisable; sold direct" },
        { name: "Bolt Antimagnetic", house: "Baltany", priceUSD: 190, size_mm: 39, wr_m: 100, movement: "Automatic (Seiko NH35)", fidelity: 72, amazon: true, direct: true, note: "the lightning-hand look at a budget price; its own dial rather than a strict copy, sold direct" }
      ]
    }
  ]
};
