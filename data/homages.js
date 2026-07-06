/* wristhomage — HOMAGE_DATA
 *
 * Every homage is a real, currently-sold product. priceUSD is an approximate
 * street price (watch prices drift — the page says "approx, check the listing").
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
        { name: "Pro Diver 8926OB", house: "Invicta", priceUSD: 95, size_mm: 40, wr_m: 200, movement: "Automatic (Seiko NH35-class)", fidelity: 80, amazon: true, note: "the classic entry Sub homage — coin-edge bezel, cyclops date, a workhorse Seiko-style auto for under a hundred dollars" },
        { name: "Ocean One 39", house: "Steinhart", priceUSD: 520, size_mm: 39, wr_m: 300, movement: "Automatic (Sellita SW200)", fidelity: 92, amazon: false, note: "the enthusiast benchmark — Swiss Sellita movement, ceramic bezel, proportions the community rates closest to the real thing" },
        { name: "SN0004-G", house: "San Martin", priceUSD: 260, size_mm: 40, wr_m: 200, movement: "Automatic (NH35 / PT5000 option)", fidelity: 88, amazon: false, direct: true, note: "sharp finishing for the money and a well-cut ceramic bezel; usually cheaper direct than through resellers" },
        { name: "SD1953", house: "Steeldive", priceUSD: 130, size_mm: 41, wr_m: 300, movement: "Automatic (Seiko NH35)", fidelity: 83, amazon: true, note: "genuine 300m diver with a ceramic bezel and Seiko auto — a lot of watch per dollar" },
        { name: "SRPE control (Seiko 5 dive)", house: "Seiko", priceUSD: 250, size_mm: 42.5, wr_m: 100, movement: "Automatic (Seiko 4R36)", fidelity: 58, amazon: true, note: "not a Sub copy — a spiritual budget diver the community reaches for instead; own identity, in-house auto" }
      ]
    },
    {
      id: "rolex-gmt-master-ii", name: "GMT-Master II", house: "Rolex", ref: "126710BLRO",
      priceUSD: 10700, type: "gmt", size_mm: 40, wr_m: 100,
      movement: "Automatic GMT (Rolex 3285)",
      cues: ["gmt", "24h bezel", "pepsi", "jubilee bracelet", "true gmt"],
      homages: [
        { name: "PD-1662 (Pepsi GMT)", house: "Pagani Design", priceUSD: 115, size_mm: 40, wr_m: 100, movement: "Automatic GMT (Seiko NH34)", fidelity: 84, amazon: true, note: "the homage that made Pagani famous — a genuine NH34 GMT with a ceramic Pepsi bezel and jubilee, wildly over-delivering on price" },
        { name: "SN004-G GMT", house: "San Martin", priceUSD: 340, size_mm: 39, wr_m: 200, movement: "Automatic GMT (NH34)", fidelity: 87, amazon: false, direct: true, note: "tighter finishing and a slimmer case than the budget set; community-favourite mid-tier GMT" },
        { name: "Ocean One GMT", house: "Steinhart", priceUSD: 560, size_mm: 42, wr_m: 300, movement: "Automatic GMT (ETA 2893 / SW330)", fidelity: 86, amazon: false, note: "Swiss true-GMT movement and dive-grade WR; a step up in movement over the Seiko-based field" }
      ]
    },
    {
      id: "rolex-daytona", name: "Daytona", house: "Rolex", ref: "126500LN",
      priceUSD: 15100, type: "chronograph", size_mm: 40, wr_m: 100,
      movement: "Automatic chronograph (Rolex 4131)",
      cues: ["chronograph", "tachymeter bezel", "panda dial", "three subdials"],
      homages: [
        { name: "PD-1664 (Chrono)", house: "Pagani Design", priceUSD: 105, size_mm: 40, wr_m: 100, movement: "Meca-quartz (Seiko VK63)", fidelity: 82, amazon: true, note: "panda dial and tachymeter bezel with a snappy meca-quartz chrono — the seconds hand sweeps, the pushers feel mechanical, and it costs almost nothing" },
        { name: "SN021 Chrono", house: "San Martin", priceUSD: 360, size_mm: 40, wr_m: 100, movement: "Meca-quartz (Seiko VK64)", fidelity: 83, amazon: false, direct: true, note: "cleaner dial printing and better bracelet than the budget tier; still meca-quartz, not automatic" },
        { name: "Sugess Panda Chrono", house: "Sugess", priceUSD: 220, size_mm: 40, wr_m: 50, movement: "Mechanical chronograph (Seagull ST1901)", fidelity: 78, amazon: false, direct: true, note: "for purists who want a hand-wound mechanical column-wheel-style chrono instead of quartz; usually sourced direct" }
      ]
    },
    {
      id: "rolex-datejust", name: "Datejust", house: "Rolex", ref: "126234",
      priceUSD: 8200, type: "everyday", size_mm: 36, wr_m: 100,
      movement: "Automatic (Rolex 3235)",
      cues: ["fluted bezel", "jubilee bracelet", "cyclops date", "everyday dress"],
      homages: [
        { name: "PD-1645", house: "Pagani Design", priceUSD: 90, size_mm: 40, wr_m: 30, movement: "Automatic (Seiko NH35)", fidelity: 79, amazon: true, note: "fluted bezel, jubilee bracelet and cyclops date with a Seiko auto — the go-to affordable Datejust look, though it wears larger at 40mm" },
        { name: "C1032", house: "Cadisen", priceUSD: 130, size_mm: 40, wr_m: 50, movement: "Automatic (Seiko NH35 / Miyota)", fidelity: 74, amazon: true, note: "another sub-$150 Datejust-style auto; finishing is a notch below Pagani but the sizing options are handy" },
        { name: "SN054", house: "San Martin", priceUSD: 300, size_mm: 36, wr_m: 100, movement: "Automatic (PT5000 / Miyota 9015)", fidelity: 85, amazon: false, direct: true, note: "the one that nails the 36mm proportions the original is known for, with a much better movement and bracelet" }
      ]
    },
    {
      id: "rolex-explorer", name: "Explorer", house: "Rolex", ref: "124270",
      priceUSD: 7700, type: "field", size_mm: 36, wr_m: 100,
      movement: "Automatic (Rolex 3230)",
      cues: ["3-6-9 dial", "oyster bracelet", "field", "no date"],
      homages: [
        { name: "PD-1693", house: "Pagani Design", priceUSD: 90, size_mm: 36, wr_m: 100, movement: "Automatic (Seiko NH35)", fidelity: 83, amazon: true, note: "one of Pagani's best-proportioned pieces — correct 36mm, clean 3-6-9 dial, no date window to spoil the symmetry" },
        { name: "SN017", house: "San Martin", priceUSD: 290, size_mm: 36, wr_m: 100, movement: "Automatic (PT5000)", fidelity: 86, amazon: false, direct: true, note: "sapphire, better lume and a Swiss PT5000 (an ETA 2824 workalike); the community's default Explorer homage above the budget tier" },
        { name: "Baltany Field 36", house: "Baltany", priceUSD: 180, size_mm: 36, wr_m: 100, movement: "Automatic (Seiko NH35)", fidelity: 76, amazon: false, direct: true, note: "vintage-leaning take with a domed crystal; usually cheaper direct on AliExpress" }
      ]
    },
    {
      id: "omega-speedmaster", name: "Speedmaster Moonwatch", house: "Omega", ref: "310.30.42",
      priceUSD: 7000, type: "chronograph", size_mm: 42, wr_m: 50,
      movement: "Manual chronograph (Omega 3861)",
      cues: ["chronograph", "tachymeter", "black dial", "moonwatch", "manual wind"],
      homages: [
        { name: "PD-1963 Moon Chrono", house: "Pagani Design", priceUSD: 110, size_mm: 40, wr_m: 30, movement: "Meca-quartz (Seiko VK63)", fidelity: 80, amazon: true, note: "the Moonwatch look — stepped dial, tachymeter bezel, straight lugs — in a meca-quartz for pocket change; not hand-wound but the dial layout is close" },
        { name: "1963 Chrono", house: "Sugess", priceUSD: 230, size_mm: 40, wr_m: 30, movement: "Mechanical chronograph (Seagull ST1901)", fidelity: 84, amazon: false, direct: true, note: "hand-wound column-wheel-style mechanical chrono — the enthusiast pick when you want the winding ritual, based on the storied Chinese 1963 pilot chrono" },
        { name: "SN021 Speedy", house: "San Martin", priceUSD: 370, size_mm: 40, wr_m: 100, movement: "Meca-quartz (Seiko VK64)", fidelity: 81, amazon: false, direct: true, note: "best build quality of the affordable Speedy set; sapphire and a solid bracelet, still quartz-hybrid" }
      ]
    },
    {
      id: "omega-seamaster-300m", name: "Seamaster Diver 300M", house: "Omega", ref: "210.30.42",
      priceUSD: 5600, type: "dive", size_mm: 42, wr_m: 300,
      movement: "Automatic (Omega 8800)",
      cues: ["dive", "wave dial", "skeleton hands", "helium valve", "rotating bezel"],
      homages: [
        { name: "SD1970 (Wave Diver)", house: "Steeldive", priceUSD: 140, size_mm: 41, wr_m: 300, movement: "Automatic (Seiko NH35)", fidelity: 82, amazon: true, note: "the wave-textured dial and skeleton hands are unmistakable; a real 300m diver with ceramic bezel and Seiko auto" },
        { name: "SN062", house: "San Martin", priceUSD: 320, size_mm: 41, wr_m: 200, movement: "Automatic (NH35 / PT5000)", fidelity: 84, amazon: false, direct: true, note: "crisper wave dial and applied markers; the mid-tier step up with better finishing" }
      ]
    },
    {
      id: "patek-nautilus", name: "Nautilus", house: "Patek Philippe", ref: "5711/1A",
      priceUSD: 35000, type: "integrated", size_mm: 40, wr_m: 120,
      movement: "Automatic (Patek 26-330)",
      cues: ["integrated bracelet", "porthole case", "horizontal-groove dial", "luxury sport"],
      homages: [
        { name: "PD-1728", house: "Pagani Design", priceUSD: 105, size_mm: 40, wr_m: 100, movement: "Automatic (Seiko NH35)", fidelity: 80, amazon: true, note: "the porthole case, ears and grooved dial in steel with an integrated bracelet — the reason Pagani sells out; wears close to the original's 40mm" },
        { name: "SN035", house: "San Martin", priceUSD: 340, size_mm: 40, wr_m: 100, movement: "Automatic (Miyota 9015)", fidelity: 85, amazon: false, direct: true, note: "the integrated bracelet taper and case finishing the budget versions miss; a smoother 9015 auto" }
      ]
    },
    {
      id: "ap-royal-oak", name: "Royal Oak", house: "Audemars Piguet", ref: "15500ST",
      priceUSD: 35000, type: "integrated", size_mm: 41, wr_m: 50,
      movement: "Automatic (AP 4302)",
      cues: ["octagonal bezel", "tapisserie dial", "integrated bracelet", "exposed screws"],
      homages: [
        { name: "PD-1736", house: "Pagani Design", priceUSD: 110, size_mm: 41, wr_m: 100, movement: "Automatic (Seiko NH35)", fidelity: 78, amazon: true, note: "octagonal bezel with the exposed screws and a tapisserie-style dial; the pattern is stamped rather than machined but the silhouette reads instantly" },
        { name: "SN043", house: "San Martin", priceUSD: 350, size_mm: 40, wr_m: 50, movement: "Automatic (Miyota 9015)", fidelity: 83, amazon: false, direct: true, note: "a genuinely close tapisserie dial and better bracelet integration; the pick when the dial texture matters to you" }
      ]
    },
    {
      id: "tudor-black-bay", name: "Black Bay 58", house: "Tudor", ref: "79030N",
      priceUSD: 3900, type: "dive", size_mm: 39, wr_m: 200,
      movement: "Automatic (Tudor MT5402)",
      cues: ["dive", "snowflake hands", "gilt dial", "vintage diver", "domed crystal"],
      homages: [
        { name: "SN008", house: "San Martin", priceUSD: 280, size_mm: 39, wr_m: 200, movement: "Automatic (NH35 / PT5000)", fidelity: 86, amazon: false, direct: true, note: "snowflake hands, gilt dial and a 39mm case that tracks the BB58 closely; a long-time community darling" },
        { name: "SD1954", house: "Steeldive", priceUSD: 135, size_mm: 39, wr_m: 200, movement: "Automatic (Seiko NH35)", fidelity: 80, amazon: true, note: "the vintage-diver look with snowflake hands and domed crystal at a budget price; Seiko auto inside" }
      ]
    },
    {
      id: "blancpain-fifty-fathoms", name: "Fifty Fathoms", house: "Blancpain", ref: "5015",
      priceUSD: 16000, type: "dive", size_mm: 45, wr_m: 300,
      movement: "Automatic (Blancpain 1315)",
      cues: ["dive", "domed sapphire bezel", "vintage diver", "large case"],
      homages: [
        { name: "SN0121 (Fathoms)", house: "San Martin", priceUSD: 330, size_mm: 43, wr_m: 200, movement: "Automatic (NH35 / PT5000)", fidelity: 83, amazon: false, direct: true, note: "the domed sapphire bezel and dial furniture are close; sized down a touch from the original's larger case for real wrists" },
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
    }
  ]
};
