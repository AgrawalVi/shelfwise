export type GroceryItem = {
  name: string;
  perishable: boolean;
  expirationDate?: Date;
};

export type ProcessedItem = {
  action: nlpActions;
  itemId: number | null; 
  groceryItem: GroceryItem;
};

export enum nlpActions {
  ADD,
  EDIT,
  DELETE
}
