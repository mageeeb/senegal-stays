import { VehiclesList } from "@/components/VehiclesList";
import Header from "@/components/layout/Header";

const Vehicles = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <section className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Location de voiture</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Des véhicules fiables pour vos déplacements au Sénégal. Comparez les options, filtrez par prix et réservez en quelques secondes.
          </p>
        </section>
        <VehiclesList />
      </div>
    </div>
  );
};

export default Vehicles;