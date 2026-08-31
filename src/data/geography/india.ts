import type { IndiaState, District } from '@/types/geography'

export const INDIA_STATES: IndiaState[] = [
  {
    id: 'tn', name: 'Tamil Nadu', code: 'TN', type: 'state', capital: 'Chennai', region: 'South',
    districts: [
      { id: 'tn-chennai', stateId: 'tn', stateName: 'Tamil Nadu', name: 'Chennai' },
      { id: 'tn-coimbatore', stateId: 'tn', stateName: 'Tamil Nadu', name: 'Coimbatore' },
      { id: 'tn-madurai', stateId: 'tn', stateName: 'Tamil Nadu', name: 'Madurai' },
      { id: 'tn-tuticorin', stateId: 'tn', stateName: 'Tamil Nadu', name: 'Thoothukudi (Tuticorin)' },
      { id: 'tn-tiruchirappalli', stateId: 'tn', stateName: 'Tamil Nadu', name: 'Tiruchirappalli' },
      { id: 'tn-tirunelveli', stateId: 'tn', stateName: 'Tamil Nadu', name: 'Tirunelveli' },
      { id: 'tn-vellore', stateId: 'tn', stateName: 'Tamil Nadu', name: 'Vellore' },
      { id: 'tn-salem', stateId: 'tn', stateName: 'Tamil Nadu', name: 'Salem' },
      { id: 'tn-erode', stateId: 'tn', stateName: 'Tamil Nadu', name: 'Erode' },
      { id: 'tn-thanjavur', stateId: 'tn', stateName: 'Tamil Nadu', name: 'Thanjavur' },
      { id: 'tn-dindigul', stateId: 'tn', stateName: 'Tamil Nadu', name: 'Dindigul' },
      { id: 'tn-tiruvannamalai', stateId: 'tn', stateName: 'Tamil Nadu', name: 'Tiruvannamalai' },
      { id: 'tn-virudhunagar', stateId: 'tn', stateName: 'Tamil Nadu', name: 'Virudhunagar' },
      { id: 'tn-tenkasi', stateId: 'tn', stateName: 'Tamil Nadu', name: 'Tenkasi' },
    ]
  },
  {
    id: 'ka', name: 'Karnataka', code: 'KA', type: 'state', capital: 'Bengaluru', region: 'South',
    districts: [
      { id: 'ka-bengaluru-urban', stateId: 'ka', stateName: 'Karnataka', name: 'Bengaluru Urban' },
      { id: 'ka-mysuru', stateId: 'ka', stateName: 'Karnataka', name: 'Mysuru' },
      { id: 'ka-hubli-dharwad', stateId: 'ka', stateName: 'Karnataka', name: 'Hubli-Dharwad' },
      { id: 'ka-mangaluru', stateId: 'ka', stateName: 'Karnataka', name: 'Mangaluru' },
      { id: 'ka-tumkur', stateId: 'ka', stateName: 'Karnataka', name: 'Tumkur' },
    ]
  },
  {
    id: 'mh', name: 'Maharashtra', code: 'MH', type: 'state', capital: 'Mumbai', region: 'West',
    districts: [
      { id: 'mh-mumbai', stateId: 'mh', stateName: 'Maharashtra', name: 'Mumbai' },
      { id: 'mh-pune', stateId: 'mh', stateName: 'Maharashtra', name: 'Pune' },
      { id: 'mh-nagpur', stateId: 'mh', stateName: 'Maharashtra', name: 'Nagpur' },
      { id: 'mh-nashik', stateId: 'mh', stateName: 'Maharashtra', name: 'Nashik' },
      { id: 'mh-aurangabad', stateId: 'mh', stateName: 'Maharashtra', name: 'Aurangabad' },
    ]
  },
  {
    id: 'dl', name: 'Delhi', code: 'DL', type: 'union_territory', capital: 'New Delhi', region: 'North',
    districts: [
      { id: 'dl-central', stateId: 'dl', stateName: 'Delhi', name: 'Central Delhi' },
      { id: 'dl-north', stateId: 'dl', stateName: 'Delhi', name: 'North Delhi' },
      { id: 'dl-south', stateId: 'dl', stateName: 'Delhi', name: 'South Delhi' },
    ]
  },
  {
    id: 'ap', name: 'Andhra Pradesh', code: 'AP', type: 'state', capital: 'Amaravati', region: 'South',
    districts: [
      { id: 'ap-visakhapatnam', stateId: 'ap', stateName: 'Andhra Pradesh', name: 'Visakhapatnam' },
      { id: 'ap-vijayawada', stateId: 'ap', stateName: 'Andhra Pradesh', name: 'Vijayawada' },
      { id: 'ap-guntur', stateId: 'ap', stateName: 'Andhra Pradesh', name: 'Guntur' },
      { id: 'ap-tirupati', stateId: 'ap', stateName: 'Andhra Pradesh', name: 'Tirupati' },
    ]
  },
  {
    id: 'ts', name: 'Telangana', code: 'TS', type: 'state', capital: 'Hyderabad', region: 'South',
    districts: [
      { id: 'ts-hyderabad', stateId: 'ts', stateName: 'Telangana', name: 'Hyderabad' },
      { id: 'ts-warangal', stateId: 'ts', stateName: 'Telangana', name: 'Warangal' },
      { id: 'ts-khammam', stateId: 'ts', stateName: 'Telangana', name: 'Khammam' },
    ]
  },
  {
    id: 'rj', name: 'Rajasthan', code: 'RJ', type: 'state', capital: 'Jaipur', region: 'North',
    districts: [
      { id: 'rj-jaipur', stateId: 'rj', stateName: 'Rajasthan', name: 'Jaipur' },
      { id: 'rj-jodhpur', stateId: 'rj', stateName: 'Rajasthan', name: 'Jodhpur' },
      { id: 'rj-udaipur', stateId: 'rj', stateName: 'Rajasthan', name: 'Udaipur' },
    ]
  },
  {
    id: 'gj', name: 'Gujarat', code: 'GJ', type: 'state', capital: 'Gandhinagar', region: 'West',
    districts: [
      { id: 'gj-ahmedabad', stateId: 'gj', stateName: 'Gujarat', name: 'Ahmedabad' },
      { id: 'gj-surat', stateId: 'gj', stateName: 'Gujarat', name: 'Surat' },
      { id: 'gj-vadodara', stateId: 'gj', stateName: 'Gujarat', name: 'Vadodara' },
    ]
  },
  {
    id: 'wb', name: 'West Bengal', code: 'WB', type: 'state', capital: 'Kolkata', region: 'East',
    districts: [
      { id: 'wb-kolkata', stateId: 'wb', stateName: 'West Bengal', name: 'Kolkata' },
      { id: 'wb-howrah', stateId: 'wb', stateName: 'West Bengal', name: 'Howrah' },
      { id: 'wb-darjeeling', stateId: 'wb', stateName: 'West Bengal', name: 'Darjeeling' },
    ]
  },
  {
    id: 'up', name: 'Uttar Pradesh', code: 'UP', type: 'state', capital: 'Lucknow', region: 'North',
    districts: [
      { id: 'up-lucknow', stateId: 'up', stateName: 'Uttar Pradesh', name: 'Lucknow' },
      { id: 'up-kanpur', stateId: 'up', stateName: 'Uttar Pradesh', name: 'Kanpur' },
      { id: 'up-varanasi', stateId: 'up', stateName: 'Uttar Pradesh', name: 'Varanasi' },
      { id: 'up-agra', stateId: 'up', stateName: 'Uttar Pradesh', name: 'Agra' },
    ]
  },
]

export function getStateById(id: string): IndiaState | undefined {
  return INDIA_STATES.find(s => s.id === id)
}

export function getDistrictById(districtId: string): District | undefined {
  for (const state of INDIA_STATES) {
    const d = state.districts.find(d => d.id === districtId)
    if (d) return d
  }
  return undefined
}

export function getAllDistricts(): District[] {
  return INDIA_STATES.flatMap(s => s.districts)
}
