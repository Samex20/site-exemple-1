import { WeaponSpec } from '../types/weapon';

export const weapons: WeaponSpec[] = [
  {
    name: 'AURORA-7 DMR',
    type: 'Precision rifle / marksman system',
    modelPath: '/models/w1/scene.gltf',
    story: 'AURORA-7 is the field\'s ultimate precision platform. Built for cold environments, long-range control, and zero signature recoil.',
    specs: [
      { label: 'Range', value: '1,400 m effective' },
      { label: 'Muzzle signature', value: 'suppressed / low flash' },
      { label: 'Stabilization', value: 'gyroscopic recoil compensation' },
      { label: 'Ammunition', value: '8.3mm smart-core rounds' },
      { label: 'Optics', value: 'multi-spectrum scope + thermal overlay' },
    ],
    callouts: [
      {
        id: 'optics',
        label: 'MULTI-SPECTRUM OPTICS MODULE',
        description: 'Advanced targeting system',
        position: [0.5, 0.8, 0.3],
      },
      {
        id: 'suppressor',
        label: 'SILENT SUPPRESSOR SYSTEM',
        description: 'Zero signature operation',
        position: [-0.6, 0.2, 0.1],
      },
      {
        id: 'stabilizer',
        label: 'RECOIL STABILIZER CORE',
        description: 'Gyroscopic compensation',
        position: [0.2, 0.1, 0.4],
      },
      {
        id: 'cooling',
        label: 'COOLING BARREL SHEATH',
        description: 'Thermal management',
        position: [-0.3, 0.4, 0.2],
      },
      {
        id: 'magazine',
        label: 'SMART MAGAZINE FEED',
        description: 'Ammunition delivery system',
        position: [0.1, -0.5, 0.2],
      },
    ],
  },
  {
    name: 'VOLTCRAFTER MK-II',
    type: 'Heavy experimental energy cannon',
    modelPath: '/models/w2/scene.gltf',
    story: 'VOLTCRAFTER is a brutal prototype weapon. Not elegant — unstoppable. Built like a machine, it channels electromagnetic bursts through a copper coil reactor.',
    specs: [
      { label: 'Energy type', value: 'electromagnetic discharge' },
      { label: 'Output', value: '7800 joules per shot' },
      { label: 'Reactor', value: 'copper coil capacitor' },
      { label: 'Overheat', value: 'thermal dump required every 9 shots' },
      { label: 'Mode', value: 'burst / charged strike' },
    ],
    callouts: [
      {
        id: 'capacitor',
        label: 'COPPER COIL CAPACITOR',
        description: 'Energy storage system',
        position: [0.4, 0.6, 0.2],
      },
      {
        id: 'core',
        label: 'MAGNETIC DISCHARGE CORE',
        description: 'Primary firing mechanism',
        position: [0.0, 0.3, 0.5],
      },
      {
        id: 'regulator',
        label: 'ENERGY REGULATOR',
        description: 'Power flow control',
        position: [-0.4, 0.5, 0.1],
      },
      {
        id: 'exhaust',
        label: 'THERMAL DUMP EXHAUST',
        description: 'Overheat management',
        position: [-0.6, -0.2, 0.3],
      },
      {
        id: 'circuit',
        label: 'HIGH-VOLTAGE CIRCUIT LINE',
        description: 'Energy distribution',
        position: [0.5, 0.0, 0.4],
      },
    ],
  },
  {
    name: 'SENTINEL-X PLATFORM',
    type: 'Modular defense prototype',
    modelPath: '/models/w3/scene.gltf',
    story: 'SENTINEL-X is designed to be deployed anywhere. A modular platform weapon that can switch between tactical modes and sync with battlefield HUD systems.',
    specs: [
      { label: 'AI Assisted targeting', value: 'ON-DEVICE' },
      { label: 'Modes', value: 'assault / stabilization / suppression' },
      { label: 'Frame', value: 'modular reinforced alloy' },
      { label: 'Systems', value: 'battlefield telemetry sync' },
      { label: 'Safety', value: 'biometric arming lock' },
    ],
    callouts: [
      {
        id: 'lock',
        label: 'BIOMETRIC ARMING LOCK',
        description: 'Security system',
        position: [0.3, 0.7, 0.2],
      },
      {
        id: 'telemetry',
        label: 'TACTICAL TELEMETRY SYNC',
        description: 'Battlefield integration',
        position: [-0.4, 0.6, 0.3],
      },
      {
        id: 'frame',
        label: 'MODULAR FRAME JOINT',
        description: 'Configurable structure',
        position: [0.5, 0.2, 0.4],
      },
      {
        id: 'processor',
        label: 'AI TARGETING PROCESSOR',
        description: 'On-device intelligence',
        position: [0.0, 0.4, 0.5],
      },
      {
        id: 'chassis',
        label: 'REINFORCED ALLOY CHASSIS',
        description: 'Durability system',
        position: [-0.3, -0.3, 0.3],
      },
    ],
  },
];

