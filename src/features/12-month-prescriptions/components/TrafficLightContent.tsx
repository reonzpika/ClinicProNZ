'use client';

import { TRAFFIC_LIGHT_DOCUMENT } from '../lib/traffic-light-data';
import { TrafficLightStructured } from './TrafficLightStructured';

export function TrafficLightContent() {
  return <TrafficLightStructured document={TRAFFIC_LIGHT_DOCUMENT} />;
}
