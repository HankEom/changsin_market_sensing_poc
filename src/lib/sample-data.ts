/**
 * PoC용 샘플 기사 데이터 30건.
 * POST /api/crawl (source: "sample") 호출 시 Supabase에 INSERT.
 */

export interface SampleArticle {
  source: string;
  url: string;
  title: string;
  content: string;
  image_url: string | null;
  published_at: string;
}

export const sampleArticles: SampleArticle[] = [
  {
    source: "cosmetics-design",
    url: "https://example.com/article/airless-pump-revolution-2026",
    title: "Airless Pump Revolution: Why Premium Skincare Brands Are Making the Switch",
    content:
      "The cosmetic packaging industry is witnessing a significant shift toward airless pump technology. Major skincare brands are increasingly adopting airless pump bottles to preserve active ingredients and extend shelf life. The technology prevents oxidation by eliminating air contact with the product, making it ideal for vitamin C serums and retinol formulations. Industry analysts predict the airless packaging market will grow 12% annually through 2028, driven by consumer demand for preservative-free formulations.",
    image_url: null,
    published_at: "2026-03-10T09:00:00Z",
  },
  {
    source: "packaging-world",
    url: "https://example.com/article/sustainable-refill-systems",
    title: "Sustainable Refill Systems Gain Traction in K-Beauty Market",
    content:
      "Korean beauty brands are leading the charge in refillable packaging solutions. New refill pod systems reduce plastic waste by up to 70% compared to traditional single-use containers. Brands like Amorepacific and LG H&H have introduced modular refill cartridges for cushion compacts and cream jars. The refillable packaging segment is expected to reach $2.1 billion by 2027, with particular growth in the Asia-Pacific region.",
    image_url: null,
    published_at: "2026-03-10T14:30:00Z",
  },
  {
    source: "cosmetics-design",
    url: "https://example.com/article/matte-finish-premium-trend",
    title: "Matte Finish Dominates Premium Cosmetic Container Design",
    content:
      "The matte coating trend continues to dominate luxury cosmetic packaging. Soft-touch matte finishes on glass and acrylic containers convey a sense of understated luxury that resonates with millennial and Gen Z consumers. Advanced coating technologies now allow for matte finishes on complex shapes while maintaining scratch resistance. The trend has expanded beyond facial care into body care and haircare packaging.",
    image_url: null,
    published_at: "2026-03-09T11:00:00Z",
  },
  {
    source: "packaging-world",
    url: "https://example.com/article/bio-plastic-cosmetics-2026",
    title: "Bio-Plastics Enter Mainstream Cosmetic Packaging",
    content:
      "PLA and bio-PE materials are making significant inroads into cosmetic container manufacturing. Leading OEM manufacturers are now offering bio-plastic alternatives for tubes, jars, and pump bottles. While bio-plastics currently cost 15-20% more than conventional materials, brands are willing to pay the premium for sustainability credentials. New bio-PP formulations offer comparable performance to traditional polypropylene with a 60% lower carbon footprint.",
    image_url: null,
    published_at: "2026-03-09T08:00:00Z",
  },
  {
    source: "beauty-packaging",
    url: "https://example.com/article/glass-dropper-renaissance",
    title: "Glass Dropper Bottles: The Renaissance of Precision Dispensing",
    content:
      "Glass dropper bottles are experiencing renewed popularity in the serum and facial oil categories. The precision dispensing mechanism appeals to consumers who value controlled application. Frosted glass finishes add a premium aesthetic while protecting light-sensitive formulations. New dropper designs feature calibrated pipettes for exact dosing, addressing consumer demand for efficacy-driven skincare routines.",
    image_url: null,
    published_at: "2026-03-08T16:00:00Z",
  },
  {
    source: "cosmetics-design",
    url: "https://example.com/article/metallic-compact-design",
    title: "Metallic Finishes Transform Compact Case Design",
    content:
      "Metallic finishing techniques including vacuum metalizing and anodized coatings are transforming compact case aesthetics. ABS and aluminum substrates with metallic finishes create a jewelry-like appearance that appeals to luxury consumers. Compact manufacturers are investing in precision metalizing equipment to achieve mirror-like and brushed metal effects on plastic substrates at competitive costs.",
    image_url: null,
    published_at: "2026-03-08T10:00:00Z",
  },
  {
    source: "packaging-world",
    url: "https://example.com/article/squeeze-tube-innovation",
    title: "Squeeze Tube Innovation: From Basic to Premium",
    content:
      "The humble squeeze tube is being reimagined for premium cosmetic applications. Advanced LDPE formulations with multi-layer barrier technology protect sensitive formulations while maintaining the convenience of squeeze dispensing. Offset printing and hot stamping techniques now deliver luxury-grade decoration on tube packaging. The tube segment is growing at 8% annually in the facial care category.",
    image_url: null,
    published_at: "2026-03-08T07:00:00Z",
  },
  {
    source: "beauty-packaging",
    url: "https://example.com/article/cushion-packaging-evolution",
    title: "Cushion Compact Packaging Evolves Beyond Foundation",
    content:
      "Cushion compact packaging, originally developed for BB cream and foundation, is expanding into new product categories. Sun care, primer, and even lip products are now being formulated for cushion delivery. Manufacturers are developing slim-profile cushion cases with improved puff technology. The soft-touch PP cases with snap-lock mechanisms are becoming the industry standard for refillable cushion systems.",
    image_url: null,
    published_at: "2026-03-07T13:00:00Z",
  },
  {
    source: "cosmetics-design",
    url: "https://example.com/article/uv-coating-protection",
    title: "UV Coating Technology: Function Meets Aesthetics in Packaging",
    content:
      "UV coating has evolved from a purely functional protective layer to a key design element in cosmetic packaging. Selective UV coating creates tactile contrast zones on containers, combining glossy and matte areas for visual interest. The technology also provides chemical resistance essential for packaging containing AHA/BHA formulations. New UV LED curing systems reduce energy consumption by 40% compared to conventional mercury lamp systems.",
    image_url: null,
    published_at: "2026-03-07T09:00:00Z",
  },
  {
    source: "packaging-world",
    url: "https://example.com/article/ampoule-skincare-packaging",
    title: "Ampoule Packaging: Single-Dose Luxury for Concentrated Skincare",
    content:
      "Ampoule packaging is capturing the high-potency skincare market with its promise of freshness and precise dosing. Glass ampoules with frosted finishes convey a clinical, pharmaceutical quality that builds consumer trust. The format is particularly popular for vitamin C, hyaluronic acid, and peptide concentrates. While per-unit costs are higher, brands report improved customer retention rates with ampoule-based product lines.",
    image_url: null,
    published_at: "2026-03-07T06:00:00Z",
  },
  {
    source: "beauty-packaging",
    url: "https://example.com/article/pump-bottle-design-trends",
    title: "Pump Bottle Design Trends: Ergonomics and Sustainability",
    content:
      "Pump bottle design is evolving with dual focus on ergonomics and sustainability. New HDPE pump bottles feature mono-material construction for easier recycling. Ergonomic pump heads reduce dispensing force by 30%, improving user experience. Shrink label technology enables full-wrap decoration without adhesives, supporting recyclability goals. The pump bottle segment remains the largest in body care packaging.",
    image_url: null,
    published_at: "2026-03-06T15:00:00Z",
  },
  {
    source: "cosmetics-design",
    url: "https://example.com/article/petg-clarity-packaging",
    title: "PETG: The Clear Choice for Transparent Cosmetic Packaging",
    content:
      "PETG continues to gain market share as the preferred material for transparent cosmetic containers. Its superior clarity, chemical resistance, and shatter resistance make it ideal for showcasing product color and texture. Color-tinted PETG options allow brands to create distinctive shelf presence while maintaining transparency. The material is compatible with airless pump and dropper bottle formats, driving cross-category adoption.",
    image_url: null,
    published_at: "2026-03-06T11:00:00Z",
  },
  {
    source: "packaging-world",
    url: "https://example.com/article/aluminum-packaging-luxury",
    title: "Aluminum Packaging: Brushed Metal Aesthetics for Eco-Luxury",
    content:
      "Aluminum containers and closures are rising in the eco-luxury segment. Brushed and anodized aluminum finishes create a premium tactile experience while offering infinite recyclability. Aluminum tin cases are gaining traction for solid cosmetics including balms, salves, and solid perfumes. The material's inherent barrier properties eliminate the need for additional coatings, simplifying the recycling stream.",
    image_url: null,
    published_at: "2026-03-06T08:00:00Z",
  },
  {
    source: "beauty-packaging",
    url: "https://example.com/article/hot-stamping-decoration",
    title: "Hot Stamping: Elevating Tube and Bottle Decoration",
    content:
      "Hot stamping remains a premier decoration technique for cosmetic packaging. Gold, silver, and holographic foils add luxury appeal to tubes, bottles, and compact cases. New micro-stamping technology enables finer detail and text reproduction than ever before. The technique is particularly effective on matte-finished substrates where the metallic contrast creates maximum visual impact. Eco-friendly foil options with reduced VOC emissions are now available.",
    image_url: null,
    published_at: "2026-03-05T14:00:00Z",
  },
  {
    source: "cosmetics-design",
    url: "https://example.com/article/mist-spray-market-growth",
    title: "Mist Spray Packaging Market Surges with Toner and Setting Spray Demand",
    content:
      "The mist spray bottle segment is experiencing rapid growth driven by toner and setting spray products. Fine mist technology delivers ultra-light, even coverage that consumers prefer over pour-dispense toners. PET and PETG mist bottles with frosted and color-tinted finishes dominate the premium segment. Manufacturers are developing smaller 50ml travel-size mist bottles to capture the on-the-go beauty market.",
    image_url: null,
    published_at: "2026-03-05T10:00:00Z",
  },
  {
    source: "packaging-world",
    url: "https://example.com/article/refillable-pod-system",
    title: "Refillable Pod Systems: The Future of Zero-Waste Beauty",
    content:
      "Refillable pod systems represent the next evolution in sustainable cosmetic packaging. Aluminum and PP pods snap into permanent outer cases, reducing material waste by up to 80%. The system design allows brands to offer multiple product formats in a single reusable case. Consumer studies show 65% willingness to pay 10% more for refillable systems when the refill process is convenient and hygienic.",
    image_url: null,
    published_at: "2026-03-05T07:00:00Z",
  },
  {
    source: "beauty-packaging",
    url: "https://example.com/article/stick-format-skincare",
    title: "Stick Format Packaging Enters the Skincare Category",
    content:
      "The stick format, traditionally associated with lip products and deodorants, is making inroads into facial skincare. Sunscreen sticks, serum sticks, and cleansing sticks offer mess-free, portable application. PP tubes with twist-up mechanisms are the preferred packaging format. Matte-finished stick containers with compact form factors are particularly popular in the men's grooming and travel beauty segments.",
    image_url: null,
    published_at: "2026-03-04T16:00:00Z",
  },
  {
    source: "cosmetics-design",
    url: "https://example.com/article/acrylic-jar-premium",
    title: "Acrylic Jars Maintain Premium Positioning in Cream Category",
    content:
      "Acrylic cream jars continue to hold premium positioning in the facial cream and moisturizer market. Double-wall acrylic construction creates a floating inner cup effect that enhances perceived value. Metalizing and UV coating techniques on acrylic achieve glass-like aesthetics at lower weight and shipping costs. The 50ml size remains the most popular, with growing demand for matching 30ml travel sizes.",
    image_url: null,
    published_at: "2026-03-04T12:00:00Z",
  },
  {
    source: "packaging-world",
    url: "https://example.com/article/silk-printing-packaging",
    title: "Silk Screen Printing: Timeless Decoration for Cosmetic Containers",
    content:
      "Silk screen printing remains a fundamental decoration technique in cosmetic packaging. The method delivers opaque, vibrant colors with excellent adhesion on PP, PE, PET, and glass substrates. Multi-color silk printing with registration accuracy under 0.1mm enables complex brand graphics. For pump bottles and tubes, silk printing provides superior durability compared to labeling, maintaining brand identity throughout product use.",
    image_url: null,
    published_at: "2026-03-04T09:00:00Z",
  },
  {
    source: "beauty-packaging",
    url: "https://example.com/article/soft-touch-coating-trend",
    title: "Soft-Touch Coatings: The Tactile Revolution in Beauty Packaging",
    content:
      "Soft-touch coatings have become one of the most requested finishes in cosmetic packaging. The velvety texture creates an immediate premium perception when consumers handle the product. PP compact cases and cushion containers with soft-touch finishes report 23% higher shelf-pickup rates in retail testing. New antimicrobial soft-touch formulations address hygiene concerns while maintaining the luxurious tactile experience.",
    image_url: null,
    published_at: "2026-03-03T14:00:00Z",
  },
  {
    source: "cosmetics-design",
    url: "https://example.com/article/airless-pump-skincare-innovation",
    title: "Next-Gen Airless Pumps: Dual-Chamber and Smart Dispensing",
    content:
      "Airless pump technology is advancing with dual-chamber and smart dispensing innovations. New dual-chamber airless bottles allow two formulations to mix at the point of dispensing, enabling personalized skincare routines. Smart dispensing mechanisms with adjustable dose control address the growing demand for customized beauty. PP and PETG remain the primary materials, with bio-PP emerging as a sustainable alternative.",
    image_url: null,
    published_at: "2026-03-03T10:00:00Z",
  },
  {
    source: "packaging-world",
    url: "https://example.com/article/glass-frosted-finish",
    title: "Frosted Glass Finishes: Luxury Standard in Serum Packaging",
    content:
      "Frosted glass finishes have established themselves as the luxury standard for serum and oil packaging. The diffused light effect through frosted glass creates a spa-like aesthetic that premium brands consistently prefer. Chemical etching and sandblasting techniques produce varying degrees of frost for different brand aesthetics. Frosted glass dropper bottles and ampoules command premium pricing, with the format associated with efficacy and quality.",
    image_url: null,
    published_at: "2026-03-03T07:00:00Z",
  },
  {
    source: "beauty-packaging",
    url: "https://example.com/article/recycled-pet-packaging",
    title: "Recycled PET Adoption Accelerates in Cosmetic Packaging",
    content:
      "The use of recycled PET (rPET) in cosmetic packaging has accelerated significantly. Brands are committing to 30-50% post-consumer recycled content in their packaging portfolios by 2027. Advanced sorting and purification technologies now produce rPET with clarity and purity comparable to virgin material. Mist spray bottles and pump bottles are the primary applications, with recycled content certification becoming a key purchasing factor for retail buyers.",
    image_url: null,
    published_at: "2026-03-02T15:00:00Z",
  },
  {
    source: "cosmetics-design",
    url: "https://example.com/article/cream-jar-innovations",
    title: "Cream Jar Innovations: Lightweight, Sustainable, Premium",
    content:
      "The cream jar category is being reinvented with lightweight materials and sustainable design principles. New thin-wall PP cream jars reduce material usage by 25% while maintaining structural integrity. PLA bio-plastic cream jars are entering the market for eco-conscious brands. Glass cream jars with UV coating maintain their premium position, with the 100ml and 50ml sizes dominating the facial care and body care segments respectively.",
    image_url: null,
    published_at: "2026-03-02T11:00:00Z",
  },
  {
    source: "packaging-world",
    url: "https://example.com/article/color-tinted-packaging",
    title: "Color-Tinted Containers: Brand Differentiation Through Material Color",
    content:
      "Color-tinted containers are emerging as a key brand differentiation strategy in cosmetic packaging. PETG and PET containers with integral color tinting eliminate the need for labels or external decoration. Pastel tints, smoky grays, and amber tones are the most requested options. The technique works particularly well for mist spray bottles and dropper bottles where product visibility through the container enhances the consumer experience.",
    image_url: null,
    published_at: "2026-03-02T08:00:00Z",
  },
  {
    source: "beauty-packaging",
    url: "https://example.com/article/mono-material-packaging",
    title: "Mono-Material Packaging: Simplifying Recycling in Beauty",
    content:
      "Mono-material packaging design is becoming a regulatory and consumer expectation in the beauty industry. All-PP pump bottles and all-PE tube systems eliminate the sorting complexity that makes cosmetic packaging difficult to recycle. Leading container manufacturers are redesigning closures, pumps, and decoration methods to achieve true mono-material construction. The EU packaging regulation timeline is accelerating adoption across global beauty markets.",
    image_url: null,
    published_at: "2026-03-01T14:00:00Z",
  },
  {
    source: "cosmetics-design",
    url: "https://example.com/article/compact-cushion-refill-design",
    title: "Compact Cushion Refill Design: Ease of Use Meets Sustainability",
    content:
      "Compact cushion refill mechanisms are evolving for improved consumer experience. New click-fit refill pods replace the traditional peel-and-place method, reducing refill time from 30 seconds to under 5 seconds. PP refill trays with integrated puff storage maintain hygiene standards. Brands offering seamless refill experiences report 45% higher refill purchase rates, confirming that convenience drives sustainable behavior.",
    image_url: null,
    published_at: "2026-03-01T10:00:00Z",
  },
  {
    source: "packaging-world",
    url: "https://example.com/article/travel-size-mini-packaging",
    title: "Travel-Size Mini Packaging: Growing Segment in Cosmetic Containers",
    content:
      "Travel-size and mini cosmetic packaging is one of the fastest-growing segments. 15ml and 30ml formats across airless pumps, cream jars, and dropper bottles cater to the trial and travel markets. Airlines' liquid restrictions drive demand for sub-100ml containers. Mini packaging also serves as an entry point for luxury brands, with consumers often trading up to full-size after positive trial experiences. PP and PETG are the preferred materials for mini formats.",
    image_url: null,
    published_at: "2026-03-01T07:00:00Z",
  },
  {
    source: "beauty-packaging",
    url: "https://example.com/article/transparent-container-trend",
    title: "Transparent Containers: Showcasing Clean Beauty Formulations",
    content:
      "The clean beauty movement is driving demand for transparent packaging that showcases natural-looking formulations. Clear PETG and glass containers allow consumers to see product color, texture, and clarity before purchase. Transparent packaging builds trust for brands marketing ingredient transparency and 'nothing to hide' positioning. The trend is strongest in serum, toner, and facial oil categories where product appearance signals quality.",
    image_url: null,
    published_at: "2026-02-28T13:00:00Z",
  },
  {
    source: "cosmetics-design",
    url: "https://example.com/article/bio-pp-airless-packaging",
    title: "Bio-PP Airless Packaging: Sustainability Without Compromise",
    content:
      "Bio-PP (bio-based polypropylene) is emerging as a sustainable drop-in replacement for conventional PP in airless packaging. Derived from sugarcane ethanol, bio-PP offers identical mechanical and barrier properties to fossil-based PP with up to 80% lower carbon emissions. Leading container OEMs are qualifying bio-PP for airless pump bottles and cushion compact cases. The material carries ISCC+ certification, meeting major beauty brands' sustainability procurement requirements.",
    image_url: null,
    published_at: "2026-02-28T09:00:00Z",
  },
];
