# ShelfWise

## Inspiration
The idea for ShelfWise came from the everyday challenges faced by college students. Balancing academic, work, and extracurricular commitments makes it easy to forget groceries, leading to food spoilage, unnecessary expenses, and more frequent dining out. ShelfWise aims to simplify pantry management by making it fast, efficient, and budget-friendly. With a simple receipt scan or interaction with the ShelfMate smart assistant, users can keep track of their pantry, monitor expiration dates, and receive timely reminders—minimizing waste and promoting home-cooked meals without the hassle.

## What It Does
ShelfWise leverages computer vision to scan receipts and automatically add items to the user's virtual pantry, including their expiration dates. The app generates reminders for upcoming expirations, helping users reduce food waste. Additionally, ShelfWise suggests recipes based on pantry contents, with options that vary in cuisine, difficulty level, and preparation time. Users can also manage their pantry hands-free through natural language interaction with the ShelfMate smart assistant, allowing them to check items, update expirations, and discover recipes with ease.

## How We Built It
ShelfWise integrates various technologies for a seamless user experience:
- **Computer Vision**: Python, OpenCV, and Tesseract are used for the receipt-scanning feature, enabling accurate extraction of food items.
- **Backend**: FastAPI powers the API for robust communication between components, while Prisma serves as the ORM with PostgreSQL for data management.
- **Frontend**: The user interface is built with React and TypeScript for a dynamic, responsive experience. Next.js handles backend logic and coordination between services.
- **Smart Assistant**: ShelfMate is powered by OpenAI’s language model, fine-tuned with custom prompts for natural, intuitive interactions.

## Challenges We Faced
Developing ShelfWise presented several challenges:
- **Data Integration**: Ensuring seamless data flow between the API, frontend, and database was complex due to differing data types.
- **Receipt Processing**: Tuning the preprocessing algorithms for receipt scanning to achieve high accuracy was an ongoing challenge.
- **Academic Balance**: Working on the project alongside academic commitments, including exams, required careful time management.

## Accomplishments
We are proud of the complete, end-to-end functionality of ShelfWise. From the OCR-powered scanning to the NLP-based smart assistant, every component works together to create an intuitive user experience. Beyond technical success, we take pride in the app's potential to help users save money and reduce food waste.

## What We Learned
The development process highlighted the importance of understanding data type handling and conversions across different tools. Through extensive testing and debugging, we learned to manage data handoffs more effectively. This project enhanced our technical expertise and taught us the value of thorough planning and testing.

## What's Next for ShelfWise
Future enhancements include:
- **Personalized Recipe Recommendations**: Analyzing user preferences to tailor recipe suggestions based on past behavior and dietary needs.
- **Improved Computer Vision**: Enhancing the receipt-scanning model for greater accuracy with diverse formats.
- **Enhanced NLP**: Fine-tuning ShelfMate to better understand and respond to user queries.
- **Mobile App Optimization**: Expanding on the native mobile app experience to make pantry management even more accessible on the go.

---

We hope ShelfWise makes pantry management simpler and more efficient, helping users save money and reduce waste!
