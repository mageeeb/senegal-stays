import { VehiclesList } from "@/components/VehiclesList";
import Header from "@/components/layout/Header";

const Vehicles = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <VehiclesList />
      </div>
    </div>
  );
};

export default Vehicles;