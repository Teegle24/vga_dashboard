/**
 * The Idaho course list the demo starts from. Replace this file when the real
 * course data arrives — nothing else needs to change.
 *
 * Course names and cities are real Idaho courses so Mark recognizes the list.
 * Everything else is invented: phone numbers use the reserved 555-01xx range,
 * and contacts and events are made up. The UI labels this as sample data, and
 * "Start over with sample data" in the footer restores it.
 */

export interface CourseSeed {
  name: string
  address: string
  city: string
  zip: string
  website: string
  listRate: number
  contact?: {
    name: string
    email: string
    phone: string
    /** Days ago this contact was last confirmed. */
    confirmedDaysAgo: number
    notes?: string
    by: string
  }
}

export interface EventSeed {
  courseSlug: string
  name: string
  /** Days from today. Negative is in the past. */
  offsetDays: number
  headcount: number | null
  ratePaid: number | null
  firstTeeTime?: string
  groupsHeld?: number
  headcountSent?: boolean
  teeSheetSent?: boolean
  alertsOn?: boolean
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export const COURSE_SEEDS: CourseSeed[] = [
  {
    name: 'BanBury Golf Course',
    address: '2626 N Marypost Pl',
    city: 'Eagle',
    zip: '83616',
    website: 'banburygolf.com',
    listRate: 62,
    contact: {
      name: 'Dave Whitaker',
      email: 'events@banburygolf.example',
      phone: '208-555-0118',
      confirmedDaysAgo: 34,
      notes:
        'Prefers a call over email. Will hold 40 spots without a deposit for VGA.',
      by: 'Mark Brinkman',
    },
  },
  {
    name: 'Falcon Crest Golf Club',
    address: '11102 S Cloverdale Rd',
    city: 'Kuna',
    zip: '83634',
    website: 'falconcrestgolf.com',
    listRate: 55,
    contact: {
      name: 'Sheri Lang',
      email: 'proshop@falconcrestgolf.example',
      phone: '208-555-0143',
      confirmedDaysAgo: 12,
      notes: 'Good veteran rate in shoulder season. Ask about the grill package.',
      by: 'Mark Brinkman',
    },
  },
  {
    name: 'Eagle Hills Golf Course',
    address: '605 N Edgewood Ln',
    city: 'Eagle',
    zip: '83616',
    website: 'eaglehillsgolfcourse.com',
    listRate: 48,
    contact: {
      name: 'Tom Reyes',
      email: 'tom@eaglehills.example',
      phone: '208-555-0167',
      confirmedDaysAgo: 210,
      notes: 'Contact may be out of date — last confirmed over six months ago.',
      by: 'Mark Brinkman',
    },
  },
  {
    name: 'Ridgecrest Golf Club',
    address: '3730 Ridgecrest Dr',
    city: 'Nampa',
    zip: '83687',
    website: 'ridgecrestgolfclub.com',
    listRate: 52,
    contact: {
      name: 'Angela Pruitt',
      email: 'angela@ridgecrestgolf.example',
      phone: '208-555-0102',
      confirmedDaysAgo: 58,
      by: 'Mark Brinkman',
    },
  },
  {
    name: 'Warm Springs Golf Course',
    address: '2495 Warm Springs Ave',
    city: 'Boise',
    zip: '83712',
    website: 'warmspringsgolfcourse.com',
    listRate: 45,
    contact: {
      name: 'Curtis Behn',
      email: 'curtis@warmspringsgolf.example',
      phone: '208-555-0131',
      confirmedDaysAgo: 21,
      notes: 'City-run, so rates are fixed. Book early for weekend mornings.',
      by: 'Mark Brinkman',
    },
  },
  {
    name: 'Shadow Valley Golf Course',
    address: '15192 Hwy 55',
    city: 'Boise',
    zip: '83714',
    website: 'shadowvalley.com',
    listRate: 49,
  },
  {
    name: 'Purple Sage Golf Course',
    address: '15192 Purple Sage Rd',
    city: 'Caldwell',
    zip: '83607',
    website: 'purplesagegolf.com',
    listRate: 42,
    contact: {
      name: 'Ray Delgado',
      email: 'ray@purplesagegolf.example',
      phone: '208-555-0155',
      confirmedDaysAgo: 95,
      by: 'Mark Brinkman',
    },
  },
  {
    name: 'Centennial Golf Course',
    address: '2600 Centennial Dr',
    city: 'Nampa',
    zip: '83651',
    website: 'golfcentennial.com',
    listRate: 40,
  },
  {
    name: 'River Birch Golf Course',
    address: '10440 W Beacon Light Rd',
    city: 'Star',
    zip: '83669',
    website: 'riverbirchgolf.com',
    listRate: 38,
  },
  {
    name: 'TimberStone Golf Course',
    address: '20925 Ustick Rd',
    city: 'Caldwell',
    zip: '83605',
    website: 'timberstonegolf.com',
    listRate: 44,
  },
  {
    name: 'The Coeur d’Alene Resort Golf Course',
    address: '900 S Floating Green Dr',
    city: 'Coeur d’Alene',
    zip: '83814',
    website: 'cdaresort.com/golf',
    listRate: 250,
    contact: {
      name: 'Bill Hargrove',
      email: 'grouptee@cdaresort.example',
      phone: '208-555-0190',
      confirmedDaysAgo: 41,
      notes: 'Premium resort pricing. Only realistic for the fall championship.',
      by: 'Mark Brinkman',
    },
  },
  {
    name: 'Circling Raven Golf Club',
    address: '27068 S Hwy 95',
    city: 'Worley',
    zip: '83876',
    website: 'cdacasino.com/golf',
    listRate: 135,
  },
  {
    name: 'The Links Golf Course',
    address: '2400 W Old Hwy 95',
    city: 'Post Falls',
    zip: '83854',
    website: 'thelinksgolfcourse.com',
    listRate: 46,
  },
  {
    name: 'Sand Creek Golf Course',
    address: '5230 Hackman Rd',
    city: 'Idaho Falls',
    zip: '83406',
    website: 'idahofallsidaho.gov/golf',
    listRate: 41,
    contact: {
      name: 'Marla Simmons',
      email: 'marla@sandcreekgolf.example',
      phone: '208-555-0176',
      confirmedDaysAgo: 8,
      by: 'Steve Okuda',
    },
  },
  {
    name: 'Canyon Springs Golf Course',
    address: '199 Canyon Springs Rd',
    city: 'Twin Falls',
    zip: '83301',
    website: 'canyonspringsgolf.com',
    listRate: 43,
  },
  {
    name: 'Highland Golf Course',
    address: '201 Van Elk Dr',
    city: 'Pocatello',
    zip: '83201',
    website: 'pocatello.us/golf',
    listRate: 39,
  },
  {
    name: 'McCall Golf Club',
    address: '925 Fairway Dr',
    city: 'McCall',
    zip: '83638',
    website: 'mccallgolfclub.com',
    listRate: 58,
    contact: {
      name: 'Pat Kearney',
      email: 'pat@mccallgolf.example',
      phone: '208-555-0124',
      confirmedDaysAgo: 66,
      notes: 'Short season — July and August only for a group this size.',
      by: 'Mark Brinkman',
    },
  },
  {
    name: 'Sun Valley Resort Golf Course',
    address: '200 Dollar Rd',
    city: 'Sun Valley',
    zip: '83353',
    website: 'sunvalley.com/golf',
    listRate: 185,
  },
]

export const EVENT_SEEDS: EventSeed[] = [
  // Past tournaments. These are what make rate history visible.
  {
    courseSlug: 'warm-springs-golf-course',
    name: 'Spring Kickoff',
    offsetDays: -186,
    headcount: 48,
    ratePaid: 38,
    firstTeeTime: '08:00',
    groupsHeld: 12,
    headcountSent: true,
    teeSheetSent: true,
  },
  {
    courseSlug: 'banbury-golf-course',
    name: 'Memorial Day Classic',
    offsetDays: -132,
    headcount: 72,
    ratePaid: 52,
    firstTeeTime: '07:30',
    groupsHeld: 18,
    headcountSent: true,
    teeSheetSent: true,
  },
  {
    courseSlug: 'ridgecrest-golf-club',
    name: 'June Medal',
    offsetDays: -96,
    headcount: 36,
    ratePaid: 44,
    firstTeeTime: '08:00',
    groupsHeld: 9,
    headcountSent: true,
    teeSheetSent: true,
  },
  {
    courseSlug: 'falcon-crest-golf-club',
    name: 'Independence Day Open',
    offsetDays: -68,
    headcount: 84,
    ratePaid: 47,
    firstTeeTime: '07:20',
    groupsHeld: 21,
    headcountSent: true,
    teeSheetSent: true,
  },
  {
    courseSlug: 'mccall-golf-club',
    name: 'Mountain Invitational',
    offsetDays: -44,
    headcount: 40,
    ratePaid: 50,
    firstTeeTime: '08:00',
    groupsHeld: 10,
    headcountSent: true,
    teeSheetSent: true,
  },
  {
    courseSlug: 'purple-sage-golf-course',
    name: 'August Medal',
    offsetDays: -30,
    headcount: 32,
    ratePaid: 35,
    firstTeeTime: '08:10',
    groupsHeld: 8,
    headcountSent: true,
    teeSheetSent: true,
  },
  {
    courseSlug: 'banbury-golf-course',
    name: 'Labor Day Tournament',
    offsetDays: -12,
    headcount: 64,
    ratePaid: 54,
    firstTeeTime: '07:30',
    groupsHeld: 16,
    headcountSent: true,
    teeSheetSent: true,
  },

  // Upcoming. One in the week-out headcount window, one in the 3–5 day
  // player-alert window, one still waiting on a hold.
  {
    courseSlug: 'eagle-hills-golf-course',
    name: 'Fall Medal',
    offsetDays: 7,
    headcount: 56,
    ratePaid: null,
    firstTeeTime: '07:30',
    groupsHeld: 14,
  },
  {
    courseSlug: 'warm-springs-golf-course',
    name: 'Veterans Day Tournament',
    offsetDays: 4,
    headcount: 44,
    ratePaid: null,
    firstTeeTime: '08:00',
    groupsHeld: 11,
  },
  {
    courseSlug: 'the-coeur-d-alene-resort-golf-course',
    name: 'Idaho State Championship',
    offsetDays: 33,
    headcount: 96,
    ratePaid: null,
    firstTeeTime: '07:00',
    groupsHeld: 24,
  },
  {
    courseSlug: 'ridgecrest-golf-club',
    name: 'Thanksgiving Tournament',
    offsetDays: 52,
    headcount: null,
    ratePaid: null,
  },
]

export const PLAYER_SEEDS = [
  { eventName: 'Veterans Day Tournament', memberName: 'Jim Holloway', phone: '208-555-0104' },
  { eventName: 'Veterans Day Tournament', memberName: 'Pete Alvarez', phone: '208-555-0111' },
  { eventName: 'Veterans Day Tournament', memberName: 'Walt Jensen', phone: '208-555-0122' },
  { eventName: 'Veterans Day Tournament', memberName: 'Harold Quinn', phone: '208-555-0128' },
  { eventName: 'Veterans Day Tournament', memberName: 'Earl Whitcomb', phone: '208-555-0133' },
  { eventName: 'Veterans Day Tournament', memberName: 'Sam Ortiz', phone: '208-555-0139' },
  { eventName: 'Veterans Day Tournament', memberName: 'Don Keeler', phone: '208-555-0146' },
  { eventName: 'Veterans Day Tournament', memberName: 'Frank Mullins', phone: '208-555-0150' },
  { eventName: 'Veterans Day Tournament', memberName: 'Ray Stoddard', phone: '208-555-0158' },
  { eventName: 'Veterans Day Tournament', memberName: 'Gene Harlan', phone: '208-555-0164' },
  { eventName: 'Veterans Day Tournament', memberName: 'Chuck Blevins', phone: '208-555-0169' },
  { eventName: 'Veterans Day Tournament', memberName: 'Al Moretti', phone: '208-555-0174' },
  { eventName: 'Fall Medal', memberName: 'Tom Braddock', phone: '208-555-0108' },
  { eventName: 'Fall Medal', memberName: 'Bill Kearns', phone: '208-555-0115' },
  { eventName: 'Fall Medal', memberName: 'Mike Santoro', phone: '208-555-0120' },
  { eventName: 'Fall Medal', memberName: 'Joe Pennington', phone: '208-555-0126' },
  { eventName: 'Fall Medal', memberName: 'Steve Okuda', phone: '208-555-0134' },
  { eventName: 'Fall Medal', memberName: 'Carl Briggs', phone: '208-555-0140' },
  { eventName: 'Fall Medal', memberName: 'Ned Paulson', phone: '208-555-0148' },
  { eventName: 'Fall Medal', memberName: 'Henry Voss', phone: '208-555-0152' },
  { eventName: 'Idaho State Championship', memberName: 'Mark Brinkman', phone: '208-555-0101' },
  { eventName: 'Idaho State Championship', memberName: 'Dave Whitaker', phone: '208-555-0118' },
  { eventName: 'Idaho State Championship', memberName: 'Pat Kearney', phone: '208-555-0124' },
  { eventName: 'Idaho State Championship', memberName: 'Curtis Behn', phone: '208-555-0131' },
]

export const WAITLIST_SEEDS = [
  { eventName: 'Veterans Day Tournament', memberName: 'Lou Packer', phone: '208-555-0180' },
  { eventName: 'Veterans Day Tournament', memberName: 'Ken Drury', phone: '208-555-0182' },
  { eventName: 'Fall Medal', memberName: 'Ron Castellano', phone: '208-555-0161' },
  { eventName: 'Fall Medal', memberName: 'Gary Nuñez', phone: '208-555-0173' },
  { eventName: 'Fall Medal', memberName: 'Phil Graves', phone: '208-555-0178' },
  {
    eventName: 'Idaho State Championship',
    memberName: 'Dennis Fryar',
    phone: '208-555-0184',
  },
  {
    eventName: 'Idaho State Championship',
    memberName: 'Art Lindholm',
    phone: '208-555-0188',
  },
]

/** Members not yet on a tournament, plus extras the director keeps on file. */
export const EXTRA_MEMBER_SEEDS = [
  { name: 'Roy Timmons', phone: '208-555-0191', city: 'Meridian' },
  { name: 'Paul Hendricks', phone: '208-555-0193', city: 'Boise' },
  { name: 'Vic Romero', phone: '208-555-0195', city: 'Nampa' },
  { name: 'Stan Collett', phone: '208-555-0197', city: 'Idaho Falls' },
]
