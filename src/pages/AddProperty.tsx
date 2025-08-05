import Header from "@/components/layout/Header";
import { PropertyListingFlow } from "@/components/PropertyListingFlow";

const AddProperty = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PropertyListingFlow />
    </div>
  );
};

export default AddProperty;