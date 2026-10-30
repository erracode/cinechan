import type {
  Movie, Cinema, CinemaScreen, Showtime,
  TicketType, Promotion, ConcessionCategory,
  ConcessionItem, SeatLayout, ScreenFormat, Language,
  AgeRating, Seat, SeatRow, SeatStatus,
} from "@cinechan/shared"

// ─── HELPERS ────────────────────────────────────────────────────

function seatStatus(raw: number): SeatStatus {
  if (raw === 1) return "occupied"
  if (raw === 3) return "blocked"
  if (raw === 7) return "selected"
  return "available"
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

// ─── CINEMAS ─────────────────────────────────────────────────────

export const cinemas: Cinema[] = [
  {
    id: "2400",
    name: "Unicentro Pasto",
    city: "Pasto",
    address: "Unicentro Pasto, Av. Idema, Pasto, Nariño",
    phone: "+57 1 234 5678",
    services: [
      { id: "parking", name: "Parqueadero" },
      { id: "accessibility", name: "Accesibilidad" },
      { id: "candy-bar", name: "Confitería" },
      { id: "vip", name: "Sala VIP" },
    ],
    screens: [
      { number: 1, name: "Sala 1", formats: ["2D", "XD"], totalSeats: 200 },
      { number: 2, name: "Sala 2", formats: ["2D", "DBOX"], totalSeats: 180 },
      { number: 3, name: "Sala 3", formats: ["2D", "3D"], totalSeats: 155 },
      { number: 4, name: "Sala 4", formats: ["2D"], totalSeats: 120 },
      { number: 5, name: "Sala 5", formats: ["2D"], totalSeats: 100 },
      { number: 6, name: "Sala Premium", formats: ["PREMIUM"], totalSeats: 80 },
    ],
    schedule: "Lun-Dom 10:00 - 23:00",
  },
  {
    id: "2403",
    name: "Llanogrande Palmira",
    city: "Palmira",
    address: "Centro Comercial Llanogrande, Palmira, Valle del Cauca",
    phone: "+57 2 345 6789",
    services: [
      { id: "parking", name: "Parqueadero" },
      { id: "candy-bar", name: "Confitería" },
    ],
    screens: [
      { number: 1, name: "Sala 1", formats: ["2D", "3D"], totalSeats: 180 },
      { number: 2, name: "Sala 2", formats: ["2D"], totalSeats: 150 },
      { number: 3, name: "Sala 3", formats: ["2D"], totalSeats: 120 },
      { number: 4, name: "Sala 4", formats: ["2D", "PREMIUM"], totalSeats: 70 },
    ],
    schedule: "Lun-Dom 11:00 - 22:00",
  },
  {
    id: "2407",
    name: "Micentro El Porvenir",
    city: "Bogotá",
    address: "Centro Comercial Micentro, El Porvenir, Bogotá",
    phone: "+57 1 456 7890",
    services: [
      { id: "parking", name: "Parqueadero" },
      { id: "accessibility", name: "Accesibilidad" },
      { id: "candy-bar", name: "Confitería" },
    ],
    screens: [
      { number: 1, name: "Sala 1", formats: ["2D", "XD"], totalSeats: 200 },
      { number: 2, name: "Sala 2", formats: ["2D"], totalSeats: 175 },
      { number: 3, name: "Sala 3", formats: ["2D", "3D"], totalSeats: 150 },
      { number: 4, name: "Sala 4", formats: ["2D"], totalSeats: 110 },
      { number: 5, name: "Sala 5", formats: ["2D", "PREMIUM"], totalSeats: 60 },
    ],
    schedule: "Lun-Dom 10:30 - 22:30",
  },
]

// ─── MOVIES ──────────────────────────────────────────────────────

function poster(id: string, fileValue: string) {
  return `https://assets.cinemark-core.com/5db771be04daec00076df3f5/vista/movies/${id}/common/${fileValue}`
}

function fmt(raw: string[]): { formats: ScreenFormat[]; languages: Language[] } {
  const formats: ScreenFormat[] = []
  const languages: Language[] = []
  for (const f of raw) {
    if (f === "DOB") languages.push("Doblada")
    else if (f === "SUB") languages.push("Subtitulada")
    else if (f === "2D") formats.push("2D")
    else if (f === "3D") formats.push("3D")
    else if (f === "XD") formats.push("XD")
    else if (f === "DBOX") formats.push("DBOX")
    else if (f === "PRE") formats.push("PREMIUM")
  }
  return {
    formats: [...new Set(formats)] as ScreenFormat[],
    languages: [...new Set(languages)] as Language[],
  }
}

export const movies: Movie[] = [
  {
    id: "mortal-kombat-2", title: "Mortal Kombat 2",
    originalTitle: "Mortal Kombat 2",
    synopsis: "Los campeones favoritos de los fans, ahora acompañados por el propio Johnny Cage, se enfrentan cara a cara en la definitiva y sangrienta batalla a muerte para vencer al oscuro régimen de Shao Kahn, que amenaza la existencia del Reino de la Tierra y a sus defensores.",
    duration: 115, rating: "15-A" as AgeRating, genre: "Acción",
    director: "Simon McQuoid",
    actors: ["Karl Urban", "Hiroyuki Sanada", "Lewis Tan"],
    posterUrl: poster("689276b23a6f89b4cb129eee", "mortal-kombat-2-105089-1778013920111"),
    trailerUrl: "https://www.youtube.com/watch?v=YAmLVEh75Z8",
    isPremiere: false, isComingSoon: false,
    releaseDate: "2026-05-07",
    ...fmt(["DOB", "2D", "DBOX", "XD", "SUB"]),
  },
  {
    id: "las-ovejas-detectives", title: "Las Ovejas Detectives",
    synopsis: "El pastor George lee misterios de asesinatos a sus ovejas. Cuando lo matan, las ovejas se dan cuenta de que ha sido asesinado y se disponen a resolver el caso por sí mismas, aventurándose desde su pradera hacia el complejo mundo humano.",
    duration: 110, rating: "7-A" as AgeRating, genre: "Animación",
    director: "Kyle Balda",
    actors: ["Hugh Jackman", "Emma Thompson", "Regina Hall"],
    posterUrl: poster("69bc2dec952d761a90a846ce", "las-ovejas-detectives-109659-1773943739814"),
    trailerUrl: "https://youtu.be/Kpf4pAQtWr4",
    isPremiere: false, isComingSoon: false,
    releaseDate: "2026-05-07",
    ...fmt(["DOB", "2D", "SUB"]),
  },
  {
    id: "billie-eilish-tour-3d", title: "Billie Eilish Tour 3D",
    originalTitle: "Billie Eilish: Hit Me Hard and Soft - The Tour in 3D",
    synopsis: "Filmada durante su gira mundial con entradas agotadas, Billie Eilish - Hit Me Hard and Soft: El Tour en 3D trae a la gran pantalla una innovadora experiencia de concierto de una de las artistas más célebres y exitosas de su generación. Presentada en 3D inmersivo.",
    duration: 105, rating: "7-A" as AgeRating, genre: "Musical",
    director: "Billie Eilish, James Cameron",
    actors: ["Billie Eilish"],
    posterUrl: poster("69dd77c739290b2820c59c31", "billie-eilish-tour-3d-109934-1776173972404"),
    trailerUrl: "https://www.youtube.com/watch?v=kZjuvQvsyQg",
    isPremiere: false, isComingSoon: false,
    releaseDate: "2026-05-07",
    ...fmt(["SUB", "3D", "2D"]),
  },
  {
    id: "iron-maiden", title: "Iron Maiden",
    originalTitle: "Iron Maiden: Burning Ambition",
    synopsis: "Iron Maiden: Burning Ambition recorre el ascenso, la evolución y la permanencia de una de las bandas más influyentes en la historia del heavy metal. Con acceso a archivos inéditos y entrevistas exclusivas.",
    duration: 105, rating: "7-A" as AgeRating, genre: "Documental",
    director: "Malcolm Venville",
    actors: ["Steve Harris", "Bruce Dickinson", "Adrian Smith", "Dave Murray"],
    posterUrl: poster("69dd77c739290b2820c59c37", "iron-maiden-109737-1776173945490"),
    trailerUrl: "https://youtu.be/d2PMvKbkqJ8",
    isPremiere: false, isComingSoon: false,
    releaseDate: "2026-05-07",
    ...fmt(["SUB", "2D"]),
  },
  {
    id: "michael", title: "Michael",
    synopsis: "Michael es un retrato íntimo de la vida y el legado de uno de los artistas más influyentes que el mundo haya conocido. Protagonizada por Jaafar Jackson en su debut cinematográfico.",
    duration: 135, rating: "12-A" as AgeRating, genre: "Biografía",
    director: "Antoine Fuqua",
    actors: ["Laura Harrier", "Nia Long", "Miles Teller", "Colman Domingo", "Jaafar Jackson"],
    posterUrl: poster("69a89f9ac2aea8f95819f304", "michael-108085-1773066570931"),
    trailerUrl: "https://www.youtube.com/watch?v=KQEMoeqKNUU",
    isPremiere: false, isComingSoon: false,
    releaseDate: "2026-04-23",
    ...fmt(["DOB", "2D", "DBOX", "XD", "SUB"]),
  },
  {
    id: "diablo-viste-a-la-moda-2", title: "Diablo Viste a la Moda 2",
    originalTitle: "The Devil Wears Prada 2",
    synopsis: "Casi veinte años después de dar vida a los icónicos personajes Miranda, Andy, Emily y Nigel, Meryl Streep, Anne Hathaway, Emily Blunt y Stanley Tucci regresan a las elegantes calles de Nueva York y a las sofisticadas oficinas de la revista Runway.",
    duration: 120, rating: "TBC" as AgeRating, genre: "Comedia",
    director: "David Frankel",
    actors: ["Stanley Tucci", "Kenneth Branagh", "Emily Blunt", "Meryl Streep", "Anne Hathaway", "Lucy Liu"],
    posterUrl: poster("69bc2dec952d761a90a846c8", "diablo-viste-a-la-moda-2-109658-1773943906092"),
    trailerUrl: "https://youtu.be/OjKXbRJ4SVg",
    isPremiere: false, isComingSoon: false,
    releaseDate: "2026-04-30",
    ...fmt(["DOB", "2D", "DBOX", "XD", "SUB"]),
  },
  {
    id: "super-mario-galaxy", title: "Super Mario Galaxy",
    synopsis: "Mario y Luigi salen del Reino Champiñón para una aventura intergaláctica. Esta vez, la batalla se traslada al espacio y Bowser Jr será quien se les cruce en el camino.",
    duration: 95, rating: "7-A" as AgeRating, genre: "Aventuras",
    director: "Aaron Horvath, Michael Jelenic",
    actors: ["Jack Black", "Charlie Day", "Chris Pratt", "Anya Taylor-Joy", "Keegan-Michael Key"],
    posterUrl: poster("699cb79550a33d4922bd73ce", "super-mario-galaxy-108980-1771881270577"),
    trailerUrl: "https://www.youtube.com/watch?v=SnNHqJcQY9I",
    isPremiere: false, isComingSoon: false,
    releaseDate: "2026-04-02",
    ...fmt(["DOB", "2D"]),
  },
  {
    id: "la-posesion-de-la-momia", title: "La Posesión de la Momia",
    synopsis: "Nueva versión del clásico 'La Momia'. La joven hija de un periodista desaparece en el desierto sin dejar rastro. Ocho años más tarde, la familia rota se conmociona cuando ella es devuelta a ellos.",
    duration: 135, rating: "18-A" as AgeRating, genre: "Terror",
    director: "Lee Cronin",
    actors: ["Jack Reynor", "May Calamawy", "Laia Costa"],
    posterUrl: poster("69bc2dec952d761a90a846b5", "la-posesion-de-la-momia-109657-1776436364888"),
    trailerUrl: "https://www.youtube.com/watch?v=Ewp0-Qj2Tos",
    isPremiere: false, isComingSoon: false,
    releaseDate: "2026-04-16",
    ...fmt(["DOB", "2D"]),
  },
  {
    id: "the-amazing-digital-circus", title: "The Amazing Digital Circus",
    synopsis: "La sensación viral de internet, The Amazing Digital Circus, llega a su esperada conclusión en un estreno cinematográfico. Con Caine desaparecido y el circo sumido en tinieblas, nuestro elenco descubre la verdad sobre el Circo Digital y su historia.",
    duration: 100, rating: "TBC" as AgeRating, genre: "Drama",
    director: "Gooseworx",
    actors: ["Lizzie Freeman", "Michael Kovach", "Amanda Hufford"],
    posterUrl: poster("69deb42f70b9fbe13890ef36", "the-amazing-digital-circus-109993-1776202999869"),
    trailerUrl: "https://youtu.be/DLBjDbJ0AHE",
    isPremiere: true, isComingSoon: false,
    releaseDate: "2026-06-04",
    ...fmt(["DOB", "2D", "XD", "SUB"]),
  },
  {
    id: "txt-moa-con-in-japan", title: "TXT MOA CON IN JAPAN",
    synopsis: "Un concierto especial preparado exclusivamente por MOA para celebrar el 7 aniversario del debut de TOMORROW X TOGETHER. Disfruta de una potente actuación en directo de la banda desde el IG Arena de Aichi, Nagoya.",
    duration: 225, rating: "7-A" as AgeRating, genre: "Musical",
    director: "HYBE / BIGHIT MUSIC",
    actors: ["Tomorrow X Together"],
    posterUrl: poster("69f8c149e29e4b5b94de50f0", "txt-moa-con-in-japan-110287-1778008410221"),
    isPremiere: true, isComingSoon: false,
    releaseDate: "2026-05-24",
    ...fmt(["2D"]),
  },
  {
    id: "the-mandalorian-and-grogu", title: "The Mandalorian and Grogu",
    synopsis: "El cruel Imperio ha caído, pero los señores de la guerra imperiales siguen dispersos por toda la Galaxia. La incipiente Nueva República trabaja para proteger las conquistas de la Rebelión con la ayuda del legendario cazarrecompensas mandaloriano, Din Djarin, y su joven aprendiz, Grogu.",
    duration: 130, rating: "TBC" as AgeRating, genre: "Acción",
    director: "Jon Favreau",
    actors: ["Pedro Pascal", "Sigourney Weaver", "Jeremy Allen White"],
    posterUrl: poster("69d6e03feecab883fbfefcd5", "the-mandalorian-and-grogu-109282-1775746951324"),
    trailerUrl: "https://youtu.be/nPRO_iL3sxE",
    isPremiere: true, isComingSoon: false,
    releaseDate: "2026-05-21",
    ...fmt(["DOB", "2D", "3D", "DBOX", "XD", "SUB"]),
  },
  {
    id: "top-gun-40", title: "Top Gun: 40 Aniversario",
    originalTitle: "Top Gun (1986) - 40th Anniversary",
    synopsis: "Cuatro décadas después de marcar un hito generacional, este emblemático éxito de 1986 regresa a la gran pantalla con Tom Cruise en la piel del inolvidable Pete 'Maverick' Mitchell, reviviendo la épica que redefinió el cine de acción.",
    duration: 110, rating: "7-A" as AgeRating, genre: "Acción",
    director: "Tony Scott",
    actors: ["Tom Cruise", "Val Kilmer", "Kelly McGillis"],
    posterUrl: poster("69ef7564fdc71a77de3d4196", "re-top-gun-ani-40-110232-1777300948868"),
    trailerUrl: "https://youtu.be/9IqLepjMxEY",
    isPremiere: false, isComingSoon: false,
    releaseDate: "2026-05-14",
    isReRelease: true,
    ...fmt(["DOB", "2D", "SUB"]),
  },
  {
    id: "top-gun-maverick-re", title: "Top Gun: Maverick (Reestreno)",
    originalTitle: "Top Gun: Maverick",
    synopsis: "Después de más de treinta años de servicio, Pete 'Maverick' Mitchell se encuentra donde siempre quiso estar. Cuando es destinado a la academia de Top Gun para entrenar a pilotos de élite, se encuentra con el hijo de su difunto amigo.",
    duration: 130, rating: "12-A" as AgeRating, genre: "Acción",
    director: "Joseph Kosinski",
    actors: ["Tom Cruise", "Jennifer Connelly", "Miles Teller"],
    posterUrl: poster("69ef986ecb225335d9704295", "re-top-gun-maverick-110233-1777312020618"),
    trailerUrl: "https://www.youtube.com/watch?v=wmLvWvHG4uM",
    isPremiere: false, isComingSoon: false,
    releaseDate: "2026-05-14",
    isReRelease: true,
    ...fmt(["DOB", "2D", "SUB"]),
  },
]

// ─── TICKETS ─────────────────────────────────────────────────────

export const ticketTypes: TicketType[] = [
  { id: "general", name: "General", description: "Boleto general", price: 10.00, isLoyaltyOnly: false, maxPerOrder: 20 },
  { id: "child", name: "Niño (2-11)", description: "Boleto para niños de 2 a 11 años", price: 7.00, isLoyaltyOnly: false, maxPerOrder: 20 },
  { id: "senior", name: "Adulto Mayor (60+)", description: "Boleto para adultos mayores de 60 años", price: 7.00, isLoyaltyOnly: false, maxPerOrder: 20 },
  { id: "gold", name: "Gold (Cine Club)", description: "Ahorra más con Cine Club", price: 8.00, isLoyaltyOnly: true, maxPerOrder: 20 },
  { id: "pro", name: "PRO (Membresía)", description: "Todos los días hasta 50% off", price: 5.00, isLoyaltyOnly: true, maxPerOrder: 20 },
]

export const ticketPackages = [
  {
    id: "2x1-davivienda", name: "2x1 Davivienda Mastercard",
    description: "Paga 1 y lleva 2 con tarjetas de crédito Davivienda Mastercard",
    price: 10.00,
    ticketTypes: [{ ticketTypeId: "general", quantity: 2 }],
    binDetails: ["543982", "547482", "559225", "517796", "524052", "526943", "540581", "540692", "541083", "541694", "547130", "547246", "549724", "552201", "552336", "552903", "554531", "549156"],
  },
  {
    id: "2x1-amex", name: "2x1 American Express",
    description: "Paga 1 boleto y lleva el segundo GRATIS con American Express",
    price: 10.00,
    ticketTypes: [{ ticketTypeId: "general", quantity: 2 }],
    binDetails: ["377843", "377814", "377886", "379353", "377816", "377815", "377813", "377845", "377847", "379561", "379362", "379361", "379354"],
  },
]

// ─── CONCESSIONS ─────────────────────────────────────────────────

export const concessionCategories: ConcessionCategory[] = [
  {
    id: "combos", name: "Combos",
    items: [
      mkItem("combo-personal", "Combo Personal", "1 Palomitas Medianas + 1 Gaseosa Mediana", 7.50),
      mkItem("combo-personal-grande", "Combo Personal (Gaseosa Grande)", "1 Palomitas Medianas + 1 Gaseosa Grande", 8.50),
      mkItem("combo-pareja", "Combo Pareja", "1 Palomitas Grande + 2 Gaseosas Medianas", 11.00),
      mkItem("combo-pareja-grande", "Combo Pareja (Gaseosa Grande)", "1 Palomitas Grande + 2 Gaseosas Grandes", 12.50),
      mkItem("combo-duo", "Combo Duo", "2 Palomitas Grandes + 2 Gaseosas Grandes", 15.00),
      mkItem("combo-trio", "Combo Trio", "3 Palomitas Medianas + 3 Gaseosas Medianas", 19.00),
      mkItem("combo-gigante", "Combo Gigante", "2 Gaseosas Medianas + 1 Palomitas Gigante", 13.00),
      mkItem("combo-mega-gigante", "Combo Mega Gigante", "2 Gaseosas Grandes + 1 Palomitas Gigante + 1 Agua", 14.00),
    ],
  },
  {
    id: "palomitas", name: "Palomitas",
    items: [
      mkItem("palomitas-medianas", "Palomitas Medianas", "Palomitas de maíz medianas", 5.00),
      mkItem("palomitas-grandes", "Palomitas Grandes", "Palomitas de maíz grandes", 6.50),
      mkItem("palomitas-gigante", "Palomitas Gigante", "Palomitas de maíz gigante", 8.00),
    ],
  },
  {
    id: "bebidas", name: "Bebidas",
    items: [
      mkItem("gaseosa-mediana", "Gaseosa Mediana", "Gaseosa mediana", 4.00),
      mkItem("gaseosa-grande", "Gaseosa Grande", "Gaseosa grande", 5.00),
      mkItem("agua", "Agua", "Botella de agua", 3.00),
    ],
  },
  {
    id: "complementos", name: "Complementos",
    items: [
      { ...mkItem("hot-dog", "Hot Dog", "Frankfurter completo", 4.50), modifiers: undefined },
      { ...mkItem("nachos", "Nachos", "Nachos con queso", 5.00), modifiers: undefined },
      { ...mkItem("dulces", "Dulces", "Dulces variados", 3.50), modifiers: undefined },
      { ...mkItem("upgrade-dulce", "Cambiar a Palomitas Dulces", "Cambia tus palomitas saladas a dulces o mixtas", 1.00), modifiers: undefined },
    ],
  },
  {
    id: "combos-especiales", name: "Combos Especiales",
    items: [
      { ...mkItem("combo-frankfurt", "Combo Frankfurt", "1 Hot Dog + 1 Gaseosa Mediana", 7.00), modifiers: undefined },
      { ...mkItem("combo-nachos", "Combo Nachos", "1 Nachos + 1 Gaseosa Mediana", 7.50), modifiers: undefined },
    ],
  },
]

function mkItem(id: string, name: string, description: string, price: number): ConcessionItem {
  return {
    id, name, description, price, categoryId: "",
    buyOptions: [{ description: name, price }],
  }
}

// Assign categoryId
for (const cat of concessionCategories) {
  for (const item of cat.items) {
    item.categoryId = cat.id
  }
}

// ─── PROMOTIONS ──────────────────────────────────────────────────

export const promotions: Promotion[] = [
  {
    id: "martes-2x1", name: "Martes 2x1",
    description: "2 boletos al precio de 1 todos los martes",
    type: "discount", price: 10.00,
    includes: ["2 boletos General", "Palomitas Medianas"],
  },
  {
    id: "miercoles-mujer", name: "Miércoles de la Mujer",
    description: "Descuento especial para ellas",
    type: "discount", price: 7.00,
    includes: ["1 boleto General", "Palomitas Medianas"],
  },
  {
    id: "2x1-davivienda", name: "2x1 Davivienda Mastercard",
    description: "2x1 en boletos con tarjetas de crédito Davivienda Mastercard",
    type: "bank",
    bankBin: ["543982", "547482", "559225", "517796", "524052", "526943", "540581", "540692", "541083", "541694", "547130", "547246", "549724", "552201", "552336", "552903", "554531", "549156"],
    bankName: "Davivienda",
    includes: ["2 boletos General", "Aplican términos y condiciones"],
  },
  {
    id: "2x1-amex", name: "2x1 American Express",
    description: "2x1 en boletos con tarjetas American Express",
    type: "bank",
    bankBin: ["377843", "377814", "377886", "379353", "377816", "377815", "377813", "377845", "377847", "379561", "379362", "379361", "379354"],
    bankName: "American Express",
    includes: ["2 boletos General", "Aplican términos y condiciones"],
  },
  {
    id: "boleta-mensual-pro", name: "Boleta Mensual PRO",
    description: "Una boleta 2D gratis cada mes con tu membresía PRO",
    type: "loyalty",
    includes: ["1 boleto General 2D"],
  },
]

// ─── SEAT LAYOUT (Sala 3 - Unicentro Pasto - real data) ─────────

interface RawSeat { rowIndex: number; columnIndex: number; id: string; status: number }

function buildSeatLayout(cinemaId: string, screenNumber: number): SeatLayout {
  const rawSeats: RawSeat[] = rawLayoutData.map(r => ({ ...r }))
  const rowMap = new Map<number, { name: string; seats: RawSeat[] }>()
  for (const rs of rawSeats) {
    if (!rowMap.has(rs.rowIndex)) rowMap.set(rs.rowIndex, { name: rowLabels[rs.rowIndex] ?? "", seats: [] })
    rowMap.get(rs.rowIndex)!.seats.push(rs)
  }
  const rows: SeatRow[] = []
  const sortedRowIndices = [...rowMap.keys()].sort((a, b) => a - b)
  for (const ri of sortedRowIndices) {
    const r = rowMap.get(ri)!
    if (r.seats.length === 0) continue
    rows.push({
      name: r.name,
      seats: r.seats.sort((a, b) => a.columnIndex - b.columnIndex).map(s => ({
        id: `${rowLabels[s.rowIndex] ?? ri}${s.columnIndex}`,
        rowName: rowLabels[s.rowIndex] ?? "",
        columnIndex: s.columnIndex,
        rowIndex: s.rowIndex,
        status: seatStatus(s.status),
      })),
    })
  }
  return {
    cinemaId, screenNumber,
    areaNumber: 1, areaName: "Sala 3",
    totalSeats: 155,
    rows,
    screenPosition: { left: 5.8824, width: 88.2353, top: 5.2632 },
    boundaryLeft: 5.8824, boundaryRight: 94.1177, boundaryTop: 5.2632,
    columnCount: 17, rowCount: rows.length,
  }
}

const rowLabels: Record<number, string> = {
  1: "O", 2: "N", 3: "M", 4: "L", 5: "K", 6: "J", 7: "I",
  8: "H", 9: "G", 10: "F", 11: "E", 12: "D", 13: "C", 14: "B", 15: "A",
}

const rawLayoutData: { rowIndex: number; columnIndex: number; id: string; status: number }[] = [
  // Row 1 (O) - cols 1-15
  ...[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(c => ({ rowIndex: 1, columnIndex: c, id: `${c}`, status: 0 })),
  // Row 2 (N) - cols 3-11, 14-15
  ...[3,4,5,6,7,8,9,10,11].map(c => ({ rowIndex: 2, columnIndex: c, id: `${c}`, status: c >= 7 && c <= 8 ? 1 : 0 })),
  ...[{ rowIndex: 2, columnIndex: 14, id: "14", status: 0 }, { rowIndex: 2, columnIndex: 15, id: "15", status: 0 }],
  // Row 3 (M) - cols 3-11, 14-15
  ...[3,4,5,6,7,8,9,10,11].map(c => ({ rowIndex: 3, columnIndex: c, id: `${c}`, status: 0 })),
  ...[{ rowIndex: 3, columnIndex: 14, id: "14", status: 0 }, { rowIndex: 3, columnIndex: 15, id: "15", status: 0 }],
  // Row 4 (L) - cols 3-11, 14-15 (3-9 occupied)
  ...[3,4,5,6,7,8,9,10,11].map(c => ({ rowIndex: 4, columnIndex: c, id: `${c}`, status: c <= 9 ? 1 : 0 })),
  ...[{ rowIndex: 4, columnIndex: 14, id: "14", status: 0 }, { rowIndex: 4, columnIndex: 15, id: "15", status: 0 }],
  // Row 5 (K) - cols 3-11, 14-15 (7-10 occupied)
  ...[3,4,5,6,7,8,9,10,11].map(c => ({ rowIndex: 5, columnIndex: c, id: `${c}`, status: c >= 7 && c <= 10 ? 1 : 0 })),
  ...[{ rowIndex: 5, columnIndex: 14, id: "14", status: 0 }, { rowIndex: 5, columnIndex: 15, id: "15", status: 0 }],
  // Row 6 (J) - cols 3-11, 14-15 (6-9 occupied)
  ...[3,4,5,6,7,8,9,10,11].map(c => ({ rowIndex: 6, columnIndex: c, id: `${c}`, status: c >= 6 && c <= 9 ? 1 : 0 })),
  ...[{ rowIndex: 6, columnIndex: 14, id: "14", status: 0 }, { rowIndex: 6, columnIndex: 15, id: "15", status: 0 }],
  // Row 7 (I) - cols 3-11, 14-15 (7-8 occupied)
  ...[3,4,5,6,7,8,9,10,11].map(c => ({ rowIndex: 7, columnIndex: c, id: `${c}`, status: c >= 7 && c <= 8 ? 1 : 0 })),
  ...[{ rowIndex: 7, columnIndex: 14, id: "14", status: 0 }, { rowIndex: 7, columnIndex: 15, id: "15", status: 0 }],
  // Row 8 (H) - cols 3-11, 14-15 (5-8 occupied)
  ...[3,4,5,6,7,8,9,10,11].map(c => ({ rowIndex: 8, columnIndex: c, id: `${c}`, status: c >= 5 && c <= 8 ? 1 : 0 })),
  ...[{ rowIndex: 8, columnIndex: 14, id: "14", status: 0 }, { rowIndex: 8, columnIndex: 15, id: "15", status: 0 }],
  // Row 9 (G) - cols 3-11, 14-15 (6-9 occupied)
  ...[3,4,5,6,7,8,9,10,11].map(c => ({ rowIndex: 9, columnIndex: c, id: `${c}`, status: c >= 6 && c <= 9 ? 1 : 0 })),
  ...[{ rowIndex: 9, columnIndex: 14, id: "14", status: 0 }, { rowIndex: 9, columnIndex: 15, id: "15", status: 0 }],
  // Row 10 (F) - cols 3-11 (7-8 occupied)
  ...[3,4,5,6,7,8,9,10,11].map(c => ({ rowIndex: 10, columnIndex: c, id: `${c}`, status: c >= 7 && c <= 8 ? 1 : 0 })),
  // Row 11 (E) - cols 4-11 (5-6 occupied)
  ...[4,5,6,7,8,9,10,11].map(c => ({ rowIndex: 11, columnIndex: c, id: `${c}`, status: c >= 5 && c <= 6 ? 1 : 0 })),
  // Row 12 (D) - cols 3-11
  ...[3,4,5,6,7,8,9,10,11].map(c => ({ rowIndex: 12, columnIndex: c, id: `${c}`, status: 0 })),
  // Row 13 (C) - cols 3-11
  ...[3,4,5,6,7,8,9,10,11].map(c => ({ rowIndex: 13, columnIndex: c, id: `${c}`, status: 0 })),
  // Row 14 (B) - cols 3-11
  ...[3,4,5,6,7,8,9,10,11].map(c => ({ rowIndex: 14, columnIndex: c, id: `${c}`, status: 0 })),
  // Row 15 (A) - cols 3-11 (5,9 prioritize 7; 6,8 status 3)
  { rowIndex: 15, columnIndex: 3, id: "3", status: 0 },
  { rowIndex: 15, columnIndex: 4, id: "4", status: 0 },
  { rowIndex: 15, columnIndex: 5, id: "5", status: 7 },
  { rowIndex: 15, columnIndex: 6, id: "6", status: 3 },
  { rowIndex: 15, columnIndex: 8, id: "8", status: 3 },
  { rowIndex: 15, columnIndex: 9, id: "9", status: 7 },
  { rowIndex: 15, columnIndex: 10, id: "10", status: 0 },
  { rowIndex: 15, columnIndex: 11, id: "11", status: 0 },
]

export function getSeatLayout(cinemaId: string, screenNumber: number): SeatLayout {
  if (cinemaId === "2400" && screenNumber === 3) {
    return buildSeatLayout(cinemaId, screenNumber)
  }
  const cinema = cinemas.find(c => c.id === cinemaId)
  const screen = cinema?.screens.find(s => s.number === screenNumber)
  const totalSeats = screen?.totalSeats ?? 150
  return buildGenericLayout(cinemaId, screenNumber, totalSeats)
}

function buildGenericLayout(cinemaId: string, screenNumber: number, totalSeats: number): SeatLayout {
  const cols = 11
  const rows = Math.floor(totalSeats / cols)
  const seatRows: SeatRow[] = []
  for (let ri = 0; ri < rows; ri++) {
    const name = String.fromCharCode(65 + (rows - 1 - ri))
    const seats: Seat[] = []
    for (let ci = 3; ci < 3 + cols; ci++) {
      seats.push({
        id: `${name}${ci}`,
        rowName: name, columnIndex: ci, rowIndex: ri,
        status: "available",
      })
    }
    seatRows.push({ name, seats })
  }
  return {
    cinemaId, screenNumber,
    areaNumber: 1, areaName: `Sala ${screenNumber}`,
    totalSeats, rows: seatRows,
    screenPosition: { left: 10, width: 80, top: 5 },
    boundaryLeft: 5, boundaryRight: 95, boundaryTop: 5,
    columnCount: cols + 4, rowCount: rows,
  }
}

// ─── SHOWTIME GENERATOR ──────────────────────────────────────────

export function generateShowtimes(
  movieId?: string,
  cinemaId?: string,
  date?: string,
  format?: ScreenFormat,
  language?: Language,
): Showtime[] {
  const targetDate = date ?? today()
  const results: Showtime[] = []

  const movieFilter = movieId ? movies.filter(m => m.id === movieId) : movies
  const cinemaFilter = cinemaId ? cinemas.filter(c => c.id === cinemaId) : cinemas

  for (const cinema of cinemaFilter) {
    let showtimeId = 0
    for (const movie of movieFilter) {
      if (!moviePlaysAtCinema(movie, cinema)) continue

      const langs = matchLanguages(movie, language)
      const fmts = matchFormats(movie, cinema, format)

      if (langs.length === 0 || fmts.length === 0) continue

      const screen = pickScreen(cinema, fmts[0])
      if (!screen) continue

      const intervals = generateTimeSlots(targetDate, movie.duration, screen.number)
      const todayFactor = targetDate === today() ? 0.7 : 0.85

      for (const dt of intervals) {
        const validFmts = fmts.filter(f => screen.formats.includes(f))
        const fmt = validFmts.length > 0 ? pick(validFmts) : pick(fmts)
        const lang = pick(langs)
        const occup = Math.floor(Math.random() * Math.floor(screen.totalSeats * (1 - todayFactor)))
        const free = clamp(screen.totalSeats - occup, 0, screen.totalSeats)

        results.push({
          id: `${cinema.id}-${movie.id}-${++showtimeId}`,
          movieId: movie.id,
          cinemaId: cinema.id,
          screenNumber: screen.number,
          datetime: dt,
          format: fmt,
          language: lang,
          availableSeats: free,
          totalSeats: screen.totalSeats,
          price: basePrice(fmt),
        })
      }
    }
  }

  return results
}

export function getShowtimeById(id: string): Showtime | undefined {
  return generateShowtimes().find(s => s.id === id)
}

function moviePlaysAtCinema(movie: Movie, cinema: Cinema): boolean {
  if (cinema.id === "2400") return true
  if (movie.isComingSoon) return cinema.id === "2400"
  return true
}

function matchLanguages(movie: Movie, filter?: Language): Language[] {
  if (filter) return movie.languages.includes(filter) ? [filter] : []
  return movie.languages.length > 0 ? movie.languages : ["Doblada"]
}

function matchFormats(movie: Movie, cinema: Cinema, filter?: ScreenFormat): ScreenFormat[] {
  const available = movie.formats.filter(f => cinema.screens.some(s => s.formats.includes(f)))
  if (filter) return available.includes(filter) ? [filter] : []
  return available
}

function pickScreen(cinema: Cinema, format: ScreenFormat): CinemaScreen | undefined {
  const candidates = cinema.screens.filter(s => s.formats.includes(format))
  return candidates[Math.floor(Math.random() * candidates.length)]
}

function generateTimeSlots(dateStr: string, duration: number, screenNum: number): string[] {
  const times = [11, 13, 15, 17, 19, 21]
  const slots: string[] = []
  for (const h of times) {
    const offset = screenNum % 3
    const minutes = offset * 15
    if (slots.length < 4 && Math.random() > 0.3) {
      slots.push(`${dateStr}T${String(h).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`)
    }
  }
  return slots
}

function basePrice(format: ScreenFormat): number {
  const prices: Record<ScreenFormat, number> = {
    "2D": 10.00, "3D": 12.00, "XD": 13.00, "DBOX": 15.00, "PREMIUM": 12.50,
  }
  return prices[format] ?? 10.00
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

// ─── PRICE CALC ──────────────────────────────────────────────────

export function calculatePrice(format: ScreenFormat, ticketTypeId: string): number {
  const base = basePrice(format)
  const ticket = ticketTypes.find(t => t.id === ticketTypeId)
  if (!ticket) return base
  const ratio = ticket.price / (ticketTypes.find(t => t.id === "general")?.price ?? 10)
  return Math.round(base * ratio * 100) / 100
}
