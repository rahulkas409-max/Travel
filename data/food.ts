import type { Dish, Eatery, FoodGuide, Region } from "./types";

/* Compact helpers ------------------------------------------------------- */
const dish = (
  id: string,
  name: string,
  description: string,
  veg: boolean,
  spice: 1 | 2 | 3,
  priceRange: string,
  localName?: string,
): Dish => ({ id, name, description, veg, spice, priceRange, localName });

const spot = (
  id: string,
  name: string,
  type: Eatery["type"],
  area: string,
  mustOrder: string[],
  priceForTwo: number,
  hours: string,
  tip: string,
  veg: Eatery["veg"] = "both",
): Eatery => ({ id, name, type, area, mustOrder, priceForTwo, hours, tip, veg });

/**
 * Well-known eateries are listed for discovery only — hours change, so the
 * UI reminds travellers to double-check before heading out.
 */
export const FOOD_GUIDES: FoodGuide[] = [
  {
    destinationId: "north-goa",
    intro: "Goan food is a Konkan–Portuguese hybrid: coconut, kokum, vinegar and chillies. Seafood is best Nov–May (fishing ban Jun–Jul).",
    dishes: [
      dish("fish-curry-rice", "Fish Curry Rice", "The Goan staple — kingfish or mackerel in a tangy coconut-kokum gravy with red rice.", false, 2, "₹180–350", "Xitt Kodi"),
      dish("xacuti", "Chicken Xacuti", "Roasted coconut, poppy seeds and 15 spices in a deep brown curry.", false, 3, "₹280–450"),
      dish("bebinca", "Bebinca", "Layered coconut-milk and egg pudding baked one layer at a time.", true, 1, "₹120–200"),
      dish("ros-omelette", "Ros Omelette", "Street-cart omelette drowned in xacuti gravy with pão.", false, 2, "₹80–120"),
    ],
    spots: [
      spot("ritz-classic", "Ritz Classic", "Legendary", "Panjim", ["Fish thali", "Prawn rava fry"], 700, "12–3:30 PM, 7–11 PM", "Queue forms by 12:45 PM on weekends; go early.", "non-veg"),
      spot("vinayak", "Vinayak Family Restaurant", "Fine Local", "Assagao", ["Fish thali", "Mussels sukka"], 800, "11:30 AM–3:30 PM, 7–10:30 PM", "Locals' favourite — no reservations.", "non-veg"),
      spot("mapusa-market", "Mapusa Friday Market stalls", "Street Lane", "Mapusa", ["Chorizo pão", "Kokum sherbet"], 250, "Fri 8 AM–6 PM", "Buy Goan chorizo and cashews to take home."),
      spot("anjuna-shacks", "Anjuna–Vagator beach shacks", "Street Lane", "Anjuna", ["Calamari butter garlic", "Kingfish tawa fry"], 1200, "10 AM–11 PM (Nov–Apr)", "Check the catch-of-the-day on ice and confirm weight pricing."),
    ],
  },
  {
    destinationId: "south-goa",
    intro: "South Goa is quieter, and so is the food — Catholic Goan home cooking, beach-shack seafood and Hindu Saraswat vegetarian thalis.",
    dishes: [
      dish("recheado", "Recheado Pomfret", "Pomfret slit and stuffed with a red chilli-vinegar masala, then pan-fried.", false, 3, "₹350–650"),
      dish("sorpotel", "Sorpotel", "Tangy Goan Catholic pork dish, best a day after cooking with sannas.", false, 2, "₹250–400"),
      dish("khatkhate", "Khatkhate", "Hindu Goan mixed-veg stew with coconut and tirphal pepper.", true, 1, "₹120–200"),
    ],
    spots: [
      spot("palolem-shacks", "Palolem beach shacks", "Street Lane", "Palolem", ["Tuna steak", "Crab xec xec"], 1200, "9 AM–11 PM (Nov–Apr)", "Order fish by weight — ask the price per 100 g."),
      spot("margao-market", "Margao municipal market", "Street Lane", "Margao", ["Goan sweets", "Bhaji-pao"], 200, "8 AM–1 PM", "Morning bhaji-pao is a Goan ritual."),
      spot("agonda-bakery", "Agonda village bakeries", "Cafe", "Agonda", ["Poi bread", "Banana cake"], 300, "7 AM–7 PM", "Buy poi fresh in the morning.", "veg"),
    ],
  },
  {
    destinationId: "jaipur",
    intro: "Rajasthani food was built for the desert — lentils, gram flour and ghee that keep for days. Jaipur adds legendary sweets.",
    dishes: [
      dish("dal-baati", "Dal Baati Churma", "Baked wheat balls dunked in ghee with five-lentil dal and sweet churma.", true, 2, "₹200–400"),
      dish("pyaaz-kachori", "Pyaaz Kachori", "Flaky fried pastry stuffed with spiced onions — a Jaipur breakfast.", true, 2, "₹30–50"),
      dish("laal-maas", "Laal Maas", "Fiery mutton curry coloured by Mathania red chillies.", false, 3, "₹450–700"),
      dish("ghewar", "Ghewar", "Honeycomb disc of fried batter soaked in syrup, topped with rabri.", true, 1, "₹80–200"),
    ],
    spots: [
      spot("rawat", "Rawat Mishthan Bhandar", "Legendary", "Sindhi Camp", ["Pyaaz kachori", "Mawa kachori"], 200, "6 AM–10 PM", "Eat standing at the counter like locals.", "veg"),
      spot("lmb", "Laxmi Mishthan Bhandar (LMB)", "Legendary", "Johari Bazaar", ["Ghewar", "Rajasthani thali"], 900, "8 AM–11 PM", "Since 1727 — buy ghewar during Teej (Jul–Aug).", "veg"),
      spot("masala-chowk", "Masala Chowk", "Street Lane", "Ram Niwas Bagh", ["Dal pakwan", "Kulfi"], 400, "12–11 PM", "Hygienic open-air court with many famous stalls.", "veg"),
    ],
  },
  {
    destinationId: "udaipur",
    intro: "Mewari cuisine — gatte, kair sangri and slow-cooked meats — best enjoyed on a lakeside rooftop.",
    dishes: [
      dish("gatte", "Gatte ki Sabzi", "Gram flour dumplings in a yoghurt-based curry.", true, 2, "₹180–300"),
      dish("ker-sangri", "Ker Sangri", "Desert beans and berries stir-fried with pickling spices.", true, 2, "₹200–350"),
      dish("mohan-maas", "Mohan Maas", "Royal mutton cooked in milk, cream and mild spices.", false, 1, "₹500–800"),
    ],
    spots: [
      spot("natraj", "Natraj Dining Hall", "Legendary", "Bapu Bazaar", ["Unlimited Rajasthani thali"], 700, "11 AM–3:30 PM, 7–10 PM", "Unlimited refills — pace yourself.", "veg"),
      spot("ambrai", "Ambrai Ghat rooftops", "Fine Local", "Hanuman Ghat", ["Laal maas", "Paneer tikka"], 3000, "7–11 PM", "Book railing tables facing the Lake Palace."),
      spot("jagdish-chowk", "Jagdish Chowk chai & snacks", "Street Lane", "Old City", ["Mirchi vada", "Masala chai"], 150, "7 AM–9 PM", "Mirchi vadas are best after 4 PM.", "veg"),
    ],
  },
  {
    destinationId: "varanasi",
    intro: "Banarasi food is mostly vegetarian and devotional — kachori-sabzi breakfasts, thick lassi and the famous paan.",
    dishes: [
      dish("kachori-sabzi", "Kachori Sabzi & Jalebi", "Stuffed lentil kachoris with spicy aloo curry, followed by hot jalebi.", true, 2, "₹60–100"),
      dish("tamatar-chaat", "Tamatar Chaat", "Tomato-potato mash with spices and sweet syrup, served in a clay kulhad.", true, 2, "₹60–90"),
      dish("malaiyyo", "Malaiyyo", "Winter-only saffron milk froth set by morning dew.", true, 1, "₹40–60"),
      dish("banarasi-paan", "Banarasi Paan", "Betel leaf with gulkand, fennel and cardamom — ask for sweet (meetha).", true, 1, "₹30–100"),
    ],
    spots: [
      spot("blue-lassi", "Blue Lassi", "Legendary", "Kachori Gali", ["Banana-pomegranate lassi"], 250, "9 AM–10 PM", "Served in kulhads — the walls are covered with traveller notes.", "veg"),
      spot("kashi-chaat", "Kashi Chaat Bhandar", "Legendary", "Godowlia", ["Tamatar chaat", "Palak chaat"], 250, "3–10:30 PM", "Busiest after the aarti — go before 6:30 PM.", "veg"),
      spot("kachori-gali", "Kachori Gali", "Street Lane", "Near Vishwanath corridor", ["Kachori sabzi"], 150, "6–11 AM", "Breakfast only; the lane is mostly shut by afternoon.", "veg"),
    ],
  },
  {
    destinationId: "delhi-ncr",
    intro: "Delhi is a buffet of Mughlai, Punjabi and street chaat — and farmhouse barbecues on winter nights.",
    dishes: [
      dish("chole-bhature", "Chole Bhature", "Spiced chickpeas with pillowy fried bread.", true, 2, "₹120–220"),
      dish("butter-chicken", "Butter Chicken", "Tandoori chicken in a tomato-butter gravy — invented in Delhi.", false, 1, "₹350–600"),
      dish("nihari", "Nihari", "Slow-cooked overnight mutton stew, an Old Delhi breakfast.", false, 3, "₹200–350"),
      dish("daulat-ki-chaat", "Daulat ki Chaat", "Winter-only whipped milk foam, sold at dawn in Old Delhi.", true, 1, "₹60–100"),
    ],
    spots: [
      spot("karims", "Karim's", "Legendary", "Jama Masjid", ["Mutton korma", "Nihari"], 1000, "9 AM–12 AM", "Gali Kababian lane behind Gate 1 of Jama Masjid.", "non-veg"),
      spot("paranthe-wali", "Paranthe Wali Gali", "Street Lane", "Chandni Chowk", ["Rabri parantha", "Mixed parantha"], 300, "9 AM–11 PM", "Paranthas are deep-fried in ghee — share one first.", "veg"),
      spot("murthal-dhabas", "Murthal highway dhabas", "Dhaba", "NH-44, Sonipat", ["Aloo parantha with white butter"], 500, "24 hrs", "A classic midnight drive from North Delhi.", "veg"),
    ],
  },
  {
    destinationId: "amritsar",
    intro: "Punjabi food at its most generous — ghee, butter and the world's largest community kitchen.",
    dishes: [
      dish("amritsari-kulcha", "Amritsari Kulcha", "Stuffed, tandoor-crisp bread with chole and butter.", true, 2, "₹100–180"),
      dish("amritsari-fish", "Amritsari Fish", "Gram-flour-battered river fish with ajwain.", false, 2, "₹300–500"),
      dish("lassi", "Punjabi Lassi", "Thick yoghurt drink topped with malai.", true, 1, "₹60–100"),
    ],
    spots: [
      spot("langar", "Golden Temple Langar", "Legendary", "Harmandir Sahib", ["Dal, roti, kheer"], 0, "24 hrs", "Free for all; sit on the floor and accept with both hands.", "veg"),
      spot("kesar-da-dhaba", "Kesar Da Dhaba", "Dhaba", "Chowk Passian", ["Dal makhani", "Phirni"], 500, "11 AM–11 PM", "Operating since 1916 — the dal simmers overnight.", "veg"),
      spot("gian-lassi", "Gian di Lassi", "Legendary", "Katra Ahluwalia", ["Malai lassi"], 150, "8 AM–10 PM", "One glass is a meal.", "veg"),
    ],
  },
  {
    destinationId: "mumbai",
    intro: "Mumbai eats on the move — vada pav at stations, Irani chai in art deco cafes and seafood in Koliwada lanes.",
    dishes: [
      dish("vada-pav", "Vada Pav", "Spiced potato fritter in a bun with garlic chutney.", true, 2, "₹20–40"),
      dish("pav-bhaji", "Pav Bhaji", "Buttery mashed-vegetable curry with toasted pav.", true, 2, "₹120–200"),
      dish("bombay-duck", "Bombil Fry", "Crisp-fried 'Bombay duck' fish.", false, 2, "₹200–350"),
    ],
    spots: [
      spot("kyani", "Kyani & Co.", "Legendary", "Dhobi Talao", ["Bun maska", "Irani chai"], 250, "7 AM–9 PM", "Irani cafe since 1904.", "both"),
      spot("chowpatty", "Girgaon Chowpatty stalls", "Street Lane", "Marine Drive", ["Pav bhaji", "Kulfi"], 400, "5 PM–12 AM", "Follow with a sea-face walk.", "veg"),
      spot("koliwada", "Sion Koliwada", "Street Lane", "Sion", ["Koliwada prawns"], 700, "7 PM–1 AM", "Koli fisherfolk's fried seafood lane.", "non-veg"),
    ],
  },
  {
    destinationId: "pune",
    intro: "Pune runs on spicy misal pav, Irani bakeries — and farmhouse Malvani and Maharashtrian thalis in Karjat and Lonavala.",
    dishes: [
      dish("misal-pav", "Misal Pav", "Fiery sprout curry topped with farsan and onions.", true, 3, "₹80–150"),
      dish("chikki", "Lonavala Chikki", "Jaggery-peanut brittle, a Lonavala souvenir.", true, 1, "₹100–400"),
      dish("malvani-thali", "Malvani Fish Thali", "Coastal fish curry, fry and sol kadhi.", false, 2, "₹350–600"),
    ],
    spots: [
      spot("bedekar", "Bedekar Misal", "Legendary", "Narayan Peth", ["Misal pav"], 200, "8 AM–2 PM, 4–8 PM", "Ask for extra rassa (gravy).", "veg"),
      spot("kayani", "Kayani Bakery", "Legendary", "Camp", ["Shrewsbury biscuits"], 300, "7:30 AM–1 PM, 3:30–8 PM", "They sell out by afternoon — go early.", "veg"),
      spot("expressway-dhabas", "Old Mumbai–Pune highway vada pav stalls", "Dhaba", "Khandala ghat", ["Vada pav", "Corn bhutta"], 200, "Daylight", "Monsoon ritual: roasted corn in the rain.", "veg"),
    ],
  },
  {
    destinationId: "kochi",
    intro: "Kerala cooking is coconut, curry leaves and spice — plus Syrian Christian, Jewish and Moplah influences in Kochi.",
    dishes: [
      dish("appam-stew", "Appam & Stew", "Lacy rice hoppers with a mild coconut-milk stew.", true, 1, "₹150–250"),
      dish("karimeen", "Karimeen Pollichathu", "Pearl-spot fish in masala, wrapped in banana leaf and grilled.", false, 2, "₹400–700"),
      dish("sadya", "Kerala Sadya", "20+ dish banana-leaf feast served at Onam.", true, 2, "₹250–450"),
    ],
    spots: [
      spot("kashi-art-cafe", "Kashi Art Cafe", "Cafe", "Fort Kochi", ["Chocolate cake", "Breakfast"], 900, "8:30 AM–7:30 PM", "An art gallery and cafe — a Fort Kochi institution.", "both"),
      spot("dal-roti", "Dal Roti", "Fine Local", "Fort Kochi", ["Kathi rolls", "Dal"], 700, "12–10 PM", "Small, homely, hugely popular.", "both"),
      spot("fish-nets", "Fish-net stalls", "Street Lane", "Chinese fishing nets", ["Buy & cook fresh catch"], 800, "Morning & evening", "Buy from the nets; shacks cook it for a fee.", "non-veg"),
    ],
  },
  {
    destinationId: "coorg",
    intro: "Kodava cuisine — pork, rice and kachampuli (black vinegar) — is best eaten at estate homestays.",
    dishes: [
      dish("pandi-curry", "Pandi Curry", "Dark, tangy pork curry with kachampuli vinegar.", false, 3, "₹300–450"),
      dish("akki-roti", "Akki Roti", "Rice-flour flatbread.", true, 1, "₹60–100"),
      dish("kadambuttu", "Kadambuttu", "Steamed rice dumplings.", true, 1, "₹80–120"),
    ],
    spots: [
      spot("coorg-cuisinette", "Coorg Cuisinette", "Fine Local", "Madikeri", ["Pandi curry", "Kadambuttu"], 700, "12–10 PM", "Authentic Kodava dishes in town.", "both"),
      spot("estate-kitchens", "Estate homestay kitchens", "Fine Local", "Across Kodagu", ["Home-cooked Kodava meal"], 800, "Pre-order", "Order a day in advance for the full spread.", "both"),
      spot("bylakuppe-momos", "Bylakuppe Tibetan cafes", "Street Lane", "Bylakuppe", ["Momos", "Thukpa"], 300, "9 AM–8 PM", "Right outside the Golden Temple.", "both"),
    ],
  },
  {
    destinationId: "leh-ladakh",
    intro: "Ladakhi food is warm and high-calorie — noodle soups, barley and butter tea for the altitude.",
    dishes: [
      dish("thukpa", "Thukpa", "Tibetan noodle soup with vegetables or meat.", false, 1, "₹150–250"),
      dish("skyu", "Skyu", "Hand-rolled wheat 'thumb pasta' stew.", true, 1, "₹150–250"),
      dish("butter-tea", "Gur Gur Chai", "Salted butter tea, churned by hand.", true, 1, "₹40–80"),
    ],
    spots: [
      spot("tibetan-kitchen", "The Tibetan Kitchen", "Legendary", "Fort Road, Leh", ["Gyathuk", "Momos"], 900, "Seasonal (May–Oct)", "Book ahead in July–August.", "both"),
      spot("lalas-cafe", "Lala's Art Cafe", "Cafe", "Old Town, Leh", ["Coffee", "Apricot cake"], 500, "9 AM–7 PM", "A restored old-town home.", "veg"),
      spot("main-bazaar", "Leh Main Bazaar bakeries", "Street Lane", "Main Bazaar", ["Khambir bread", "Apricot jam"], 200, "7 AM–9 PM", "Buy khambir from the tandoor bakers in the lanes.", "veg"),
    ],
  },
  {
    destinationId: "sethan",
    intro: "Himachali food — siddu, trout, dham — plus Old Manali's Israeli and Italian cafes.",
    dishes: [
      dish("siddu", "Siddu", "Steamed yeast bun stuffed with walnut or poppy paste, served with ghee.", true, 1, "₹100–180"),
      dish("trout", "Grilled Trout", "Fresh Beas trout, grilled with lemon and garlic.", false, 1, "₹450–700"),
      dish("dham", "Himachali Dham", "Festive feast — rajma madra, kadhi, rice, served on leaf plates.", true, 2, "₹200–350"),
    ],
    spots: [
      spot("johnsons", "Johnson's Cafe", "Legendary", "Circuit House Rd, Manali", ["Trout", "Apple crumble"], 1400, "8 AM–10:30 PM", "Garden seating by the fire.", "both"),
      spot("cafe-1947", "Café 1947", "Cafe", "Old Manali", ["Wood-fired pizza"], 1000, "9 AM–11 PM", "Riverside with live music.", "both"),
      spot("siddu-stalls", "Mall Road siddu stalls", "Street Lane", "Manali Mall Road", ["Siddu with ghee"], 200, "8 AM–9 PM", "Best in winter.", "veg"),
    ],
  },
  {
    destinationId: "kolkata",
    intro: "Kolkata is for eating: fish in mustard, Mughlai biryani with potato, and a sweet for every mood.",
    dishes: [
      dish("kosha-mangsho", "Kosha Mangsho", "Slow-cooked, dry mutton curry with luchi.", false, 2, "₹300–500"),
      dish("shorshe-ilish", "Shorshe Ilish", "Hilsa in pungent mustard sauce.", false, 2, "₹450–900"),
      dish("rosogolla", "Rosogolla & Mishti Doi", "Spongy cottage-cheese balls and sweet set yoghurt.", true, 1, "₹20–80"),
      dish("kathi-roll", "Kathi Roll", "Paratha wrapped around kebab and egg.", false, 2, "₹100–200"),
    ],
    spots: [
      spot("nizams", "Nizam's", "Legendary", "New Market", ["Kathi roll"], 400, "12–11 PM", "Birthplace of the kathi roll.", "non-veg"),
      spot("indian-coffee-house", "Indian Coffee House", "Legendary", "College Street", ["Cold coffee", "Fish fry"], 300, "9 AM–9 PM", "Adda capital of Bengal.", "both"),
      spot("flurys", "Flurys", "Cafe", "Park Street", ["English breakfast", "Rum balls"], 1200, "7:30 AM–10 PM", "Tearoom since 1927.", "both"),
    ],
  },
  {
    destinationId: "hyderabad",
    intro: "Nizami kitchens gave the world Hyderabadi biryani, haleem and Irani chai with Osmania biscuits.",
    dishes: [
      dish("biryani", "Kacchi Gosht Biryani", "Raw marinated mutton and rice cooked together under dum.", false, 2, "₹300–500"),
      dish("haleem", "Haleem", "Wheat, lentils and meat pounded into a rich porridge (Ramzan).", false, 2, "₹200–300"),
      dish("osmania", "Irani Chai & Osmania Biscuit", "Sweet milky tea with a butter biscuit.", true, 1, "₹30–60"),
    ],
    spots: [
      spot("shadab", "Shadab", "Legendary", "Madina, Old City", ["Mutton biryani"], 800, "12–11:30 PM", "Near Charminar — busy at lunch.", "non-veg"),
      spot("nimrah", "Nimrah Cafe", "Legendary", "Charminar", ["Irani chai", "Osmania biscuit"], 150, "5 AM–11 PM", "Chai with a Charminar view.", "veg"),
      spot("pista-house", "Pista House", "Legendary", "Shalibanda", ["Haleem"], 600, "Ramzan evenings", "Haleem is seasonal — Ramzan only.", "non-veg"),
    ],
  },
  {
    destinationId: "shillong",
    intro: "Khasi food is rice, pork and fermented flavours; Shillong's cafes add a modern twist.",
    dishes: [
      dish("jadoh", "Jadoh", "Rice cooked with pork and turmeric.", false, 1, "₹120–200"),
      dish("dohneiiong", "Dohneiiong", "Pork in black sesame paste.", false, 2, "₹200–300"),
      dish("tungrymbai", "Tungrymbai", "Fermented soybean chutney-curry.", true, 2, "₹100–150"),
    ],
    spots: [
      spot("police-bazaar", "Police Bazaar street stalls", "Street Lane", "Police Bazaar", ["Momos", "Jadoh"], 250, "4–9 PM", "Evening stalls pack up early.", "both"),
      spot("laitumkhrah-cafes", "Laitumkhrah cafe strip", "Cafe", "Laitumkhrah", ["Coffee", "Khasi fusion"], 700, "10 AM–9 PM", "The city's music-and-coffee lane.", "both"),
      spot("jadoh-stalls", "Iewduh (Bara Bazaar) jadoh stalls", "Street Lane", "Iewduh", ["Jadoh with pork"], 200, "Morning–afternoon", "One of the NE's oldest markets.", "non-veg"),
    ],
  },
  {
    destinationId: "darjeeling",
    intro: "Tibetan, Nepali and Anglo breakfasts — with the world's champagne of teas.",
    dishes: [
      dish("momos", "Momos", "Steamed dumplings with fiery tomato achar.", false, 2, "₹80–150"),
      dish("thenthuk", "Thenthuk", "Hand-pulled noodle soup.", false, 1, "₹120–200"),
      dish("first-flush", "First Flush Darjeeling", "Light, floral spring tea — drink without milk.", true, 1, "₹100–400"),
    ],
    spots: [
      spot("keventers", "Keventers", "Legendary", "Nehru Road", ["Ham & sausage breakfast"], 700, "8 AM–8 PM", "Rooftop seats over the Mall.", "both"),
      spot("glenarys", "Glenary's", "Legendary", "Nehru Road", ["Pastries", "Tea"], 800, "8 AM–9 PM", "Colonial bakery with Kanchenjunga views.", "both"),
      spot("momo-lane", "Chowk Bazaar momo stalls", "Street Lane", "Chowk Bazaar", ["Momos", "Thukpa"], 200, "11 AM–8 PM", "Cheaper and spicier than the Mall.", "both"),
    ],
  },
  {
    destinationId: "indore",
    intro: "Indore is India's snacking capital: poha-jalebi at dawn, Sarafa's midnight feast.",
    dishes: [
      dish("poha-jalebi", "Poha Jalebi", "Flattened rice with sev, fennel and jalebi on the side.", true, 1, "₹30–60"),
      dish("bhutte-ka-kees", "Bhutte ka Kees", "Grated corn cooked in milk and spices.", true, 2, "₹60–100"),
      dish("garadu", "Garadu", "Fried yam cubes with chaat masala (winter).", true, 2, "₹60–100"),
    ],
    spots: [
      spot("chappan", "Chappan Dukan", "Street Lane", "New Palasia", ["Poha", "Johny hot dog"], 300, "7 AM–11 PM", "56 shops in one hygienic lane.", "veg"),
      spot("sarafa", "Sarafa Bazaar", "Street Lane", "Old City", ["Bhutte ka kees", "Malpua"], 400, "9 PM–2 AM", "Jewellery lane by day, food lane by night.", "veg"),
      spot("vijay-chaat", "Vijay Chaat House", "Legendary", "Rajwada", ["Khopra patties"], 200, "10 AM–10 PM", "Coconut patties are the signature.", "veg"),
    ],
  },
  {
    destinationId: "chennai",
    intro: "Tamil tiffin culture — idli, dosa and filter coffee — plus Chettinad spice and fresh coastal seafood.",
    dishes: [
      dish("filter-coffee", "Filter Coffee", "Chicory-blend decoction with frothy milk, poured tumbler-to-dabarah.", true, 1, "₹25–60"),
      dish("chettinad", "Chettinad Chicken", "Pepper-heavy curry from the Chettinad region.", false, 3, "₹280–450"),
      dish("ghee-podi-idli", "Ghee Podi Idli", "Mini idlis tossed in gunpowder chutney and ghee.", true, 2, "₹80–120"),
    ],
    spots: [
      spot("mylapore-tiffin", "Mylapore tiffin rooms", "Legendary", "Mylapore", ["Idli", "Filter coffee"], 250, "6:30–11 AM, 4–9 PM", "Tiffin time is sacred — go early.", "veg"),
      spot("marina-sundal", "Marina & Besant Nagar stalls", "Street Lane", "Beachfront", ["Sundal", "Murukku"], 150, "4–9 PM", "Evening beach snacks.", "veg"),
      spot("chettinad-mess", "Chettinad messes", "Fine Local", "Across the city", ["Chettinad meals"], 700, "12–3:30 PM", "Banana-leaf lunch service.", "both"),
    ],
  },
  {
    destinationId: "bengaluru",
    intro: "Darshini tiffins, Udupi dosas, military hotel biryanis and the country's craft beer capital.",
    dishes: [
      dish("masala-dosa", "Benne Masala Dosa", "Butter-laden, crisp dosa with potato filling.", true, 1, "₹80–150"),
      dish("donne-biryani", "Donne Biryani", "Short-grain, herby biryani served in areca-leaf cups.", false, 2, "₹200–350"),
      dish("mysore-pak", "Mysore Pak", "Gram flour and ghee fudge.", true, 1, "₹60–150"),
    ],
    spots: [
      spot("vidyarthi-bhavan", "Vidyarthi Bhavan", "Legendary", "Basavanagudi", ["Masala dosa"], 300, "6:30–11:30 AM, 2–8 PM", "Since 1943 — weekend queues are long.", "veg"),
      spot("mtr", "MTR (Mavalli Tiffin Rooms)", "Legendary", "Lalbagh Rd", ["Rava idli", "Filter coffee"], 400, "6:30 AM–9 PM", "Invented rava idli during WWII.", "veg"),
      spot("vv-puram", "VV Puram Food Street", "Street Lane", "VV Puram", ["Holige", "Congress bun"], 300, "5–11 PM", "Evening-only food street.", "veg"),
    ],
  },
];

