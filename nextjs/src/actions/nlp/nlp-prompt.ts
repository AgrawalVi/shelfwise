export const NLP_PROMPT = `
Based upon user's input you have to decide upon 3 actions, whether the user is saying that the got a new item(s), they want to edit an existing item or they want to say the are out or prompts.
Example Inputs:

>>"I got bananas"
>>"I bought rice and bananas"
>>"Purchased rice, beans, cornflakes that all expire tomorrow"
>>"I got a new pack of rice cakes that expires on 3rd december"
>>"I bought salt, oil, flour, milk, and the milk expires 2 weeks from now"
>>"Bought honey"

such inputs indicate that user is trying to use an "ADD" function all the above prompts can be understood as below
"ADD; bananas: estimate expiry date"
"ADD; rice:  estimate expiry date, bananas: estimate expiry date"
"ADD; rice: tomorrow, beans: tomorrow, cornflakes: tomorrow"
"ADD; rice cakes: 3rd Dec"
"ADD; salt: doesn't expire, oil: estimate expir date, flour: estimate expire date, milk: 2 weeks from now"
"ADD: honey: doesn't expire"

for every product, you have, to see if the user has added an expiry date, if not then you have to either estimate or say it doesn't expire

user can also use the edit function, it can be something like:

>>"Change bananas expiry date to tomorrow"
>>"Remove expiry date from rice"
>>"Update chicken's expiry date to Dec 1"
>>"Chicken broth expires on 5th Sept 2023 and apples expire tomorrow"

these can be interpreted as:

"EDIT; bananas: tomorrow"
"EDIT; rice: null"
"EDIT; chicken: Dec 1"
"EDIT; Chicken broth: 5th Sept, apples: tomorrow"

For both add and edit functions return a string formatted as "Command; item: expiry date, item: expiry data"
command can be ADD, EDIT
item is the item the user mentions
the expiry date can be a date given by user, estimated date, or null. Date has to be formatted as MM-DD-YYYY. null can only be set while editing

users can also delete item:

>>"out of bananas"
>>"ran out of rice"
>>"no more rice, beans and chicken left"
>>"little flour left, out of chicken broth"

these can be interpreted as:

"DELETE; bananas"
"DELETE; rice"
"DELETE; rice, beans, chicken"
"DELETE; chicken broth"

you have to understand which ingredients or items are finished and then return a string formatted as: "DELETE, item name"

You have to decide whether it is edit, delete, or add, and then appropriately add the item names and along with them a date or null(only if it's edit) if they are add or edit.
Don't say anything else just return the string and no extra information, make sure everything is well formatted, separate add, delete and edits with newlines

one final example:
"I purchased chicken today which expires next week, I also purchased bananas, honey and apples and I ran out of tomatoes, also change the expiry date of beef to next week"
expected result:
"ADD; chicken: 11-16-2024, bananas: 11-14-2024, honey: null, apples: 11-14-2024"
"DELETE; tomatoes"
"EDIT; beef: 11-16-2024"

Return the string for the following command by the user:
`;