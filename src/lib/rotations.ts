type Layover = {
	location: string;
	totalTime: number;
};

type Rotation = {
	rotationNumber: string;
	base: string;
	dest: string;
	layovers: Layover[];
	hotels: string[];
	checkIn: Date;
	blockIn: Date;
	release: Date;
};

// List of common airport codes for variety
const airportCodes = [
	'ATL',
	'LAX',
	'ORD',
	'DFW',
	'DEN',
	'SFO',
	'SEA',
	'CLT',
	'LAS',
	'MCO',
	'PHX',
	'IAH',
	'MSP',
	'DTW',
	'PHL',
	'BOS',
	'BWI',
	'DEN',
	'SLC',
	'SAN',
	'TPA',
	'FLL',
	'MDW',
	'HNL',
	'PDX',
	'OAK',
	'AUS',
	'HOU',
	'SMF',
	'SJC',
	'BUR',
	'ONT',
	'SNA',
	'LGB',
	'JFK',
	'LGA',
	'EWR',
	'DCA',
	'IAD',
	'BOS',
	'MIA',
	'FLL',
	'PBI',
	'RSW',
	'JAX',
	'CHS',
	'CLT',
	'GSP',
	'AVL',
	'ILM'
];

// List of fake hotel names
const hotelNames = [
	'Marriott Downtown',
	'Hyatt Regency',
	'Hilton Garden Inn',
	'Sheraton Suites',
	'The Plaza Hotel',
	'InterContinental',
	'Four Seasons',
	'The Ritz-Carlton',
	'Embassy Suites',
	'Courtyard by Marriott',
	'Best Western',
	'Holiday Inn Express',
	'Radisson Blu',
	'W Hotel',
	'The St. Regis',
	'Mandarin Oriental',
	'JW Marriott',
	'Omni Hotels & Resorts',
	'Loews Hotels',
	'Kimpton Hotels'
];

// Helper function to get a random element from an array
function getRandomElement<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

// Helper function to generate a random date within a specified range
function getRandomDate(startDate: Date, endDate: Date): Date {
	const timeDiff = endDate.getTime() - startDate.getTime();
	const randomTime = Math.random() * timeDiff;
	return new Date(startDate.getTime() + randomTime);
}

// Helper function to generate a random number of layovers
function getRandomLayovers(): { location: string; totalTime: number }[] {
	const numLayovers = Math.floor(Math.random() * 3); // 0 to 2 layovers
	const layovers: { location: string; totalTime: number }[] = [];
	const usedLayoverLocations = new Set<string>();

	for (let i = 0; i < numLayovers; i++) {
		let layoverLocation = getRandomElement(airportCodes);
		// Ensure layover locations are unique and not the same as base or dest
		while (usedLayoverLocations.has(layoverLocation)) {
			layoverLocation = getRandomElement(airportCodes);
		}
		usedLayoverLocations.add(layoverLocation);
		layovers.push({ location: layoverLocation, totalTime: Math.floor(Math.random() * 6) + 1 }); // Dummy totalTime between 1 and 6 hours
	}
	return layovers;
}

// Helper function to generate a random number of hotels
function getRandomHotels(): string[] {
	const numHotels = Math.floor(Math.random() * 3) + 1; // 1 to 3 hotels
	const hotels: string[] = [];
	const usedHotelNames = new Set<string>();

	for (let i = 0; i < numHotels; i++) {
		let hotelName = getRandomElement(hotelNames);
		// Ensure hotel names are unique
		while (usedHotelNames.has(hotelName)) {
			hotelName = getRandomElement(hotelNames);
		}
		usedHotelNames.add(hotelName);
		hotels.push(hotelName);
	}
	return hotels;
}

// Generate 100 dummy rotations
const rotations: Rotation[] = [];
const today = new Date();
today.setHours(0, 0, 0, 0); // Normalize today to the start of the day
const oneYearFromNow = new Date(today);
oneYearFromNow.setFullYear(today.getFullYear() + 1);

for (let i = 1; i <= 100; i++) {
	let base = getRandomElement(airportCodes);
	let dest = getRandomElement(airportCodes);
	// Ensure base and dest are different
	while (base === dest) {
		dest = getRandomElement(airportCodes);
	}

	// Generate release date first, ensuring it's at least 3 days from today
	const minReleaseDate = new Date(today);
	minReleaseDate.setDate(today.getDate() + 3);
	const release = getRandomDate(minReleaseDate, oneYearFromNow);

	// Generate checkIn date before release, with a minimum of 1 day and a maximum of 30 days before release
	const maxCheckInDate = new Date(release);
	maxCheckInDate.setDate(release.getDate() - 1); // At least 1 day before release

	const minCheckInDate = new Date(release);
	minCheckInDate.setDate(release.getDate() - 30); // Max 30 days before release

	// Ensure minCheckInDate is not in the past if release is very close to today
	const actualMinCheckInDate = minCheckInDate < today ? today : minCheckInDate;

	// Ensure checkIn is not before today
	const checkIn = getRandomDate(actualMinCheckInDate, maxCheckInDate);

	// Generate blockIn 30 minutes before checkIn
	const blockIn = new Date(checkIn);
	blockIn.setMinutes(checkIn.getMinutes() - 30);

	// Ensure layovers do not include base or dest
	const layovers = getRandomLayovers().filter(
		(layover) => layover.location !== base && layover.location !== dest
	);

	rotations.push({
		rotationNumber: `ROT-${i.toString().padStart(3, '0')}`,
		base,
		dest,
		layovers,
		hotels: getRandomHotels(),
		checkIn,
		blockIn,
		release
	});
}

// Export the rotations
export default rotations;
