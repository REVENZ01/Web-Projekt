import axios from "axios";
import { getAuthValue } from "./Header"; // Importiert die Funktion zur Erzeugung des Auth-Headers

/**
 * seedCustomers
 * Funktion zum Seeden der Testkunden.
 * Sendet eine POST-Anfrage an den Endpunkt "/customers/seed" mit einem leeren Objekt als Body.
 * Gibt die Antwort des Servers zurück.
 *
 * @param {string} userGroup - Die Benutzergruppe zur Authentifizierung.
 * @returns {Promise<Object>} Die Antwortdaten vom Server.
 */
export const seedCustomers = async (userGroup) => {
  const authValue = getAuthValue(userGroup);
  try {
    const response = await axios.post(
      "http://localhost:8080/customers/seed",
      {},
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

/**
 * seedOffers
 * Funktion zum Seeden der Testangebote.
 * Sendet eine POST-Anfrage an den Endpunkt "/offers/seed" mit einem leeren Objekt als Body.
 * Gibt die Antwort des Servers zurück.
 *
 * @param {string} userGroup - Die Benutzergruppe zur Authentifizierung.
 * @returns {Promise<Object>} Die Antwortdaten vom Server.
 */
export const seedOffers = async (userGroup) => {
  const authValue = getAuthValue(userGroup);
  try {
    const response = await axios.post(
      "http://localhost:8080/offers/seed",
      {},
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

/**
 * seedAllData
 * Kombinierte Funktion zum gleichzeitigen Ausführen von seedCustomers und seedOffers.
 * Nutzt Promise.all, um beide Endpunkte parallel anzusprechen und gibt ein Objekt
 * zurück, das die Daten beider Operationen enthält.
 *
 * @param {string} userGroup - Die Benutzergruppe zur Authentifizierung.
 * @returns {Promise<Object>} Ein Objekt mit den Daten für Kunden und Angebote.
 */
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
