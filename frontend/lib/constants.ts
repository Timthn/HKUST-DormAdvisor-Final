import { HallDataMap } from '@/types'

// HKUST Brand Colors
export const COLORS = {
  primary: '#003366', // HKUST Blue
  secondary: '#C5A059', // HKUST Gold
  lightBg: '#f7f9fc',
}

export const BOT_AVATAR_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZOSa9E0RS9sn58AjVN81CKNUjOmCJFrenEQ&s"
export const BACKGROUND_IMAGE = "https://storage.googleapis.com/a-stack-files/ddaafa17342766853a0e19ee246329dd.jpg"

export const HALL_FACILITIES: HallDataMap = {
  'Hall I': {
    name: 'Hall I',
    avgPrice: 'HK$ 3,100',
    roomTypes: 'Double / Triple',
    ac: 'Yes (Prepaid)',
    bathroom: 'Shared (Per Floor)',
    gym: 'No (Near Sports Hall)',
    common: 'Common Room per Floor',
    laundry: 'G/F Laundry',
    features: 'Closest to academic building, strong hall culture, suitable for social butterflies.',
    tags: ['Social Hub'],
    tagColor: 'bg-green-500'
  },
  'Hall II': {
    name: 'Hall II',
    avgPrice: 'HK$ 4,200',
    roomTypes: 'Double / Single',
    ac: 'Yes (Prepaid)',
    bathroom: 'Shared (Suite-style)',
    gym: 'Mini Gym Corner',
    common: 'Sea View Common Room',
    laundry: 'On each floor',
    features: 'Panoramic sea view, vertical layout, best value for ocean lovers.',
    tags: ['Sea View Choice'],
    tagColor: 'bg-orange-400'
  },
  'Hall IV': {
    name: 'Hall IV',
    avgPrice: 'HK$ 4,800',
    roomTypes: 'Single / Double',
    ac: 'Yes (Smart Control)',
    bathroom: 'En-suite (Partial)',
    gym: 'New Gym',
    common: 'Multi-function Room',
    laundry: 'G/F Smart Laundry',
    features: 'Renovated facilities, balanced value, perfect for mid-range budget.',
    tags: ['Top Pick'],
    tagColor: 'bg-[#2b5dad]'
  },
  'Hall V': {
    name: 'Hall V',
    avgPrice: 'HK$ 4,500',
    roomTypes: 'Single (Majority)',
    ac: 'Yes',
    bathroom: 'Shared',
    gym: 'No',
    common: 'Reading Rooms',
    laundry: 'G/F',
    features: 'Quiet environment, mostly single rooms, renovated recently.'
  },
  'Hall VI': {
    name: 'Hall VI',
    avgPrice: 'HK$ 4,900',
    roomTypes: 'Double / Triple',
    ac: 'Yes',
    bathroom: 'Shared',
    gym: 'Sea View Gym',
    common: 'Sea View Corridor',
    laundry: 'G/F',
    features: 'The famous "Sea View Corridor", newer facilities, active events.'
  }
}
