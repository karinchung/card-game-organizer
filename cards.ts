// Card type definitions
interface Card {
    name: string;
    tier: Tier;
    cost: string;
    effect: string;
    effect_values: {
      food: number;
      trash: number;
      vp: number;
    };
    keywords: Keyword[];
    resourceType: ResourceType[];
    cardType: CardType;
    flavor: string;
    quantity: number;
  }
  
  // Enums for type safety
  type Tier = "Basic" | "Tier 1" | "Tier 2" | "Tier 3";
  
  type Keyword = "Stackable" | "Shiny" | "Spiritual" | "Friend" | "Metal";
  
  type ResourceType = "Food" | "Trash";
  
  type CardType = "Resource" | "Den" | "";
  
  // Function to add a new card
  function createCard(cardData: Partial<Card>): Card {
    // Default values for required fields
    const defaultCard: Card = {
      name: "",
      tier: "Basic",
      cost: "0",
      effect: "",
      effect_values: {
        food: 0,
        trash: 0,
        vp: 0
      },
      keywords: [],
      resourceType: [],
      cardType: "",
      flavor: "",
      quantity: 1
    };
  
    // Merge provided data with defaults
    const newCard: Card = {
      ...defaultCard,
      ...cardData
    };
  
    // Validation
    if (!newCard.name) {
      throw new Error("Card name is required");
    }
  
    return newCard;
  }
  
  // Example usage:
  function addCardToDatabase(card: Card, database: { cards: Card[] }) {
    database.cards.push(card);
  }
  
  // Example usage:
  const newCard = createCard({
    name: "Dumpster Dive",
    tier: "Basic",
    cost: "0",
    effect: "1 Food, 1 Trash",
    resourceType: ["Food", "Trash"],
    cardType: "Resource",
    quantity: 20
  });
  
  // Using the function with type checking
  const database = { cards: [] };
  addCardToDatabase(newCard, database);