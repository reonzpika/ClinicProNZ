'use client';

import { TrafficLightStructured } from './TrafficLightStructured';
import { TRAFFIC_LIGHT_DOCUMENT } from '../lib/traffic-light-data';

export function TrafficLightContent() {
  return <TrafficLightStructured document={TRAFFIC_LIGHT_DOCUMENT} />;
}
