/**
 * Sample state markers for the mission map.
 *
 * These are DEMONSTRATION data, not real mission activity — they exist so the
 * map shows a plausible national spread before enough real posts have been
 * created. They render in a muted outline style and are counted separately in
 * the map header, so a sample dot can never be mistaken for a located post.
 *
 * Coordinates are the state's principal city, which is where a dot for that
 * state naturally reads. Real posts always place their own dot from the
 * photo's coordinates and take precedence: when a state has real posts, its
 * sample marker is suppressed.
 */

export interface SampleStateMarker {
  stateName: string
  /** Principal city the dot sits on. */
  city: string
  latitude: number
  longitude: number
  /** Illustrative activity count for the state. */
  count: number
}

export const SAMPLE_STATE_MARKERS: SampleStateMarker[] = [
  { stateName: 'Tamil Nadu', city: 'Chennai', latitude: 13.0827, longitude: 80.2707, count: 12 },
  { stateName: 'Delhi', city: 'New Delhi', latitude: 28.6139, longitude: 77.209, count: 5 },
  { stateName: 'Rajasthan', city: 'Jaipur', latitude: 26.9124, longitude: 75.7873, count: 4 },
  { stateName: 'Maharashtra', city: 'Mumbai', latitude: 19.076, longitude: 72.8777, count: 7 },
  { stateName: 'Karnataka', city: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, count: 6 },
  { stateName: 'Telangana', city: 'Hyderabad', latitude: 17.385, longitude: 78.4867, count: 3 },
  { stateName: 'West Bengal', city: 'Kolkata', latitude: 22.5726, longitude: 88.3639, count: 3 },
  { stateName: 'Gujarat', city: 'Ahmedabad', latitude: 23.0225, longitude: 72.5714, count: 4 },
  { stateName: 'Uttar Pradesh', city: 'Lucknow', latitude: 26.8467, longitude: 80.9462, count: 5 },
  { stateName: 'Kerala', city: 'Thiruvananthapuram', latitude: 8.5241, longitude: 76.9366, count: 2 },
  { stateName: 'Madhya Pradesh', city: 'Bhopal', latitude: 23.2599, longitude: 77.4126, count: 2 },
  { stateName: 'Assam', city: 'Guwahati', latitude: 26.1445, longitude: 91.7362, count: 1 },
]
