import { useEffect, useState } from 'react';

interface CalloutProps {
  position: [number, number, number];
  label: string;
  description: string;
  id: string;
  isVisible: boolean;
  delay: number;
}

export default function Callout({ position, label, description, isVisible, delay }: CalloutProps) {
  // Callouts désactivés: l'utilisateur ne les voit pas et veut retirer les points.
  void position;
  void label;
  void description;
  void isVisible;
  void delay;

  return null;

  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShow(true), delay);
      return () => clearTimeout(timer);
    }
    setShow(false);
  }, [isVisible, delay]);

  if (!isVisible || !show) return null;

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial emissive="#4A90A4" emissiveIntensity={1.25} color="#ffffff" />
      </mesh>
    </group>
  );
}
