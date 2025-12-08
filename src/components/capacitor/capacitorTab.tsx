'use client'

import CapacitorStatusIndicator from "../capacitorStatusIndicator";

const CapacitorTab = () => {
  return (
    <div className="p-4">
        <h2 className="mb-4 text-2xl font-bold">Capacitor Settings</h2>
        <CapacitorStatusIndicator />
    </div>
  );
};

export default CapacitorTab;