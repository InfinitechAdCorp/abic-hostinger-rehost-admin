"use client";

import { Tabs, Tab, Card, CardBody } from "@heroui/react";
import PropertyDetails from "./property-deets-card";
import PropertyEdit from "./property-edit";
import { useState } from "react";

interface PropertyDetailsTabsProps {
  property_id: string;
}

const PropertyDetailsTabs: React.FC<PropertyDetailsTabsProps> = ({ property_id }) => {
  const [selectedTab, setSelectedTab] = useState("details");

  return (
    <section className="py-12 px-4 md:px-12">
      <Tabs
        aria-label="Options"
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
      >
        <Tab key="details" title="Property Details">
          <PropertyDetails property_id={property_id} />
        </Tab>
        <Tab key="update" title="Update Property">
          <PropertyEdit
            property_id={property_id}
            onSuccess={() => setSelectedTab("details")} // callback from child
          />
        </Tab>
      </Tabs>
    </section>
  );
};

export default PropertyDetailsTabs;