/** Regional staples used when a destination has no dedicated guide yet. */
export const REGIONAL_FOOD: Record<Region, Omit<FoodGuide, "destinationId">> = {
  north: {
    intro: "North Indian food leans on wheat, dairy and the tandoor — dhabas along every highway keep it honest.",
    dishes: [
      dish("n-rajma", "Rajma Chawal", "Kidney beans slow-cooked in a tomato-onion gravy with rice.", true, 2, "₹120–220"),
      dish("n-parantha", "Aloo Parantha", "Stuffed flatbread with white butter and curd.", true, 1, "₹60–150"),
      dish("n-kadhi", "Kadhi Chawal", "Yoghurt-gram-flour curry with pakoras.", true, 1, "₹100–180"),
    ],
    spots: [
      spot("n-dhaba", "Highway dhabas", "Dhaba", "Any national highway", ["Dal makhani", "Tandoori roti"], 400, "24 hrs", "Pick the one with the most trucks parked outside.", "both"),
      spot("n-halwai", "Local halwai sweet shop", "Legendary", "Town centre", ["Jalebi", "Samosa"], 150, "7 AM–10 PM", "Hot jalebis come out around 5 PM.", "veg"),
    ],
  },
  west: {
    intro: "From Gujarati thalis to Konkan seafood and Rajasthani desert fare, the West is sweet, tangy and coastal.",
    dishes: [
      dish("w-thali", "Gujarati Thali", "Sweet-savoury spread of dal, kadhi, farsan and rotli.", true, 1, "₹250–500"),
      dish("w-sol-kadhi", "Sol Kadhi", "Pink kokum-coconut digestive drink.", true, 1, "₹40–80"),
      dish("w-dabeli", "Dabeli", "Kutchi spiced-potato bun with pomegranate and peanuts.", true, 2, "₹30–60"),
    ],
    spots: [
      spot("w-thali-house", "Local thali house", "Fine Local", "Town centre", ["Unlimited thali"], 600, "11 AM–3 PM, 7–10 PM", "Unlimited refills — say no with a hand over the plate.", "veg"),
      spot("w-seafood", "Fisherfolk seafood shacks", "Street Lane", "Coast", ["Fish fry thali"], 700, "12–10 PM", "Seafood is freshest at lunch.", "non-veg"),
    ],
  },
  south: {
    intro: "Rice, coconut, curry leaves and tamarind — tiffins by morning, banana-leaf meals by noon.",
    dishes: [
      dish("s-meals", "Banana-Leaf Meals", "Rice with sambar, rasam, poriyal and payasam.", true, 2, "₹150–300"),
      dish("s-dosa", "Masala Dosa", "Crisp fermented crepe with potato masala.", true, 1, "₹60–150"),
      dish("s-coffee", "Filter Coffee", "Frothy decoction coffee.", true, 1, "₹25–60"),
    ],
    spots: [
      spot("s-darshini", "Darshini / tiffin room", "Legendary", "Town centre", ["Idli-vada", "Coffee"], 200, "6:30 AM–10 PM", "Stand-and-eat, super fast, super cheap.", "veg"),
      spot("s-mess", "Local meals mess", "Fine Local", "Near bus stand", ["Unlimited meals"], 400, "12–3:30 PM", "Lunch is the main event.", "both"),
    ],
  },
  east: {
    intro: "Mustard oil, river fish and sweets — Bengal, Odisha and Bihar share a love for rice and mishti.",
    dishes: [
      dish("e-litti", "Litti Chokha", "Roasted sattu-stuffed dough balls with smoky mash.", true, 2, "₹60–150"),
      dish("e-fish", "Macher Jhol", "Light fish curry with potatoes.", false, 2, "₹150–300"),
      dish("e-rasgulla", "Rasgulla", "Chenna balls in syrup.", true, 1, "₹20–60"),
    ],
    spots: [
      spot("e-mishti", "Neighbourhood mishti shop", "Legendary", "Town centre", ["Sandesh", "Mishti doi"], 150, "8 AM–10 PM", "Buy doi in clay pots.", "veg"),
      spot("e-hotel", "Pice hotel (rice hotel)", "Fine Local", "Market area", ["Fish thali"], 300, "12–4 PM", "Old-school Bengali lunch houses.", "non-veg"),
    ],
  },
  central: {
    intro: "Poha, bhutte ka kees and dal bafla — central India's food is hearty, snacky and mostly vegetarian.",
    dishes: [
      dish("c-poha", "Poha", "Flattened rice with onions, sev and lemon.", true, 1, "₹20–50"),
      dish("c-bafla", "Dal Bafla", "Boiled-and-baked wheat balls with ghee and dal.", true, 2, "₹150–250"),
      dish("c-mawa-bati", "Mawa Bati", "Khoya-stuffed gulab jamun cousin.", true, 1, "₹30–60"),
    ],
    spots: [
      spot("c-poha-cart", "Morning poha carts", "Street Lane", "Bus stand & markets", ["Poha-jalebi"], 100, "6–11 AM", "Breakfast only.", "veg"),
      spot("c-dhaba", "Highway dhabas", "Dhaba", "State highways", ["Dal bafla"], 400, "24 hrs", "Ask for fresh tandoori roti.", "veg"),
    ],
  },
  northeast: {
    intro: "Smoked meats, bamboo shoot, fermented soy and king chillies — and rice beer for hospitality.",
    dishes: [
      dish("ne-momo", "Momos & Thukpa", "Dumplings and noodle soup, found across the hills.", false, 2, "₹80–200"),
      dish("ne-bamboo", "Smoked Pork with Bamboo Shoot", "Naga and Arunachali staple.", false, 3, "₹250–400"),
      dish("ne-pitha", "Pitha", "Assamese rice cakes, sweet or savoury.", true, 1, "₹30–80"),
    ],
    spots: [
      spot("ne-market", "Local market kitchens", "Street Lane", "Main bazaar", ["Rice & pork thali"], 300, "8 AM–6 PM", "Most close early — eat lunch, not dinner, here.", "both"),
      spot("ne-homestay", "Homestay dinners", "Fine Local", "Your stay", ["Family-style meal"], 500, "Pre-order", "The most authentic meal you'll have.", "both"),
    ],
  },
};

export const FOOD_BY_DESTINATION: Record<string, FoodGuide> = Object.fromEntries(FOOD_GUIDES.map((g) => [g.destinationId, g]));
