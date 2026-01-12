export interface WeaponSpec {
  name: string;
  type: string;
  modelPath: string;
  story: string;
  specs: {
    label: string;
    value: string;
  }[];
  callouts: {
    id: string;
    label: string;
    description: string;
    position: [number, number, number];
  }[];
}

