import axios from "axios";
import { getAuthValue } from "./Header"; // Importiert die Funktion zur Erzeugung des Auth-Headers

// Funktion zum Seeden der Testkunden
export const seedCustomers = async (userGroup) => {
  const authValue = getAuthValue(userGroup);
  try {
    const response = await axios.post(
      "http://localhost:8080/customers/seed",
      {}, // statt null ein leeres Objekt senden
      {
        headers: {
          Authorization: authValue,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error seeding customers:", error);
    throw error;
  }
};

// Funktion zum Seeden der Testangebote
export const seedOffers = async (userGroup) => {
  const authValue = getAuthValue(userGroup);
  try {
    const response = await axios.post(
      "http://localhost:8080/offers/seed",
      {}, // statt null ein leeres Objekt senden
      {
        headers: {
          Authorization: authValue,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error seeding offers:", error);
    throw error;
  }
};

// Kombinierte Funktion, um beide Endpunkte gleichzeitig aufzurufen
export const seedAllData = async (userGroup) => {
  try {
    const [customersData, offersData] = await Promise.all([
      seedCustomers(userGroup),
      seedOffers(userGroup),
    ]);
    return { customersData, offersData };
  } catch (error) {
    console.error("Error seeding all data:", error);
    throw error;
  }
};
